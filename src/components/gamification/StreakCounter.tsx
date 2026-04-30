'use client'

import { useTranslations } from 'next-intl'

interface Props {
  streak: number
  longestStreak?: number
}

export function StreakCounter({ streak, longestStreak }: Props) {
  const t = useTranslations('Gamification')

  const getMessage = () => {
    if (streak === 0) return t('streakStart')
    if (streak >= 30) return t('streakLegend')
    if (streak >= 14) return t('streakOnFire')
    if (streak >= 7) return t('streakWeek')
    if (streak >= 3) return t('streakKeepGoing')
    return t('streakNice')
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
      <div className="flex items-center gap-1.5">
        <span className="text-2xl">🔥</span>
        <span className="text-2xl font-extrabold text-orange-500">
          {streak}
        </span>
        <span className="text-xs font-semibold text-orange-400">
          {t('days')}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-600 truncate">
          {getMessage()}
        </p>
        {longestStreak !== undefined && longestStreak > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t('longestStreak')}: {longestStreak} {t('days')}
          </p>
        )}
      </div>
    </div>
  )
}
