// ============================================================
// src/app/api/referral/stats/route.ts
// 추천인의 레퍼럴 현황 — 프로필 ReferralTab용
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import {
  REFERRAL_MILESTONES,
  REFERRAL_CREDITS,
  type ReferralStats,
  type ReferralFriendSummary,
  type ReferralMilestone,
  type ReferralStatus,
} from '@/types';

// 마일스톤 보상 라벨 (i18n은 프론트에서 처리)
const MILESTONE_REWARD_LABELS: Record<string, string> = {
  pro_1month: 'Pro 1 month free',
  creator_1month: 'Creator 1 month free',
  pro_3months: 'Pro 3 months free',
  pro_lifetime: 'Lifetime Pro',
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

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

    // 내가 추천한 모든 레퍼럴 조회
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('id, status, created_at, activated_at, converted_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('referral/stats', error);
      return NextResponse.json(
        { error: 'Failed to fetch referral data' },
        { status: 500 }
      );
    }

    const refs = referrals ?? [];

    // 상태별 카운트
    const statusCounts = {
      pending: 0,
      activated: 0,
      converted: 0,
      expired: 0,
    };

    for (const ref of refs) {
      const status = ref.status as ReferralStatus;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    }

    // 총 크레딧 계산
    const totalCreditsEarned =
      refs.length * REFERRAL_CREDITS.SIGNUP_REFERRER +
      (statusCounts.activated + statusCounts.converted) * REFERRAL_CREDITS.ACTIVATION_REFERRER +
      statusCounts.converted * REFERRAL_CREDITS.CONVERSION_REFERRER;

    // 최근 5명 (개인정보 보호 — Friend #N)
    const recentReferrals: ReferralFriendSummary[] = refs
      .slice(0, 5)
      .map((ref, idx) => ({
        index: idx + 1,
        status: ref.status as ReferralStatus,
        createdAt: ref.created_at,
      }));

    // 다음 마일스톤 계산
    let nextMilestone: ReferralMilestone | null = null;
    for (const ms of REFERRAL_MILESTONES) {
      const current = ms.type === 'activated'
        ? statusCounts.activated + statusCounts.converted // converted도 activated 통과
        : statusCounts.converted;

      if (current < ms.target) {
        nextMilestone = {
          type: ms.type,
          target: ms.target,
          current,
          reward: MILESTONE_REWARD_LABELS[ms.reward] ?? ms.reward,
        };
        break;
      }
    }

    const stats: ReferralStats = {
      total: refs.length,
      ...statusCounts,
      totalCreditsEarned,
      recentReferrals,
      nextMilestone,
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err) {
    logger.error('referral/stats', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
