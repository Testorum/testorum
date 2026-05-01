import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'
import type { GamificationState, UserProgress, UserBadge, Badge } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parallel fetch: progress + user badges (with badge details) + all badges + test dates
    const [progressResult, userBadgesResult, allBadgesResult, testDatesResult] = await Promise.all([
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false }),
      supabase
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true }),
      // C-2: StreakCalendar용 — 최근 90일 테스트 활동 날짜
      supabase
        .from('test_interactions')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
    ])

    // progress가 없으면 아직 테스트 안 한 유저
    const progress = (progressResult.data as unknown as UserProgress) ?? null
    const badges = (userBadgesResult.data as unknown as UserBadge[]) ?? []
    const allBadges = (allBadgesResult.data as unknown as Badge[]) ?? []

    // C-2: 고유 날짜 추출 (YYYY-MM-DD)
    const testDatesRaw = (testDatesResult.data ?? []) as Array<{ created_at: string }>
    const testDates = [...new Set(
      testDatesRaw.map((r) => r.created_at.split('T')[0])
    )]

    const state: GamificationState = {
      progress,
      badges,
      allBadges,
      testDates,
    }

    return NextResponse.json(state)
  } catch (error) {
    logger.error('gamification/progress', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
