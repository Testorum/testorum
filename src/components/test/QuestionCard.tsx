'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TestQuestion, TestOption, TestTheme } from '@/types'

interface Props {
  question: TestQuestion
  questionIndex: number
  totalQuestions: number
  theme: TestTheme
  onAnswer: (option: TestOption) => void
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  theme,
  onAnswer,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const progress = (questionIndex / totalQuestions) * 100

  function handleSelect(option: TestOption, idx: number) {
    if (isAnimating) return
    setSelectedIdx(idx)
    setIsAnimating(true)

    // bounce delay then proceed
    setTimeout(() => {
      onAnswer(option)
      setSelectedIdx(null)
      setIsAnimating(false)
    }, 350)
  }

  return (
    <div
      className="flex flex-col min-h-screen px-4 py-6 bg-noise"
      style={{
        '--test-primary': theme.primary,
        '--test-bg': theme.bg,
        '--test-accent': theme.accent,
        backgroundColor: theme.bg,
      } as React.CSSProperties}
    >
      {/* Progress — visual hearts */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.primary + '20' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: theme.primary }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: theme.primary }}>
          {questionIndex}/{totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <div className="flex-1 flex flex-col justify-center">
        <p
          className="text-xl font-bold leading-relaxed mb-8 text-center whitespace-pre-line animate-[fade-up_0.4s_ease-out]"
          style={{ color: theme.accent }}
        >
          {question.text}
        </p>

        {/* Options by type */}
        {question.type === 'image_grid' && (
          <ImageGridOptions
            options={question.options}
            selectedIdx={selectedIdx}
            theme={theme}
            onSelect={handleSelect}
          />
        )}
        {question.type === 'binary' && (
          <BinaryOptions
            options={question.options}
            selectedIdx={selectedIdx}
            theme={theme}
            onSelect={handleSelect}
          />
        )}
        {(question.type === 'text_choice' || !question.type) && (
          <TextChoiceOptions
            options={question.options}
            selectedIdx={selectedIdx}
            theme={theme}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  )
}

// ─── Text Choice (default) ───────────────────────────────────
function TextChoiceOptions({
  options, selectedIdx, theme, onSelect,
}: {
  options: TestOption[]
  selectedIdx: number | null
  theme: TestTheme
  onSelect: (opt: TestOption, idx: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, i) => {
        const isSelected = selectedIdx === i
        return (
          <button
            key={i}
            onClick={() => onSelect(opt, i)}
            className={cn(
              'w-full text-left px-5 py-4 rounded-[14px] border-2',
              'font-medium text-base transition-all duration-200',
              'active:scale-[0.97]',
              isSelected && 'animate-[scale-bounce_0.3s_ease-out]',
            )}
            style={{
              borderColor: isSelected ? theme.primary : '#E8E5E0',
              backgroundColor: isSelected ? theme.primary + '12' : '#FFFFFF',
              color: theme.accent,
              boxShadow: isSelected
                ? `0 2px 8px ${theme.primary}33, 0 0 0 2px ${theme.primary}`
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
            {opt.text}
          </button>
        )
      })}
    </div>
  )
}

// ─── Image Grid (2x2) ───────────────────────────────────────
function ImageGridOptions({
  options, selectedIdx, theme, onSelect,
}: {
  options: TestOption[]
  selectedIdx: number | null
  theme: TestTheme
  onSelect: (opt: TestOption, idx: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const isSelected = selectedIdx === i
        return (
          <button
            key={i}
            onClick={() => onSelect(opt, i)}
            className={cn(
              'relative rounded-[14px] border-2 overflow-hidden',
              'transition-all duration-200 active:scale-[0.97]',
              isSelected && 'animate-[scale-bounce_0.3s_ease-out]',
            )}
            style={{
              borderColor: isSelected ? theme.primary : '#E8E5E0',
              boxShadow: isSelected
                ? `0 2px 8px ${theme.primary}33, 0 0 0 2px ${theme.primary}`
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {opt.image ? (
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={opt.image}
                  alt={opt.text}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-square flex items-center justify-center text-4xl"
                style={{ backgroundColor: theme.primary + '08' }}
              >
                {opt.emoji || '📷'}
              </div>
            )}
            <p
              className="px-3 py-2.5 text-sm font-medium text-center truncate"
              style={{ color: theme.accent }}
            >
              {opt.text}
            </p>
          </button>
        )
      })}
    </div>
  )
}

// ─── Binary (이지선다) ──────────────────────────────────────
function BinaryOptions({
  options, selectedIdx, theme, onSelect,
}: {
  options: TestOption[]
  selectedIdx: number | null
  theme: TestTheme
  onSelect: (opt: TestOption, idx: number) => void
}) {
  return (
    <div className="flex gap-3">
      {options.slice(0, 2).map((opt, i) => {
        const isSelected = selectedIdx === i
        return (
          <button
            key={i}
            onClick={() => onSelect(opt, i)}
            className={cn(
              'flex-1 py-6 px-4 rounded-[16px] border-2',
              'flex flex-col items-center justify-center gap-2',
              'font-bold text-base transition-all duration-200',
              'active:scale-[0.97]',
              isSelected && 'animate-[scale-bounce_0.3s_ease-out]',
            )}
            style={{
              borderColor: isSelected ? theme.primary : '#E8E5E0',
              backgroundColor: isSelected ? theme.primary + '12' : '#FFFFFF',
              color: theme.accent,
              boxShadow: isSelected
                ? `0 2px 8px ${theme.primary}33, 0 0 0 2px ${theme.primary}`
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            {opt.emoji && <span className="text-3xl">{opt.emoji}</span>}
            <span>{opt.text}</span>
          </button>
        )
      })}
    </div>
  )
}
