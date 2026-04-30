'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface Props {
  level: number
  xp: number
  themeColor?: string
}

function xpForLevel(level: number): number {
  return level * level * 10
}

export function XPProgressBar({ level, xp, themeColor = '#FF4F4F' }: Props) {
  const t = useTranslations('Gamification')
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const progressInLevel = xp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  const percentage = xpNeeded > 0 ? Math.min(100, (progressInLevel / xpNeeded) * 100) : 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold" style={{ color: themeColor }}>
          Lv.{level}
        </span>
        <span className="text-[10px] text-gray-400">
          {progressInLevel}/{xpNeeded} XP {t('toNextLevel')}
        </span>
        <span className="text-xs font-bold text-gray-300">
          Lv.{level + 1}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: themeColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
