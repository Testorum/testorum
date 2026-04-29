import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { PLAN_CONFIGS, CREDIT_COSTS } from '@/types/billing';

/**
 * GET /api/billing/subscription
 * Returns current subscription + plan details + credit summary.
 */
export async function GET() {
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

    // 2. Get subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status, billing_interval, current_period_end, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // 3. Get credit balance
    const { data: credit } = await supabase
      .from('credits')
      .select('balance, cap, frozen_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // 4. Build response
    const currentPlan = sub?.plan ?? 'free';
    const planConfig = PLAN_CONFIGS[currentPlan as keyof typeof PLAN_CONFIGS];

    return NextResponse.json({
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status,
            billing_interval: sub.billing_interval,
            current_period_end: sub.current_period_end,
            created_at: sub.created_at,
          }
        : null,
      plan_details: {
        name: planConfig.name,
        price_monthly: planConfig.price_monthly,
        price_yearly: planConfig.price_yearly,
        credits_monthly: planConfig.credits_monthly,
        features: planConfig.features,
      },
      credits: {
        balance: credit?.balance ?? 0,
        cap: credit?.cap ?? 2000,
        frozen: credit?.frozen_at !== null && credit?.frozen_at !== undefined,
      },
      credit_costs: CREDIT_COSTS,
    });
  } catch (error) {
    console.error('[subscription] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
