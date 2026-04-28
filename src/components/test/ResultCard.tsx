'use client'

import type { TestResult, TestMeta } from '@/types'

interface Props {
  result: TestResult
  meta: TestMeta
  locale?: string
  participantCount?: number
  children?: React.ReactNode
}

export function ResultCard({ result, meta, locale = 'en', participantCount, children }: Props) {
  const { theme } = meta
  const emojiDisplay = result.emojiCombo || result.emoji
  const isKo = locale === 'ko'

  return (
    <div
      className="w-full rounded-[20px] overflow-hidden bg-noise"
      style={{
        backgroundColor: theme.bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
      }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: theme.primary }} />
      <div className="p-6 text-center">
        <div className="text-5xl mb-3 animate-[fade-up_0.6s_ease-out]" style={{ letterSpacing: '4px' }}>
          {emojiDisplay}
        </div>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ backgroundColor: theme.primary + '15', color: theme.primary }}
        >
          {meta.title}
        </span>
        <h2
          className="text-2xl font-extrabold mb-3 animate-[fade-up_0.5s_ease-out]"
          style={{ color: theme.accent, fontFamily: 'var(--font-display)' }}
        >
          {result.title}
        </h2>
        <p className="text-base leading-relaxed mb-4" style={{ color: theme.accent + 'BB' }}>
          {result.description}
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {result.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: theme.primary + '10',
                color: theme.primary,
                border: `1px solid ${theme.primary}25`,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        {result.compatibility && (
          <p className="text-sm mb-4" style={{ color: theme.accent + '88' }}>
            💕 {isKo ? '궁합 유형' : 'Best match'}: <strong>{result.compatibility}</strong>
          </p>
        )}
        {participantCount && participantCount > 0 && (
          <p className="text-xs mb-4" style={{ color: theme.accent + '66' }}>
            {participantCount.toLocaleString()}{isKo ? '명 참여 중' : ' participants'}
          </p>
        )}
        {children}
      </div>
      <div
        className="py-2 text-center text-[10px] font-medium"
        style={{ backgroundColor: theme.primary + '08', color: theme.accent + '44' }}
      >
        testorum.app
      </div>
    </div>
  )
}
