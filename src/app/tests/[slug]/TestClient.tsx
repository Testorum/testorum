'use client'

import { useRouter } from 'next/navigation'
import { useTestStore } from '@/store/testStore'
import { QuestionCard } from '@/components/test/QuestionCard'
import { AdBanner } from '@/components/ads/AdBanner'
import { trackEvent } from '@/lib/ga4'
import { resolveResult } from '@/lib/scoring'
import type { TestData, TestOption } from '@/types'
import { useEffect } from 'react'

interface Props {
  data: TestData
}

export function TestClient({ data }: Props) {
  const router = useRouter()
  const { currentIndex, answers, addAnswer, reset } = useTestStore()

  useEffect(() => {
    reset()
    trackEvent('test_start', { test_slug: data.meta.slug })
  }, [data.meta.slug])

  function handleAnswer(option: TestOption) {
    trackEvent('question_answer', {
      test_slug: data.meta.slug,
      question_index: currentIndex,
    })
    addAnswer(option)

    const nextIndex = currentIndex + 1
    if (nextIndex >= data.questions.length) {
      const newAnswers = [...answers, option]
      const resultId = resolveResult(data, newAnswers)
      trackEvent('test_complete', {
        test_slug: data.meta.slug,
        result_id: resultId,
      })
      router.push(`/tests/${data.meta.slug}/result?r=${resultId}`)
    }
  }

  if (currentIndex >= data.questions.length) return null

  const question = data.questions[currentIndex]

  return (
    <div className="max-w-md mx-auto">
      {/* 중간 광고 (5번째 질문마다) */}
      {currentIndex > 0 && currentIndex % 5 === 0 && (
        <AdBanner slot="1234567890" format="horizontal" />
      )}
      <QuestionCard
        question={question}
        questionIndex={currentIndex + 1}
        totalQuestions={data.questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
