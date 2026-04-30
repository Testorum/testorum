'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GamificationUpdateResult } from '@/types'

interface Props {
  result: GamificationUpdateResult | null
  locale: string
  onDismiss?: () => void
}

interface ToastItem {
  id: string
  emoji: string
  text: string
  type: 'xp' | 'badge' | 'level_up' | 'streak'
}

export function XPGainToast({ result, locale, onDismiss }: Props) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isKo = locale === 'ko'

  // Build toast queue from result
  useEffect(() => {
    if (!result) return
    const items: ToastItem[] = []

    // XP gained — show +10 XP for test_complete (server always awards 10 base)
    items.push({
      id: 'xp',
      emoji: '⚡',
      text: '+10 XP',
      type: 'xp',
    })

    // Level up
    if (result.level_up) {
      items.push({
        id: 'level_up',
        emoji: '🎉',
        text: isKo
          ? `레벨 업! Lv.${result.level}`
          : `Level Up! Lv.${result.level}`,
        type: 'level_up',
      })

      // Level rewards
      for (const reward of result.level_rewards) {
        items.push({
          id: `reward_${reward.level}`,
          emoji: '🎁',
          text: isKo
            ? `+${reward.credits} 크레딧 보상!`
            : `+${reward.credits} credits reward!`,
          type: 'level_up',
        })
      }
    }

    // New badges
    for (const badge of result.new_badges) {
      items.push({
        id: `badge_${badge.slug}`,
        emoji: badge.emoji,
        text: isKo
          ? `새 뱃지! ${badge.name_ko}`
          : `New badge! ${badge.name_en}`,
        type: 'badge',
      })
    }

    setToasts(items)
    setCurrentIndex(0)
  }, [result, isKo])

  // Auto-advance through toasts
  useEffect(() => {
    if (toasts.length === 0 || currentIndex >= toasts.length) return

    const timer = setTimeout(() => {
      if (currentIndex < toasts.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        // All shown → dismiss after delay
        setTimeout(() => {
          setToasts([])
          onDismiss?.()
        }, 2000)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentIndex, toasts.length, onDismiss])

  const handleDismiss = useCallback(() => {
    setToasts([])
    onDismiss?.()
  }, [onDismiss])

  const currentToast = toasts[currentIndex]

  if (!currentToast) return null

  const bgColors: Record<string, string> = {
    xp: 'from-blue-500 to-indigo-500',
    badge: 'from-amber-400 to-orange-500',
    level_up: 'from-pink-500 to-rose-500',
    streak: 'from-orange-400 to-red-500',
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentToast.id}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`
          fixed top-4 left-1/2 -translate-x-1/2 z-[100]
          flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-gradient-to-r ${bgColors[currentToast.type]}
          text-white shadow-lg shadow-black/10
          cursor-pointer select-none
        `}
        onClick={handleDismiss}
      >
        <span className="text-lg">{currentToast.emoji}</span>
        <span className="text-sm font-bold whitespace-nowrap">
          {currentToast.text}
        </span>
        {toasts.length > 1 && (
          <span className="text-[10px] opacity-60 ml-1">
            {currentIndex + 1}/{toasts.length}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
