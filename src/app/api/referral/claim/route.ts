// ============================================================
// src/app/api/referral/claim/route.ts
// 가입 직후 레퍼럴 클레임 — 쿠키 기반 추천인 매칭 + 양방향 크레딧
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { REFERRAL_CREDITS } from '@/types';

const REFERRAL_COOKIE = 'testorum_ref';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Supabase 서버 클라이언트 (인증 필요)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 레퍼럴 쿠키 읽기
    const refCode = cookieStore.get(REFERRAL_COOKIE)?.value;
    if (!refCode) {
      return NextResponse.json(
        { error: 'No referral code found', claimed: false },
        { status: 200 } // 에러가 아님 — 단순히 레퍼럴 없이 가입한 것
      );
    }

    // 코드 검증 (8자 영숫자)
    if (!/^[A-Za-z0-9]{6,12}$/.test(refCode)) {
      return NextResponse.json(
        { error: 'Invalid referral code format', claimed: false },
        { status: 200 }
      );
    }

    // service_role 클라이언트 (RLS 바이패스 필요 — 다른 유저 profiles 조회)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 추천인 찾기 (referral_code → profiles)
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('id, referral_code')
      .eq('referral_code', refCode)
      .single();

    if (referrerError || !referrer) {
      logger.warn('referral/claim', 'Code not found: ' + refCode);
      // 쿠키 삭제
      cookieStore.delete(REFERRAL_COOKIE);
      return NextResponse.json(
        { error: 'Referral code not found', claimed: false },
        { status: 200 }
      );
    }

    // 자기 자신 추천 방지
    if (referrer.id === user.id) {
      cookieStore.delete(REFERRAL_COOKIE);
      return NextResponse.json(
        { error: 'Cannot refer yourself', claimed: false },
        { status: 200 }
      );
    }

    // 이미 레퍼럴 관계 존재 체크 (referred_id UNIQUE 제약)
    const { data: existingRef } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .limit(1)
      .single();

    if (existingRef) {
      cookieStore.delete(REFERRAL_COOKIE);
      return NextResponse.json(
        { error: 'Already referred', claimed: false },
        { status: 200 }
      );
    }

    // 레퍼럴 레코드 생성
    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        referral_code: refCode,
        status: 'pending',
        credits_awarded: true,
      });

    if (insertError) {
      // UNIQUE 위반 = 이미 존재 (race condition 방어)
      if (insertError.code === '23505') {
        cookieStore.delete(REFERRAL_COOKIE);
        return NextResponse.json(
          { error: 'Already referred', claimed: false },
          { status: 200 }
        );
      }
      logger.error('referral/claim', insertError);
      return NextResponse.json(
        { error: 'Failed to process referral' },
        { status: 500 }
      );
    }

    // 양방향 크레딧 지급
    try {
      // 추천인 +5cr
      await supabaseAdmin.rpc('add_credits', {
        p_user_id: referrer.id,
        p_amount: REFERRAL_CREDITS.SIGNUP_REFERRER,
        p_reason: 'referral_signup',
      });

      // 피추천인 +10cr
      await supabaseAdmin.rpc('add_credits', {
        p_user_id: user.id,
        p_amount: REFERRAL_CREDITS.SIGNUP_REFERRED,
        p_reason: 'referral_welcome_bonus',
      });
    } catch (creditError) {
      // 크레딧 지급 실패해도 레퍼럴 관계는 유지
      logger.error('referral/claim', creditError);
    }

    // 쿠키 삭제
    cookieStore.delete(REFERRAL_COOKIE);

    return NextResponse.json({
      claimed: true,
      credits_received: REFERRAL_CREDITS.SIGNUP_REFERRED,
      referrer_code: refCode,
    });
  } catch (err) {
    logger.error('referral/claim', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
