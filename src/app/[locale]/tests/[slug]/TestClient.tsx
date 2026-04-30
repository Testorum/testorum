'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useTestStore } from '@/store/testStore'
import { QuestionCard } from '@/components/test/QuestionCard'
import { LoadingAnalysis } from '@/components/test/LoadingAnalysis'
import { ToriMessage } from '@/components/tori/ToriMessage'
import { AdBanner } from '@/components/ads/AdBanner'
import { BehaviorTracker } from '@/lib/behavior-tracker'
import { getToriMessage } from '@/lib/tori-brain'
import { trackEvent } from '@/lib/ga4'
import { resolveResult } from '@/lib/scoring'
import { createClient } from '@/lib/supabase'
import type { TestData, TestOption, ToriMood, ToriResponse } from '@/types'

interface Props {
  data: TestData
  locale: string
}

// Tori intervention config
const TORI_MID_QUESTION_INDEX = 3 // Show after 4th question (0-indexed)

export function TestClient({ data, locale }: Props) {
  const router = useRouter()
  const t = useTranslations('TestPlay')
  const { currentIndex, answers, addAnswer, reset } = useTestStore()
  const [showLoading, setShowLoading] = useState(false)
  const [pendingResultId, setPendingResultId] = useState<string | null>(null)

  // Tori state
  const [introTori, setIntroTori] = useState<ToriResponse | null>(null)
  const [midTori, setMidTori] = useState<ToriResponse | null>(null)
  const [showIntroTori, setShowIntroTori] = useState(false)
  const [showMidTori, setShowMidTori] = useState(false)
  const midToriShownRef = useRef(false)

  // Behavior tracker
  const trackerRef = useRef<BehaviorTracker>(new BehaviorTracker(data.meta.slug))
  const [prevChoiceIdx, setPrevChoiceIdx] = useState<Record<number, number>>({})

  // Init: reset store + fetch Tori intro message
  useEffect(() => {
    reset()
    trackerRef.current = new BehaviorTracker(data.meta.slug)
    trackEvent('test_start', { test_slug: data.meta.slug })

    // Fetch Tori intro
    const moods: ToriMood[] = ['curious', 'excited']
    const mood = moods[Math.floor(Math.random() * moods.length)]
    getToriMessage(mood, locale, data.meta.slug).then((msg) => {
      setIntroTori(msg)
      setShowIntroTori(true)
    })

    // Pre-fetch mid-test Tori
    const midMoods: ToriMood[] = ['curious', 'surprised']
    const midMood = midMoods[Math.floor(Math.random() * midMoods.length)]
    getToriMessage(midMood, locale, data.meta.slug).then(setMidTori)
  }, [data.meta.slug, locale, reset])

  // Start question timer when index changes
  useEffect(() => {
    if (!showLoading) {
      trackerRef.current.startQuestion()
    }
  }, [currentIndex, showLoading])

  // Mid-test Tori trigger
  useEffect(() => {
    if (
      currentIndex === TORI_MID_QUESTION_INDEX + 1 &&
      !midToriShownRef.current &&
      midTori
    ) {
      midToriShownRef.current = true
      setShowMidTori(true)
      trackEvent('tori_message_shown', {
        test_slug: data.meta.slug,
        tori_mood: midTori.mood,
      })

      // Auto-hide after 3s
      const timer = setTimeout(() => setShowMidTori(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, midTori, data.meta.slug])

  function handleAnswer(option: TestOption) {
    // Record behavior
    const question = data.questions[currentIndex]
    const wasChanged = prevChoiceIdx[currentIndex] !== undefined
    trackerRef.current.recordAnswer({
      question_index: currentIndex,
      choice_made: option.text,
      choice_changed: wasChanged,
      question_type: question?.type || 'text_choice',
    })
    setPrevChoiceIdx((prev) => ({ ...prev, [currentIndex]: 0 }))

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

      // Save interactions for logged-in users
      saveInteractions()

      setPendingResultId(resultId)
      setShowLoading(true)
    }
  }

  async function saveInteractions() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        await trackerRef.current.saveToSupabase(user.id)
      }
    } catch {
      // Silent fail — non-critical
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
      {/* Tori intro (before first question) */}
      {showIntroTori && introTori && currentIndex === 0 && (
        <div className="px-4 pt-4 pb-2">
          <ToriMessage
            mood={introTori.mood}
            message={introTori.message}
            locale={locale}
            theme={data.meta.theme}
            showTypingIndicator={true}
            delay={300}
            typingDuration={500}
            onComplete={() => {
              trackEvent('tori_message_shown', {
                test_slug: data.meta.slug,
                tori_mood: introTori.mood,
              })
            }}
          />
        </div>
      )}

      {/* Mid-test Tori reaction */}
      {showMidTori && midTori && (
        <div className="px-4 py-2">
          <ToriMessage
            mood={midTori.mood}
            message={midTori.message}
            locale={locale}
            theme={data.meta.theme}
            showTypingIndicator={false}
            delay={0}
          />
        </div>
      )}

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
