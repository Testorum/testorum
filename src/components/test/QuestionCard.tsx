'use client'

import { cn } from '@/lib/utils'
import type { TestQuestion, TestOption } from '@/types'

interface Props {
  question: TestQuestion
  questionIndex: number
  totalQuestions: number
  onAnswer: (option: TestOption) => void
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
}: Props) {
  const progress = ((questionIndex) / totalQuestions) * 100

  return (
    <div className="flex flex-col min-h-screen bg-white px-4 py-8">
      {/* 진행바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div
          className="bg-rose-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right mb-8">
        {questionIndex}/{totalQuestions}
      </p>

      {/* 질문 */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-lg font-bold text-gray-800 leading-relaxed mb-10 text-center whitespace-pre-line">
          {question.text}
        </p>

        {/* 선택지 */}
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(opt)}
              className={cn(
                'w-full text-left px-5 py-4 rounded-2xl border-2 border-gray-100',
                'bg-white text-gray-700 font-medium text-base',
                'active:scale-95 transition-all duration-150',
                'hover:border-rose-300 hover:bg-rose-50'
              )}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
