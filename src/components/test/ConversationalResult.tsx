'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ToriMessage } from '@/components/tori/ToriMessage'
import { ToriAvatar } from '@/components/tori/ToriAvatar'
import { TypingIndicator } from '@/components/tori/TypingIndicator'
import { PaywallGate } from '@/components/paywall/PaywallGate'
import { ShareButtons } from '@/components/share/ShareButtons'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import { RPGRadarChart } from '@/components/test/RadarChart'
import { AdBanner } from '@/components/ads/AdBanner'
import { useTestStore } from '@/store/testStore'
import { Link } from '@/i18n/navigation'
import { CREDIT_COSTS } from '@/types/billing'
import { trackEvent } from '@/lib/ga4'
import { XPGainToast } from '@/components/gamification/XPGainToast'
import { useUpdateProgress, useUpdateDna } from '@/hooks/useGamification'
import type { TestData, TestResult, PremiumResult, FeedbackCount, ToriMood, GamificationUpdateResult } from '@/types'

// ─── Types ─────────────────────────────────────────────────────

interface Props {
  data: TestData
  result: TestResult
  premiumResult?: PremiumResult
  initialCounts: FeedbackCount
  locale: string
}

interface MessageStep {
  id: string
  mood: ToriMood
  type: 'tori' | 'result_reveal' | 'tags' | 'compatibility' | 'radar' | 'premium_tease' | 'paywall'
  getMessage?: (locale: string) => string
  delay: number // ms after previous
}

// ─── Session flag (skip animation on refresh) ──────────────────

const SESSION_KEY = 'testorum_result_shown'

function wasAlreadyShown(slug: string, resultId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(`${SESSION_KEY}_${slug}_${resultId}`) === '1'
  } catch {
    return false
  }
}

function markAsShown(slug: string, resultId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(`${SESSION_KEY}_${slug}_${resultId}`, '1')
  } catch {
    // sessionStorage unavailable
  }
}

// ─── Component ─────────────────────────────────────────────────

