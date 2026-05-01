// ============================================================
// src/app/api/compare/create/route.ts
// 비교 세션 생성 — 궁합 비교 링크 발급
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Rate limit: 간단한 in-memory (프로덕션은 Upstash Redis 권장)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // 분당 20회
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// 입력값 검증
function validateInput(body: unknown): {
  valid: boolean;
  data?: { test_slug: string; initiator_session_id: string; initiator_result_id: string };
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { test_slug, initiator_session_id, initiator_result_id } = body as Record<string, unknown>;

  if (typeof test_slug !== 'string' || !/^[a-z0-9_-]{1,50}$/.test(test_slug)) {
    return { valid: false, error: 'Invalid test_slug' };
  }
  if (typeof initiator_session_id !== 'string' || initiator_session_id.length < 5 || initiator_session_id.length > 100) {
    return { valid: false, error: 'Invalid initiator_session_id' };
  }
  if (typeof initiator_result_id !== 'string' || initiator_result_id.length < 1 || initiator_result_id.length > 20) {
    return { valid: false, error: 'Invalid initiator_result_id' };
  }

  return {
    valid: true,
    data: {
      test_slug: test_slug as string,
      initiator_session_id: initiator_session_id as string,
      initiator_result_id: initiator_result_id as string,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Body 파싱
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // 입력값 검증
    const validation = validateInput(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { test_slug, initiator_session_id, initiator_result_id } = validation.data;

    // Supabase (anon key — RLS public)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('compare/create', 'Missing Supabase env vars');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 중복 방지: 같은 initiator_session_id + test_slug로 이미 생성된 세션 확인
    const { data: existing } = await supabase
      .from('compare_sessions')
      .select('id')
      .eq('test_slug', test_slug)
      .eq('initiator_session_id', initiator_session_id)
      .is('partner_session_id', null)
      .limit(1)
      .single();

    if (existing) {
      // 기존 세션 반환 (중복 생성 방지)
      return NextResponse.json({
        session_id: existing.id,
        compare_url: `/tests/${test_slug}/compare?from=${existing.id}`,
        reused: true,
      });
    }

    // 새 세션 생성
    const { data, error } = await supabase
      .from('compare_sessions')
      .insert({
        test_slug,
        initiator_session_id,
        initiator_result_id,
      })
      .select('id')
      .single();

    if (error || !data) {
      logger.error('compare/create', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session_id: data.id,
      compare_url: `/tests/${test_slug}/compare?from=${data.id}`,
      reused: false,
    });
  } catch (err) {
    logger.error('compare/create', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
