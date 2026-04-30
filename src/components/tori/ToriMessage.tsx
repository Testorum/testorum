'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToriAvatar } from './ToriAvatar'
import { TypingIndicator } from './TypingIndicator'
import type { ToriMood } from '@/types'
import type { TestTheme } from '@/types'

interface Props {
  mood: ToriMood
  message: string
  locale: string
  theme?: TestTheme
  data_driven?: boolean
  delay?: number              // ms before appearing
  showTypingIndicator?: boolean
  typingDuration?: number     // ms for typing dots
  onComplete?: () => void     // fires after message fully shown
}

export function ToriMessage({
  mood,
  message,
  locale,
  theme,
  data_driven = false,
  delay = 0,
  showTypingIndicator = true,
  typingDuration = 600,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<'waiting' | 'typing' | 'shown'>('waiting')

  useEffect(() => {
    if (delay <= 0 && !showTypingIndicator) {
      setPhase('shown')
      return
    }

    const waitTimer = setTimeout(() => {
      if (showTypingIndicator) {
        setPhase('typing')
        const typeTimer = setTimeout(() => {
          setPhase('shown')
        }, typingDuration)
        return () => clearTimeout(typeTimer)
      } else {
        setPhase('shown')
      }
    }, delay)

    return () => clearTimeout(waitTimer)
  }, [delay, showTypingIndicator, typingDuration])

  useEffect(() => {
    if (phase === 'shown' && onComplete) {
      onComplete()
    }
  }, [phase, onComplete])

  const bubbleBg = theme?.primary ? `${theme.primary}12` : '#F3F4F6'
  const bubbleColor = theme?.accent || '#1F2937'
  const typingDotColor = theme?.primary || '#999'

  if (phase === 'waiting') return null

  return (
    <motion.div
      className="flex items-start gap-2 max-w-[90%]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <ToriAvatar mood={mood} size="md" />

      <div className="flex flex-col gap-0.5">
        <span
          className="text-[10px] font-medium px-1 select-none"
          style={{ color: theme?.primary || '#9CA3AF' }}
        >
          Tori
        </span>

        <AnimatePresence mode="wait">
          {phase === 'typing' ? (
            <motion.div
              key="typing"
              className="rounded-[16px] rounded-tl-[4px]"
              style={{ backgroundColor: bubbleBg }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator color={typingDotColor} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              className="rounded-[16px] rounded-tl-[4px] px-4 py-3"
              style={{ backgroundColor: bubbleBg }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{
                  color: bubbleColor,
                  fontFamily: locale === 'ko' ? 'var(--font-ko)' : 'var(--font-body)',
                }}
              >
                {message}
              </p>
              {data_driven && (
                <span
                  className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: theme?.primary ? `${theme.primary}20` : '#E5E7EB',
                    color: theme?.primary || '#6B7280',
                  }}
                >
                  AI ✨
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
