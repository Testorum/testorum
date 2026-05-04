import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { validateCommentInput } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { isDuplicateComment } from '@/lib/rate-limit';

/**
 * POST /api/comments
 *
 * 서버사이드 검증 후 Supabase에 댓글 삽입
 * - content: 1~100자 (HTML 태그 자동 제거)
 * - test_slug / result_id: 식별자
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
    const validation = validateCommentInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 3. Duplicate check (Upstash Redis — 같은 IP+slug+result 10초 내 차단)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    try {
      const duplicate = await isDuplicateComment(
        ip,
        validation.data.test_slug,
        validation.data.result_id
      );
      if (duplicate) {
        return NextResponse.json(
          { error: 'Please wait before posting another comment' },
          { status: 429 }
        );
      }
    } catch (err) {
      // Redis 장애 시 fail-open
      logger.error('API/comments/ratelimit', err);
    }

    // 4. Insert via server client
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        test_slug: validation.data.test_slug,
        result_id: validation.data.result_id,
        content: validation.data.content,
      })
      .select('id, content, created_at')
      .single();

    if (error) {
      logger.error('API/comments', error, {
        test_slug: validation.data.test_slug,
      });
      return NextResponse.json(
        { error: 'Failed to save comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    logger.error('API/comments/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comments?test_slug=xxx&result_id=yyy
 *
 * 특정 테스트/결과의 댓글 목록 조회 (최신순 50개)
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

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('comments')
      .select('id, content, created_at')
      .eq('test_slug', testSlug)
      .eq('result_id', resultId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('API/comments/GET', error, { test_slug: testSlug });
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    logger.error('API/comments/GET/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
