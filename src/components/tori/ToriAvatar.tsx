'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ToriMood } from '@/types'
import { TORI_EMOJI } from '@/lib/tori-brain'

interface Props {
  mood: ToriMood
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CONFIG = {
  sm: { px: 24, containerClass: 'w-6 h-6', textClass: 'text-sm', dir: '/tori/sm' },
  md: { px: 48, containerClass: 'w-9 h-9', textClass: 'text-lg', dir: '/tori/md' },
  lg: { px: 120, containerClass: 'w-[120px] h-[120px]', textClass: 'text-5xl', dir: '/tori' },
} as const

export function ToriAvatar({ mood, size = 'md' }: Props) {
  const [imgError, setImgError] = useState(false)
  const config = SIZE_CONFIG[size]
  const emoji = TORI_EMOJI[mood] || '😊'
  const imgSrc = `${config.dir}/${mood}.png`

  return (
    <motion.div
      className={`${config.containerClass} rounded-full bg-white flex items-center justify-center shrink-0 select-none overflow-hidden`}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {imgError ? (
        <span role="img" aria-label={`Tori is ${mood}`} className={config.textClass}>
          {emoji}
        </span>
      ) : (
        <Image
          src={imgSrc}
          alt={`Tori is ${mood}`}
          width={config.px}
          height={config.px}
          className="object-contain"
          onError={() => setImgError(true)}
          priority={size === 'lg'}
          unoptimized
        />
      )}
    </motion.div>
  )
}
