'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Badge, UserBadge } from '@/types'

interface Props {
  allBadges: Badge[]
  earnedBadges: UserBadge[]
  locale: string
}

export function BadgeGrid({ allBadges, earnedBadges, locale }: Props) {
  const t = useTranslations('Gamification')
  const isKo = locale === 'ko'
  const earnedIds = new Set(earnedBadges.map((ub) => ub.badge_id))

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold text-gray-700 mb-3">
        {t('badges')} ({earnedBadges.length}/{allBadges.length})
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {allBadges.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id)
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-xl text-center
                ${isEarned
                  ? 'bg-white shadow-sm border border-gray-100'
                  : 'bg-gray-50 opacity-50'
                }
              `}
            >
              <span className="text-2xl">
                {isEarned ? badge.icon_emoji : '🔒'}
              </span>
              <span className="text-[10px] font-semibold text-gray-600 leading-tight line-clamp-2">
                {isEarned
                  ? (isKo ? badge.name_ko : badge.name_en)
                  : (isKo ? badge.description_ko : badge.description_en)
                }
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
