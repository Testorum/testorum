'use client'

import { useEffect, useState } from 'react'
import type { TestTheme } from '@/types'

interface Props {
  theme: TestTheme
  locale: string
  onComplete: () => void
}

const MESSAGES: Record<string, string[]> = {
  ko: ['결과 분석 중', '유형 매칭 중', '거의 다 됐어'],
  en: ['Analyzing results', 'Matching your type', 'Almost there'],
}

export function LoadingAnalysis({ theme, locale, onComplete }: Props) {
  const [msgIdx, setMsgIdx] = useState(0)
  const messages = MESSAGES[locale] ?? MESSAGES.en

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => {
        if (prev >= messages.length - 1) return prev
        return prev + 1
      })
    }, 1200)

    const timeout = setTimeout(() => {
      onComplete()
    }, 3500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onComplete, messages.length])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="text-5xl animate-[spin-slow_3s_linear_infinite]">🔮</div>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite_0s]" style={{ backgroundColor: theme.primary }} />
        <div className="w-2.5 h-2.5 rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite_0.2s]" style={{ backgroundColor: theme.primary }} />
        <div className="w-2.5 h-2.5 rounded-full animate-[typing-dot_1.4s_ease-in-out_infinite_0.4s]" style={{ backgroundColor: theme.primary }} />
      </div>
      <p className="text-base font-medium animate-[fade-up_0.3s_ease-out]" style={{ color: theme.accent + 'AA' }} key={msgIdx}>
        {messages[msgIdx]}...
      </p>
    </div>
  )
}
