import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { logger } from '@/lib/logger'
import { validateSlug } from '@/lib/validation'
import type { GamificationActionType, GamificationUpdateResult } from '@/types'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = new Set<GamificationActionType>([
  'test_complete',
  'premium_unlock',
  'share',
  'referral',
])

const XP_MAP: Record<GamificationActionType, number> = {
  test_complete: 10,
  premium_unlock: 5,
  share: 3,
  referral: 20,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const { action_type, test_slug, test_category } = body as Record<string, unknown>

    // Validate action_type
    if (typeof action_type !== 'string' || !VALID_ACTIONS.has(action_type as GamificationActionType)) {
      return NextResponse.json(
        { error: `action_type must be one of: ${[...VALID_ACTIONS].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate test_slug if provided
    if (test_slug !== undefined && test_slug !== null) {
      const slugValidation = validateSlug(test_slug)
      if (!slugValidation.success) {
        return NextResponse.json({ error: slugValidation.error }, { status: 400 })
      }
    }

    // Validate test_category if provided
    if (test_category !== undefined && test_category !== null && typeof test_category !== 'string') {
      return NextResponse.json({ error: 'test_category must be a string' }, { status: 400 })
    }

    const xpGained = XP_MAP[action_type as GamificationActionType]
    const admin = getSupabaseAdmin()

    // #4 Fix: XP dedup — test_complete 시 이미 완료한 테스트면 XP 0 부여
    let finalXp = xpGained
    if (action_type === 'test_complete' && test_slug) {
      const { data: existingDna } = await admin
        .from('personality_dna')
        .select('id')
        .eq('user_id', user.id)
        .eq('test_slug', test_slug as string)
        .limit(1)

      if (existingDna && existingDna.length > 0) {
        // 이미 완료한 테스트 — XP 0으로 설정 (스트릭/카운트 업데이트는 유지)
        finalXp = 0
      }
    }

    // Call pg function via admin (SECURITY DEFINER handles badge inserts)
    const { data, error } = await admin.rpc('update_user_progress', {
      p_user_id: user.id,
      p_xp_gained: finalXp,
      p_action_type: action_type as string,
      p_test_slug: (test_slug as string) ?? null,
      p_test_category: (test_category as string) ?? null,
    })

    if (error) {
      logger.error('gamification/update', error, { user_id: user.id, action_type: action_type as string })
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
    }

    const result = data as unknown as GamificationUpdateResult

    // C-1: 테스트 완료 시 레퍼럴 활성화 체크 (total_tests_taken >= 3)
    // activate_referral DB function 내부에서 조건 확인 + 중복 방지 처리
    if (action_type === 'test_complete') {
      try {
        const { error: referralError } = await admin.rpc('activate_referral', {
          p_referred_id: user.id,
        })
        if (referralError) {
          // 레퍼럴 활성화 실패는 비치명적 — 로그만 남기고 메인 응답은 정상 반환
          logger.warn('gamification/update', 'activate_referral failed', {
            user_id: user.id,
            error: referralError.message,
          })
        }
      } catch (referralErr) {
        logger.warn('gamification/update', 'activate_referral exception', {
          user_id: user.id,
          error: referralErr instanceof Error ? referralErr.message : 'Unknown',
        })
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('gamification/update', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
