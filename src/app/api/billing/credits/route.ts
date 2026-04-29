import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/billing/credits
 * Returns current balance + recent transaction history.
 * Query params:
 *   ?limit=20  (default 20, max 100)
 *   ?offset=0  (for pagination)
 */
export async function GET(request: NextRequest) {
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

    // 2. Parse pagination params
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);

    // 3. Get credit balance
    const { data: credit } = await supabase
      .from('credits')
      .select('balance, cap, frozen_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const balance = credit?.balance ?? 0;
    const cap = credit?.cap ?? 2000;
    const frozenAt = credit?.frozen_at ?? null;

    // 4. Get transaction history
    const { data: transactions, count } = await supabase
      .from('credit_transactions')
      .select('id, type, amount, reason, balance_after, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      balance,
      cap,
      frozen: frozenAt !== null,
      frozen_at: frozenAt,
      transactions: transactions ?? [],
      pagination: {
        total: count ?? 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[credits] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