export function ConversationalResult({
  data,
  result,
  premiumResult,
  initialCounts,
  locale,
}: Props) {
  const t = useTranslations('TestResult')
  const tConv = useTranslations('Conversational')
  const { rpgStats } = useTestStore()
  const isKo = locale === 'ko'
  const isRPG = data.scoring.type === 'rpg'
  const hasStats = isRPG && Object.keys(rpgStats).length > 0
  const hasPremium = !!premiumResult

  const skipAnimation = wasAlreadyShown(data.meta.slug, result.id)

  // ─── Gamification Integration ──────────────────────────────
  const { update: updateProgress } = useUpdateProgress()
  const { update: updateDna } = useUpdateDna()
  const [gamificationResult, setGamificationResult] = useState<GamificationUpdateResult | null>(null)
  const gamificationTriggered = useRef(false)

  // Build message sequence
  const steps = useMemo<MessageStep[]>(() => {
    const s: MessageStep[] = []

    s.push({
      id: 'celebrate',
      mood: 'celebrating',
      type: 'tori',
      getMessage: (l) => l === 'ko' ? '결과 나왔다! 🤩' : 'Results are in! 🤩',
      delay: 500,
    })

    s.push({
      id: 'reveal',
      mood: 'excited',
      type: 'result_reveal',
      delay: 1000,
    })

    s.push({
      id: 'description',
      mood: 'curious',
      type: 'tori',
      getMessage: () => result.description,
      delay: 800,
    })

    s.push({
      id: 'tags',
      mood: 'happy',
      type: 'tags',
      delay: 500,
    })

    if (result.compatibility) {
      s.push({
        id: 'compat',
        mood: 'excited',
        type: 'compatibility',
        delay: 800,
      })
    }

    if (hasStats) {
      s.push({
        id: 'radar_intro',
        mood: 'excited',
        type: 'tori',
        getMessage: (l) => l === 'ko' ? '능력치도 분석해봤어! 📊' : 'I analyzed your stats too! 📊',
        delay: 800,
      })
      s.push({
        id: 'radar_chart',
        mood: 'excited',
        type: 'radar',
        delay: 500,
      })
    }

    if (hasPremium) {
      s.push({
        id: 'premium_tease',
        mood: 'smug',
        type: 'premium_tease',
        getMessage: (l) => l === 'ko'
          ? '사실 나 더 많이 알고 있는데... 볼래? 😏'
          : 'I actually know a lot more... wanna see? 😏',
        delay: 800,
      })
      s.push({
        id: 'paywall',
        mood: 'smug',
        type: 'paywall',
        delay: 500,
      })
    }

    return s
  }, [result, hasStats, hasPremium, isKo])

  // Visible step index
  const [visibleCount, setVisibleCount] = useState(skipAnimation ? steps.length : 0)
  const [isTyping, setIsTyping] = useState(!skipAnimation)
  const [skipped, setSkipped] = useState(skipAnimation)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Progressive reveal
  useEffect(() => {
    if (skipped || visibleCount >= steps.length) {
      setIsTyping(false)
      if (!skipAnimation) markAsShown(data.meta.slug, result.id)
      return
    }

    const nextStep = steps[visibleCount]
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1)
    }, nextStep.delay)

    return () => clearTimeout(timer)
  }, [visibleCount, steps, skipped, skipAnimation, data.meta.slug, result.id])

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [visibleCount])

  // Skip handler
  const handleSkip = useCallback(() => {
    setVisibleCount(steps.length)
    setSkipped(true)
    setIsTyping(false)
    markAsShown(data.meta.slug, result.id)
  }, [steps.length, data.meta.slug, result.id])

  const allRevealed = visibleCount >= steps.length
  const emojiDisplay = result.emojiCombo || result.emoji
  const theme = data.meta.theme

  // ─── Trigger gamification + DNA update when conversation completes ──
  useEffect(() => {
    if (!allRevealed || gamificationTriggered.current) return
    gamificationTriggered.current = true

    // Fire-and-forget: update XP/badges
    updateProgress({
      action_type: 'test_complete',
      test_slug: data.meta.slug,
      test_category: data.meta.category,
    }).then((res) => {
      if (res.success && res.data) {
        setGamificationResult(res.data)
        trackEvent('xp_gained', {
          test_slug: data.meta.slug,
          xp: res.data.xp,
          level: res.data.level,
        })
        if (res.data.level_up) {
          trackEvent('level_up', { level: res.data.level })
        }
        for (const badge of res.data.new_badges) {
          trackEvent('badge_earned', { feature: badge.slug })
        }
      }
    }).catch(() => {
      // Silently fail — gamification is non-critical
    })

    // Fire-and-forget: update DNA
    updateDna({
      test_slug: data.meta.slug,
      result_type_id: result.id,
    }).then((res) => {
      if (res.success && !res.skipped) {
        trackEvent('dna_updated', {
          test_slug: data.meta.slug,
          feature: res.category,
        })
      }
    }).catch(() => {
      // Silently fail
    })
  }, [allRevealed, data.meta.slug, data.meta.category, result.id, updateProgress, updateDna])

  return (
    <>
      {/* XP / Badge / Level-up Toast */}
      <XPGainToast
        result={gamificationResult}
        locale={locale}
        onDismiss={() => setGamificationResult(null)}
      />

    <div
      ref={scrollRef}
      className="max-w-[480px] mx-auto px-4 py-6 min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Skip button */}
      {!allRevealed && !skipped && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSkip}
            className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{
              color: theme.primary,
              backgroundColor: `${theme.primary}10`,
            }}
          >
            {isKo ? '건너뛰기 →' : 'Skip →'}
          </button>
        </div>
      )}

      {/* Chat area */}
      <div className="flex flex-col gap-3 flex-1">
        {steps.slice(0, visibleCount).map((step) => (
          <MessageBubble
            key={step.id}
            step={step}
            result={result}
            premiumResult={premiumResult}
            theme={theme}
            locale={locale}
            emojiDisplay={emojiDisplay}
            rpgStats={rpgStats}
            hasStats={hasStats}
            isAnimated={!skipped}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && visibleCount < steps.length && (
          <div className="flex items-center gap-2">
            <ToriAvatar mood={steps[visibleCount]?.mood || 'thinking'} size="md" />
            <TypingIndicator color={theme.primary} />
          </div>
        )}
      </div>

      {/* Post-conversation section */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            className="flex flex-col gap-4 mt-6"
            initial={skipped ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <FeedbackWidget
              testSlug={data.meta.slug}
              resultId={result.id}
              initialCounts={initialCounts}
              locale={locale}
            />

            <AdBanner slot="0987654321" />

            <ShareButtons
              slug={data.meta.slug}
              resultId={result.id}
              shareText={`${data.meta.shareText} - ${result.title}`}
              theme={theme}
              locale={locale}
            />

            <Link
              href="/"
              className="block w-full text-center py-4 rounded-[14px] border border-gray-200 text-gray-500 font-semibold text-sm active:scale-[0.97] transition-all bg-white"
            >
              {t('otherTests')}
            </Link>

            <p className="text-center text-[10px] text-gray-300 mt-2 pb-4">
              testorum.app
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  </>
  )
}

// ─── Message Bubble Renderer ───────────────────────────────────

function MessageBubble({
  step,
  result,
  premiumResult,
  theme,
  locale,
  emojiDisplay,
  rpgStats,
  hasStats,
  isAnimated,
}: {
  step: MessageStep
  result: TestResult
  premiumResult?: PremiumResult
  theme: { primary: string; bg: string; accent: string }
  locale: string
  emojiDisplay: string
  rpgStats: Record<string, number>
  hasStats: boolean
  isAnimated: boolean
}) {
  const isKo = locale === 'ko'

  const wrapper = (children: React.ReactNode) => {
    if (!isAnimated) return <div>{children}</div>
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )
  }

  switch (step.type) {
    case 'tori':
      return wrapper(
        <ToriMessage
          mood={step.mood}
          message={step.getMessage?.(locale) || ''}
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      )

    case 'result_reveal':
      return wrapper(
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="text-5xl" style={{ letterSpacing: '4px' }}>
            {emojiDisplay}
          </div>
          <h2
            className="text-2xl font-extrabold text-center"
            style={{ color: theme.accent, fontFamily: 'var(--font-display)' }}
          >
            {result.title}
          </h2>
        </div>
      )

    case 'tags':
      return wrapper(
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {result.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${theme.primary}10`,
                color: theme.primary,
                border: `1px solid ${theme.primary}25`,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )

    case 'compatibility':
      return wrapper(
        <ToriMessage
          mood="excited"
          message={isKo
            ? `궁합 좋은 유형: ${result.compatibility} 💕`
            : `Best match: ${result.compatibility} 💕`
          }
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      )

    case 'radar':
      return wrapper(
        <div className="w-full max-w-[360px] mx-auto py-2">
          <RPGRadarChart stats={rpgStats} />
        </div>
      )

    case 'premium_tease':
      return wrapper(
        <ToriMessage
          mood={step.mood}
          message={step.getMessage?.(locale) || ''}
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      )

    case 'paywall':
      return wrapper(
        <PaywallGate
          requiredCredits={CREDIT_COSTS.deep_analysis}
          featureName="deep_analysis"
          theme={theme}
          locale={locale}
          toriMessage={isKo
            ? '여기서부터 프리미엄이야 ✨'
            : 'Premium content starts here ✨'
          }
        >
          <PremiumContent
            premiumResult={premiumResult}
            theme={theme}
            locale={locale}
          />
        </PaywallGate>
      )

    default:
      return null
  }
}

// ─── Premium Content (inside PaywallGate) ──────────────────────

function PremiumContent({
  premiumResult,
  theme,
  locale,
}: {
  premiumResult?: PremiumResult
  theme: { primary: string; bg: string; accent: string }
  locale: string
}) {
  const isKo = locale === 'ko'
  // locale is already resolved by getTestData

  if (!premiumResult) {
    return (
      <div className="p-6 text-center" style={{ color: theme.accent + '88' }}>
        <p className="text-sm">
          {isKo ? '프리미엄 콘텐츠 준비 중...' : 'Premium content coming soon...'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Deep analysis */}
      <div className="px-4">
        <ToriMessage
          mood="thinking"
          message={premiumResult.deepAnalysis}
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      </div>

      {/* Strengths */}
      <div className="px-4">
        <ToriMessage
          mood="happy"
          message={
            (isKo ? '💪 너의 강점이야!\n' : '💪 Your strengths!\n') +
            premiumResult.strengths.map((s) => `• ${s}`).join('\n')
          }
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      </div>

      {/* Weaknesses */}
      <div className="px-4">
        <ToriMessage
          mood="curious"
          message={
            (isKo ? '⚠️ 이건 좀 조심!\n' : '⚠️ Watch out for:\n') +
            premiumResult.weaknesses.map((w) => `• ${w}`).join('\n')
          }
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      </div>

      {/* Advice */}
      <div className="px-4">
        <ToriMessage
          mood="happy"
          message={
            (isKo ? '💡 토리의 조언!\n' : '💡 Tori\'s advice!\n') +
            premiumResult.advice
          }
          locale={locale}
          theme={theme}
          showTypingIndicator={false}
          delay={0}
        />
      </div>
    </div>
  )
}
