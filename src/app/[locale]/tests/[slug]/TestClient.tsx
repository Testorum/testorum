'use client'

import { useCallback, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useTestStore } from '@/store/testStore'
import { QuestionCard } from '@/components/test/QuestionCard'
import { LoadingAnalysis } from '@/components/test/LoadingAnalysis'
import { AdBanner } from '@/components/ads/AdBanner'
import { trackEvent } from '@/lib/ga4'
import { resolveResult } from '@/lib/scoring'
import type { TestData, TestOption } from '@/types'
import { useEffect } from 'react'

interface Props {
  data: TestData
  locale: string
}

export function TestClient({ data, locale }: Props) {
  const router = useRouter()
  const t = useTranslations('TestPlay')
  const { currentIndex, answers, addAnswer, reset } = useTestStore()
  const [showLoading, setShowLoading] = useState(false)
  const [pendingResultId, setPendingResultId] = useState<string | null>(null)

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
      setPendingResultId(resultId)
      setShowLoading(true)
    }
  }

  const handleLoadingComplete = useCallback(() => {
    if (pendingResultId) {
      router.push(`/tests/${data.meta.slug}/result?r=${pendingResultId}`)
    }
  }, [pendingResultId, data.meta.slug, router])

  if (showLoading) {
    return (
      <LoadingAnalysis
        theme={data.meta.theme}
        locale={locale}
        onComplete={handleLoadingComplete}
      />
    )
  }

  if (currentIndex >= data.questions.length) return null

  const question = data.questions[currentIndex]

  return (
    <div className="max-w-[480px] mx-auto">
      {currentIndex > 0 && currentIndex % 5 === 0 && (
        <AdBanner slot="1234567890" format="horizontal" />
      )}
      <QuestionCard
        question={question}
        questionIndex={currentIndex + 1}
        totalQuestions={data.questions.length}
        theme={data.meta.theme}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
