'use client'

import { motion } from 'framer-motion'
import type { ToriMood } from '@/types'
import { TORI_EMOJI } from '@/lib/tori-brain'

interface Props {
  mood: ToriMood
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-9 h-9 text-lg',
  lg: 'w-12 h-12 text-2xl',
} as const

export function ToriAvatar({ mood, size = 'md' }: Props) {
  const emoji = TORI_EMOJI[mood] || '😊'

  return (
    <motion.div
      className={`${SIZE_MAP[size]} rounded-full bg-white flex items-center justify-center shrink-0 select-none`}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <span role="img" aria-label={`Tori is ${mood}`}>
        {emoji}
      </span>
    </motion.div>
  )
}
