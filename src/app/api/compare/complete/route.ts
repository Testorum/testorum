// ============================================================
// src/app/api/compare/complete/route.ts
// 파트너 결과 기록 — 비교 세션 완료
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

function validateInput(body: unknown): {
  valid: boolean;
  data?: { session_id: string; partner_session_id: string; partner_result_id: string };
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { session_id, partner_session_id, partner_result_id } = body as Record<string, unknown>;

  // UUID 포맷 체크
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof session_id !== 'string' || !uuidRegex.test(session_id)) {
    return { valid: false, error: 'Invalid session_id' };
  }
  if (typeof partner_session_id !== 'string' || partner_session_id.length < 5 || partner_session_id.length > 100) {
    return { valid: false, error: 'Invalid partner_session_id' };
  }
  if (typeof partner_result_id !== 'string' || partner_result_id.length < 1 || partner_result_id.length > 20) {
    return { valid: false, error: 'Invalid partner_result_id' };
  }

  return {
    valid: true,
    data: {
      session_id: session_id as string,
      partner_session_id: partner_session_id as string,
      partner_result_id: partner_result_id as string,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = validateInput(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { session_id, partner_session_id, partner_result_id } = validation.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 세션 존재 + 아직 파트너 미등록 확인
    const { data: session, error: fetchError } = await supabase
      .from('compare_sessions')
      .select('id, test_slug, partner_session_id, initiator_session_id, expires_at')
      .eq('id', session_id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 만료 체크
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    // 이미 완료된 세션
    if (session.partner_session_id) {
      return NextResponse.json({
        already_completed: true,
        redirect_url: `/tests/${session.test_slug}/compare?session=${session.id}`,
      });
    }

    // 자기 자신과 비교 방지
    if (session.initiator_session_id === partner_session_id) {
      return NextResponse.json(
        { error: 'Cannot compare with yourself' },
        { status: 400 }
      );
    }

    // 파트너 결과 기록
    const { error: updateError } = await supabase
      .from('compare_sessions')
      .update({
        partner_session_id,
        partner_result_id,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session_id)
      .is('partner_session_id', null); // 동시 요청 방지

    if (updateError) {
      logger.error('compare/complete', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirect_url: `/tests/${session.test_slug}/compare?session=${session.id}`,
    });
  } catch (err) {
    logger.error('compare/complete', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
