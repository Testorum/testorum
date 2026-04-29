import { supabaseAdmin } from '@/lib/supabase-admin';
import { PLAN_CONFIGS, type SubscriptionPlan } from '@/types/billing';

// ---------------------------------------------------------------------------
// Variant ID → Plan mapping (reverse lookup)
// ---------------------------------------------------------------------------

const VARIANT_TO_PLAN: Record<string, { plan: SubscriptionPlan; interval: 'monthly' | 'yearly' }> = {};

function buildVariantMap() {
  if (Object.keys(VARIANT_TO_PLAN).length > 0) return;

  const entries: Array<{
    plan: SubscriptionPlan;
    interval: 'monthly' | 'yearly';
    envKey: string;
  }> = [
    { plan: 'pro', interval: 'monthly', envKey: 'LEMONSQUEEZY_VARIANT_PRO_MONTHLY' },
    { plan: 'pro', interval: 'yearly', envKey: 'LEMONSQUEEZY_VARIANT_PRO_YEARLY' },
    { plan: 'creator', interval: 'monthly', envKey: 'LEMONSQUEEZY_VARIANT_CREATOR_MONTHLY' },
    { plan: 'creator', interval: 'yearly', envKey: 'LEMONSQUEEZY_VARIANT_CREATOR_YEARLY' },
    { plan: 'business', interval: 'monthly', envKey: 'LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY' },
  ];

  for (const e of entries) {
    const vid = process.env[e.envKey];
    if (vid) VARIANT_TO_PLAN[vid] = { plan: e.plan, interval: e.interval };
  }
}

export function resolvePlanFromVariant(variantId: string) {
  buildVariantMap();
  return VARIANT_TO_PLAN[variantId] ?? null;
}

// ---------------------------------------------------------------------------
// Idempotency check
// ---------------------------------------------------------------------------

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('lemonsqueezy_events')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle();

  return data !== null;
}

export async function markEventProcessed(eventId: string, eventType: string) {
  await supabaseAdmin
    .from('lemonsqueezy_events')
    .insert({ event_id: eventId, event_type: eventType });
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * order_created — record payment
 * Fires for both subscription first payment and one-time credit pack purchase.
 */
export async function handleOrderCreated(payload: Record<string, unknown>) {
  const attrs = payload as Record<string, unknown>;
  const meta = (payload as { meta?: { custom_data?: { user_id?: string } } }).meta;
  const userId = meta?.custom_data?.user_id;
  if (!userId) {
    console.error('[webhook] order_created: missing user_id in custom_data');
    return;
  }

  const orderId = String(attrs.id ?? attrs.order_number ?? '');
  const totalUsd = Number(attrs.total ?? 0); // cents
  const firstItem = (attrs.first_order_item as Record<string, unknown>) ?? {};
  const variantId = String(firstItem.variant_id ?? '');

  // Determine if this is a credit pack purchase
  const creditPackVariant = process.env.LEMONSQUEEZY_VARIANT_CREDIT_PACK;
  const isCreditPack = creditPackVariant && variantId === creditPackVariant;

  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    lemonsqueezy_order_id: orderId,
    payment_type: isCreditPack ? 'credit_purchase' : 'subscription',
    amount_usd: totalUsd,
    status: 'completed',
    variant_id: variantId,
  });

  // Credit pack → add 50 credits immediately
  if (isCreditPack) {
    await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_amount: 50,
      p_type: 'purchase',
      p_desc: `Credit pack purchase (order ${orderId})`,
    });
  }
}

/**
 * subscription_created — create subscription row + initial credit refill
 */
