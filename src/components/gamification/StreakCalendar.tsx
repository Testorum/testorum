'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  /** Array of ISO date strings (YYYY-MM-DD) when tests were taken */
  testDates: string[]
}

export function StreakCalendar({ testDates }: Props) {
  const t = useTranslations('Gamification')

  const days = useMemo(() => {
    const testDateSet = new Set(testDates)
    const result: Array<{ date: string; active: boolean }> = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        active: testDateSet.has(dateStr),
      })
    }

    return result
  }, [testDates])

  // Group into weeks (rows of 7)
  const weeks = useMemo(() => {
    const result: Array<typeof days> = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  return (
    <div className="w-full">
      <h4 className="text-xs font-semibold text-gray-500 mb-2">
        {t('streakCalendar')}
      </h4>
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className="w-4 h-4 rounded-sm transition-colors"
                style={{
                  backgroundColor: day.active ? '#22c55e' : '#f3f4f6',
                }}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <span className="text-[10px] text-gray-400">{t('noTest')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-[10px] text-gray-400">{t('tested')}</span>
        </div>
      </div>
    </div>
  )
}
