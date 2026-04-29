'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/ga4'
import type { FeedbackEmoji, FeedbackCount } from '@/types'

interface Props {
  testSlug: string
  resultId: string
  initialCounts: FeedbackCount
  locale?: string
}

const EMOJIS_KO: { key: FeedbackEmoji; label: string; text: string }[] = [
  { key: 'shocked', label: '😱', text: '소름' },
  { key: 'lol', label: '😂', text: '웃겨' },
  { key: 'think', label: '🤔', text: '글쎄' },
]

const EMOJIS_EN: { key: FeedbackEmoji; label: string; text: string }[] = [
  { key: 'shocked', label: '😱', text: 'Wow' },
  { key: 'lol', label: '😂', text: 'LOL' },
  { key: 'think', label: '🤔', text: 'Hmm' },
]

export function FeedbackWidget({ testSlug, resultId, initialCounts, locale = 'en' }: Props) {
  const [counts, setCounts] = useState<FeedbackCount>(initialCounts)
  const [selected, setSelected] = useState<FeedbackEmoji | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const isKo = locale === 'ko'
  const EMOJIS = isKo ? EMOJIS_KO : EMOJIS_EN

  async function handleFeedback(emoji: FeedbackEmoji) {
    if (loading) return
    setLoading(true)

    const prev = selected

    setCounts((c) => {
      const next = { ...c }
      if (prev) next[prev] = Math.max(0, next[prev] - 1)
      next[emoji] = next[emoji] + 1
      return next
    })
    setSelected(emoji)

    trackEvent('result_feedback', {
      test_slug: testSlug,
      result_id: resultId,
      feedback_type: emoji,
    })

    try {
      // 기존 피드백이 있으면 삭제 (localStorage에 저장된 ID)
      const storageKey = `feedback_${testSlug}_${resultId}`
      const existingId = localStorage.getItem(storageKey)

      if (existingId) {
        await fetch('/api/feedback', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: existingId }),
        })
      }

      // 새 피드백 삽입
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_slug: testSlug,
          result_id: resultId,
          emoji,
        }),
      })

      if (res.ok) {
        const { data } = await res.json()
        if (data?.id) {
          localStorage.setItem(storageKey, data.id)
        }
      }
    } catch (err) {
      console.error('[FeedbackWidget] feedback error:', err)
    }

    setLoading(false)
  }

  async function handleComment() {
    if (!comment.trim() || submitted) return
    setSubmitted(true)
    trackEvent('comment_submit', { test_slug: testSlug, result_id: resultId })

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_slug: testSlug,
          result_id: resultId,
          content: comment.trim(),
        }),
      })

      if (!res.ok) {
        // 중복 댓글 등 에러 시 다시 입력 가능하게
        setSubmitted(false)
      }
    } catch (err) {
      console.error('[FeedbackWidget] comment error:', err)
      setSubmitted(false)
    }
  }

  const total = counts.shocked + counts.lol + counts.think

  return (
    <div className="mt-6 w-full">
      <p className="text-sm text-gray-400 text-center mb-3 font-medium">
        {isKo ? '결과가 어때요?' : 'How accurate is this?'}
      </p>

      <div className="flex justify-center gap-3 mb-2">
        {EMOJIS.map(({ key, label, text }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => handleFeedback(key)}
              disabled={loading}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border-2 transition-all active:scale-95 min-w-[72px] ${isSelected
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

      {total > 0 && (
        <div className="flex rounded-full overflow-hidden h-1.5 mb-5 mx-4">
          {EMOJIS.map(({ key }) => {
            const pct = Math.round((counts[key] / total) * 100)
            const colors: Record<string, string> = { shocked: 'bg-purple-300', lol: 'bg-yellow-300', think: 'bg-blue-300' }
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

      {!submitted ? (
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder={isKo ? '한줄 소감 남기기...' : 'Leave a quick thought...'}
            maxLength={60}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-rose-300 bg-white"
          />
          <button
            onClick={handleComment}
            className="px-4 py-3 rounded-2xl bg-rose-400 text-white text-sm font-semibold active:scale-95 transition-all"
          >
            {isKo ? '등록' : 'Post'}
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">
          {isKo ? '소감 감사해요! 🙏' : 'Thanks for sharing! 🙏'}
        </p>
      )}
    </div>
  )
}
