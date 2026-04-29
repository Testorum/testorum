import { NextResponse } from 'next/server';
import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js';
import { createSupabaseServer } from '@/lib/supabase-server';
import { configureLemonSqueezy } from '@/lib/lemonsqueezy';

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

    // 2. Get user's subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('lemonsqueezy_subscription_id, customer_portal_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!sub) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // 3. Fetch fresh portal URL from LS API (cached URL expires in 24hr)
    configureLemonSqueezy();

    const lsSub = await getSubscription(Number(sub.lemonsqueezy_subscription_id));
    const portalUrl = lsSub.data?.data.attributes.urls?.customer_portal;
    const updatePaymentUrl = lsSub.data?.data.attributes.urls?.update_payment_method;

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Portal URL not available' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      portal_url: portalUrl,
      update_payment_url: updatePaymentUrl ?? null,
    });
  } catch (error) {
    console.error('[portal] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
