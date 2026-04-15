'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/ga4'
import type { FeedbackEmoji, FeedbackCount } from '@/types'

interface Props {
  testSlug: string
  resultId: string
  initialCounts: FeedbackCount
}

const EMOJIS: { key: FeedbackEmoji; label: string; text: string }[] = [
  { key: 'shocked', label: '😱', text: '소름' },
  { key: 'lol', label: '😂', text: '웃겨' },
  { key: 'think', label: '🤔', text: '글쎄' },
]

export function FeedbackWidget({ testSlug, resultId, initialCounts }: Props) {
  const [counts, setCounts] = useState<FeedbackCount>(initialCounts)
  const [selected, setSelected] = useState<FeedbackEmoji | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFeedback(emoji: FeedbackEmoji) {
    if (loading) return
    setLoading(true)

    const prev = selected

    // 낙관적 업데이트 (즉시 UI 반영)
    setCounts((c) => {
      const next = { ...c }
      if (prev) next[prev] = Math.max(0, next[prev] - 1) // 이전 것 취소
      next[emoji] = next[emoji] + 1                       // 새 것 추가
      return next
    })
    setSelected(emoji)

    trackEvent('result_feedback', {
      test_slug: testSlug,
      result_id: resultId,
      feedback_type: emoji,
    })

    // DB: 이전 피드백 삭제 후 새 것 삽입
    // 세션 기반으로 관리 (localStorage로 ID 저장)
    const storageKey = `feedback_${testSlug}_${resultId}`
    const existingId = localStorage.getItem(storageKey)

    if (existingId) {
      await supabase.from('feedback').delete().eq('id', existingId)
    }

    const { data } = await supabase
      .from('feedback')
      .insert({ test_slug: testSlug, result_id: resultId, emoji })
      .select('id')
      .single()

    if (data?.id) {
      localStorage.setItem(storageKey, data.id)
    }

    setLoading(false)
  }

  async function handleComment() {
    if (!comment.trim() || submitted) return
    setSubmitted(true)
    trackEvent('comment_submit', { test_slug: testSlug, result_id: resultId })
    await supabase.from('comments').insert({
      test_slug: testSlug,
      result_id: resultId,
      content: comment.trim(),
    })
  }

  const total = counts.shocked + counts.lol + counts.think

  return (
    <div className="mt-6 w-full">
      <p className="text-sm text-gray-400 text-center mb-3 font-medium">
        결과가 어때요?
      </p>

      {/* 반응 버튼 */}
      <div className="flex justify-center gap-3 mb-2">
        {EMOJIS.map(({ key, label, text }) => {
          const isSelected = selected === key
          const pct = total > 0 ? Math.round((counts[key] / total) * 100) : 0
          return (
            <button
              key={key}
              onClick={() => handleFeedback(key)}
              disabled={loading}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 transition-all active:scale-95 min-w-[72px] ${
                isSelected
                  ? 'border-rose-400 bg-rose-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              } ${loading ? 'opacity-60' : ''}`}
            >
              <span className="text-2xl">{label}</span>
              <span className={`text-xs font-bold ${isSelected ? 'text-rose-500' : 'text-gray-400'}`}>
                {counts[key]}
              </span>
              <span className="text-[10px] text-gray-300">{text}</span>
            </button>
          )
        })}
      </div>

      {/* 퍼센트 바 (총 1개 이상일 때만 표시) */}
      {total > 0 && (
        <div className="flex rounded-full overflow-hidden h-1.5 mb-5 mx-4">
          {EMOJIS.map(({ key }) => {
            const pct = Math.round((counts[key] / total) * 100)
            const colors = { shocked: 'bg-purple-300', lol: 'bg-yellow-300', think: 'bg-blue-300' }
            return pct > 0 ? (
              <div
                key={key}
                className={`${colors[key]} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            ) : null
          })}
        </div>
      )}

      {/* 한줄평 */}
      {!submitted ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="한줄 소감 남기기..."
            maxLength={60}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 bg-white"
          />
          <button
            onClick={handleComment}
            className="px-4 py-3 rounded-2xl bg-rose-400 text-white text-sm font-semibold active:scale-95 transition-all"
          >
            등록
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">소감 감사해요! 🙏</p>
      )}
    </div>
  )
}
