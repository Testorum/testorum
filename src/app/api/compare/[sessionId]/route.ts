// ============================================================
// src/app/api/compare/[sessionId]/route.ts
// 비교 결과 조회 — 궁합 계산 + 양쪽 유형 정보 반환
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateCompatibility } from '@/lib/compatibility';
import { getTestDataRaw } from '@/lib/tests';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // UUID 포맷 체크
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    // locale 파라미터
    const locale = request.nextUrl.searchParams.get('locale') ?? 'en';
    const validLocale = ['en', 'ko'].includes(locale) ? locale : 'en';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 세션 조회
    const { data: session, error } = await supabase
      .from('compare_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 아직 파트너가 완료하지 않은 경우
    if (!session.partner_session_id || !session.partner_result_id) {
      return NextResponse.json({
        status: 'waiting',
        test_slug: session.test_slug,
        message: 'Waiting for partner to complete the test',
      });
    }

    // 테스트 데이터 로드 (Raw — locale_data 구조)
    const testDataRaw = await getTestDataRaw(session.test_slug);
    if (!testDataRaw) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // 양쪽 결과 유형 찾기
    const initiatorResult = testDataRaw.results.find(
      (r: { id: string }) => r.id === session.initiator_result_id
    );
    const partnerResult = testDataRaw.results.find(
      (r: { id: string }) => r.id === session.partner_result_id
    );

    if (!initiatorResult || !partnerResult) {
      return NextResponse.json(
        { error: 'Result type not found in test data' },
        { status: 404 }
      );
    }

    // locale 기반 데이터 추출 헬퍼
    const getLocaleField = (
      result: Record<string, unknown>,
      field: string
    ): string => {
      const ld = result.locale_data as Record<string, Record<string, unknown>> | undefined
      return (
        String(ld?.[validLocale]?.[field] ?? ld?.["en"]?.[field] ?? "")
      )
    }

    // 궁합 계산
    const compatibility = calculateCompatibility(
      initiatorResult as any,
      partnerResult as any,
      validLocale
    );

    // 응답 조립
    const response = {
      session: {
        id: session.id,
        test_slug: session.test_slug,
        completed_at: session.completed_at,
      },
      initiator: {
        resultId: session.initiator_result_id,
        typeName: getLocaleField(initiatorResult as any, 'title'),
        emojiCombo: initiatorResult.emojiCombo ?? '🎭',
        description: getLocaleField(initiatorResult as any, 'description'),
      },
      partner: {
        resultId: session.partner_result_id,
        typeName: getLocaleField(partnerResult as any, 'title'),
        emojiCombo: partnerResult.emojiCombo ?? '🎭',
        description: getLocaleField(partnerResult as any, 'description'),
      },
      compatibility: {
        score: compatibility.score,
        grade: compatibility.grade,
        gradeLabel: compatibility.gradeLabel,
        // highlights는 유료 — 프론트에서 PaywallGate로 감쌈
        // 하지만 API에서는 전체 반환 (프론트에서 분리)
        highlights: compatibility.highlights,
      },
    };

    // Cache (5분 — 완료된 결과는 불변)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    logger.error('compare/fetch', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
