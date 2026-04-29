import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { createSupabaseServer } from '@/lib/supabase-server';
import { configureLemonSqueezy, getStoreId } from '@/lib/lemonsqueezy';
import {
  getVariantId,
  getCreditPackVariantId,
  type SubscriptionPlan,
  type BillingInterval,
} from '@/types/billing';

const VALID_PLANS: SubscriptionPlan[] = ['pro', 'creator', 'business'];
const VALID_INTERVALS: BillingInterval[] = ['monthly', 'yearly'];

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse + validate body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { plan, interval, type } = body as {
      plan?: string;
      interval?: string;
      type?: 'subscription' | 'credit_pack';
    };

    let variantId: string;

    if (type === 'credit_pack') {
      variantId = getCreditPackVariantId();
    } else {
      // Subscription checkout
      if (!plan || !VALID_PLANS.includes(plan as SubscriptionPlan)) {
        return NextResponse.json(
          { error: 'Invalid plan. Must be: pro, creator, or business' },
          { status: 400 }
        );
      }
      if (!interval || !VALID_INTERVALS.includes(interval as BillingInterval)) {
        return NextResponse.json(
          { error: 'Invalid interval. Must be: monthly or yearly' },
          { status: 400 }
        );
      }

      // Business plan has no yearly variant
      if (plan === 'business' && interval === 'yearly') {
        return NextResponse.json(
          { error: 'Business plan is monthly only' },
          { status: 400 }
        );
      }

      variantId = getVariantId(
        plan as Exclude<SubscriptionPlan, 'free'>,
        interval as BillingInterval
      );
    }

    // 3. Check for existing active subscription (subscription type only)
    if (type !== 'credit_pack') {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'paused', 'past_due'])
        .maybeSingle();

      if (existingSub) {
        return NextResponse.json(
          { error: 'Active subscription exists. Use customer portal to change plans.' },
          { status: 409 }
        );
      }
    }

    // 4. Create checkout via LS SDK
    configureLemonSqueezy();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testorum.app';

    const checkout = await createCheckout(
      String(getStoreId()),
      Number(variantId),
      {
        checkoutOptions: {
          embed: true,
          media: false,
          logo: true,
        },
        checkoutData: {
          email: user.email ?? undefined,
          custom: {
            user_id: user.id,
          },
        },
        productOptions: {
          enabledVariants: [Number(variantId)],
          redirectUrl: `${siteUrl}/billing/success`,
          receiptButtonText: 'Back to Testorum',
          receiptThankYouNote: 'Thank you for supporting Testorum!',
        },
      }
    );

    const checkoutUrl = checkout.data?.data.attributes.url;

    if (!checkoutUrl) {
      console.error('[checkout] No URL returned from LS', checkout.error);
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[checkout] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
