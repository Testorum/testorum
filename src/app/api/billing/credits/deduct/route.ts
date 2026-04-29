import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CREDIT_COSTS, type DeductCreditsResult } from '@/types/billing';

type CreditAction = keyof typeof CREDIT_COSTS;

const ALLOWED_ACTIONS: CreditAction[] = [
  'deep_analysis',
  'hd_result_card',
  'compatibility_comparison',
];

/**
 * POST /api/billing/credits/deduct
 * Body: { action: "deep_analysis" | "hd_result_card" | "compatibility_comparison" }
 */
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

    const { action } = body as { action?: string };

    if (!action || !ALLOWED_ACTIONS.includes(action as CreditAction)) {
      return NextResponse.json(
        { error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const amount = CREDIT_COSTS[action as CreditAction];

    // 3. Check user has active subscription (free users can only use purchased credits)
    // This is handled implicitly: free users start with 0 balance
    // and can only have credits from purchases or referrals

    // 4. Deduct via pg function (atomic, handles all checks)
    const { data, error } = await supabaseAdmin.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_reason: action,
    });

    if (error) {
      console.error('[deduct] RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to process deduction' },
        { status: 500 }
      );
    }

    const result = data as unknown as DeductCreditsResult;

    if (!result.success) {
      const statusMap: Record<string, { status: number; message: string }> = {
        frozen: { status: 403, message: 'Credits are frozen. Resubscribe to unlock.' },
        insufficient: { status: 402, message: `Not enough credits. Need ${amount}, have ${result.current_balance ?? 0}.` },
        no_credits: { status: 402, message: 'No credit balance found. Subscribe or purchase credits.' },
      };

      const info = statusMap[result.error ?? ''] ?? { status: 400, message: result.error ?? 'Unknown error' };

      return NextResponse.json(
        {
          error: info.message,
          code: result.error,
          required: amount,
          current_balance: result.current_balance,
        },
        { status: info.status }
      );
    }

    return NextResponse.json({
      success: true,
      deducted: amount,
      new_balance: result.new_balance,
      action,
    });
  } catch (error) {
    console.error('[deduct] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
