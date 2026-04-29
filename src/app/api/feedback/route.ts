import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { validateFeedbackInput } from '@/lib/validation';
import { logger } from '@/lib/logger';

/**
 * POST /api/feedback
 *
 * 서버사이드 검증 후 Supabase에 피드백(이모지 반응) 삽입
 * - emoji: 'shocked' | 'lol' | 'think'
 * - test_slug: 테스트 식별자
 * - result_id: 결과 식별자
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 2. Validate
    const validation = validateFeedbackInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 3. Insert via server client (bypasses RLS — we've already validated)
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        test_slug: validation.data.test_slug,
        result_id: validation.data.result_id,
        emoji: validation.data.emoji,
      })
      .select('id, emoji, created_at')
      .single();

    if (error) {
      logger.error('API/feedback', error, {
        test_slug: validation.data.test_slug,
      });
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error('API/feedback/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback?test_slug=xxx&result_id=yyy
 *
 * 특정 테스트/결과의 피드백 집계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testSlug = searchParams.get('test_slug');
    const resultId = searchParams.get('result_id');

    if (!testSlug || !resultId) {
      return NextResponse.json(
        { error: 'test_slug and result_id are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('emoji')
      .eq('test_slug', testSlug)
      .eq('result_id', resultId);

    if (error) {
      logger.error('API/feedback/GET', error, { test_slug: testSlug });
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Aggregate counts
    const counts = { shocked: 0, lol: 0, think: 0 };
    for (const row of data ?? []) {
      if (row.emoji in counts) {
        counts[row.emoji as keyof typeof counts]++;
      }
    }

    return NextResponse.json({ success: true, counts });
  } catch (error) {
    logger.error('API/feedback/GET/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feedback
 *
 * 기존 피드백 삭제 (이모지 변경 시 이전 것 제거용)
 * body: { id: string }
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const { id } = body as Record<string, unknown>;

    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: 'Valid feedback id (UUID) is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('API/feedback/DELETE', error, { id });
      return NextResponse.json(
        { error: 'Failed to delete feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('API/feedback/DELETE/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