export async function handleSubscriptionCreated(
  data: Record<string, unknown>,
  meta: { custom_data?: { user_id?: string } }
) {
  const userId = meta.custom_data?.user_id;
  if (!userId) {
    console.error('[webhook] subscription_created: missing user_id');
    return;
  }

  const attrs = data as Record<string, unknown>;
  const lsSubId = String(attrs.id ?? '');
  const variantId = String(attrs.variant_id ?? '');
  const status = String(attrs.status ?? 'active');
  const renewsAt = attrs.renews_at ? String(attrs.renews_at) : null;
  const urls = attrs.urls as { customer_portal?: string } | undefined;
  const customerPortalUrl = urls?.customer_portal ?? null;
  const customerId = String(attrs.customer_id ?? '');

  const planInfo = resolvePlanFromVariant(variantId);
  if (!planInfo) {
    console.error(`[webhook] subscription_created: unknown variant ${variantId}`);
    return;
  }

  // Upsert subscription (handles race conditions)
  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      lemonsqueezy_subscription_id: lsSubId,
      plan: planInfo.plan,
      variant_id: variantId,
      status,
      billing_interval: planInfo.interval,
      current_period_end: renewsAt,
      customer_portal_url: customerPortalUrl,
    },
    { onConflict: 'user_id' }
  );

  // Store LS customer ID in profile
  if (customerId) {
    await supabaseAdmin
      .from('profiles')
      .update({ lemonsqueezy_customer_id: customerId })
      .eq('id', userId);
  }

  // Unfreeze credits if previously frozen (re-subscribe within 90 days)
  await supabaseAdmin
    .from('credits')
    .update({ frozen_at: null })
    .eq('user_id', userId)
    .not('frozen_at', 'is', null);

  // Initial credit refill
  const monthlyCredits = PLAN_CONFIGS[planInfo.plan].credits_monthly;
  if (monthlyCredits > 0) {
    await supabaseAdmin.rpc('add_credits', {
      p_user_id: userId,
      p_amount: monthlyCredits,
      p_type: 'refill',
      p_desc: `${planInfo.plan} subscription activated`,
    });
  }
}

/**
 * subscription_updated — plan change / status change
 */
export async function handleSubscriptionUpdated(
  data: Record<string, unknown>,
  meta: { custom_data?: { user_id?: string } }
) {
  const attrs = data as Record<string, unknown>;
  const lsSubId = String(attrs.id ?? '');
  const variantId = String(attrs.variant_id ?? '');
  const status = String(attrs.status ?? '');
  const renewsAt = attrs.renews_at ? String(attrs.renews_at) : null;
  const endsAt = attrs.ends_at ? String(attrs.ends_at) : null;
  const urls = attrs.urls as { customer_portal?: string } | undefined;
  const customerPortalUrl = urls?.customer_portal ?? null;

  const planInfo = resolvePlanFromVariant(variantId);

  const updateData: Record<string, unknown> = {
    status,
    variant_id: variantId,
    current_period_end: renewsAt ?? endsAt,
    customer_portal_url: customerPortalUrl,
    updated_at: new Date().toISOString(),
  };

  if (planInfo) {
    updateData.plan = planInfo.plan;
    updateData.billing_interval = planInfo.interval;
  }

  await supabaseAdmin
    .from('subscriptions')
    .update(updateData)
    .eq('lemonsqueezy_subscription_id', lsSubId);
}

/**
 * subscription_payment_success — monthly credit refill
 */
export async function handlePaymentSuccess(
  data: Record<string, unknown>,
  meta: { custom_data?: { user_id?: string } }
) {
  const attrs = data as Record<string, unknown>;
  const lsSubId = String(attrs.subscription_id ?? attrs.id ?? '');

  // Look up user from subscription
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, plan')
    .eq('lemonsqueezy_subscription_id', lsSubId)
    .maybeSingle();

  if (!sub) {
    console.error(`[webhook] payment_success: subscription ${lsSubId} not found`);
    return;
  }

  const plan = sub.plan as SubscriptionPlan;
  const monthlyCredits = PLAN_CONFIGS[plan].credits_monthly;

  if (monthlyCredits > 0) {
    await supabaseAdmin.rpc('add_credits', {
      p_user_id: sub.user_id,
      p_amount: monthlyCredits,
      p_type: 'refill',
      p_desc: `Monthly refill (${plan})`,
    });
  }
}

/**
 * subscription_expired — freeze credits
 */
export async function handleSubscriptionExpired(
  data: Record<string, unknown>,
  meta: { custom_data?: { user_id?: string } }
) {
  const attrs = data as Record<string, unknown>;
  const lsSubId = String(attrs.id ?? '');

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('lemonsqueezy_subscription_id', lsSubId);

  // Freeze credits
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('lemonsqueezy_subscription_id', lsSubId)
    .maybeSingle();

  if (sub) {
    await supabaseAdmin
      .from('credits')
      .update({ frozen_at: new Date().toISOString() })
      .eq('user_id', sub.user_id);
  }
}
