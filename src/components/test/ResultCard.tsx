'use client'

import type { TestResult, TestMeta } from '@/types'

interface Props {
  result: TestResult
  meta: TestMeta
  children?: React.ReactNode
}

export function ResultCard({ result, meta, children }: Props) {
  return (
    <div
      className="w-full rounded-3xl p-6 text-center shadow-lg"
      style={{ backgroundColor: meta.ogColor + '22' }}
    >
      <div className="text-6xl mb-4">{result.emoji}</div>
      <p className="text-sm text-gray-400 font-medium mb-1">{meta.title}</p>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
        {result.title}
      </h2>
      <p className="text-base text-gray-600 leading-relaxed mb-4">
        {result.description}
      </p>

      {/* 태그 */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {result.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      {children}
    </div>
  )
}
