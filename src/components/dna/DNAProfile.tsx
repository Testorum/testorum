'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { DNA_CATEGORIES } from '@/lib/dna-calculator'
import { DNACategoryCard } from '@/components/dna/DNACategoryCard'
import { PaywallGate } from '@/components/paywall/PaywallGate'
import { ToriMessage } from '@/components/tori/ToriMessage'
import { CREDIT_COSTS } from '@/types/billing'
import type { DnaProfileByCategory } from '@/types'

interface Props {
  profile: DnaProfileByCategory[]
  locale: string
}

// Test slug suggestions per category (first test in each)
const CATEGORY_TEST_MAP: Record<string, string> = {
  love: 't01',
  work: 't06',
  social: 't07',
  money: 't08',
  communication: 't03',
}

export function DNAProfile({ profile, locale }: Props) {
  const t = useTranslations('DNA')
  const isKo = locale === 'ko'

  // Build profile lookup
  const profileMap = useMemo(() => {
    const map = new Map<string, DnaProfileByCategory>()
    for (const p of profile) {
      map.set(p.category, p)
    }
    return map
  }, [profile])

  // Radar chart data (0~100 scale / unfilled categories = 0)
  const radarData = useMemo(() => {
    return DNA_CATEGORIES.map((cat) => {
      const catProfile = profileMap.get(cat.id)
      if (!catProfile) return { category: isKo ? cat.labelKo : cat.labelEn, value: 0, fullMark: 100 }

      // Average of all trait values (0~1 → 0~100)
      const traits = Object.values(catProfile.averageTraits)
      const avg = traits.length > 0
        ? traits.reduce((sum, v) => sum + (v as number), 0) / traits.length * 100
        : 0

      return {
        category: isKo ? cat.labelKo : cat.labelEn,
        value: Math.round(avg),
        fullMark: 100,
      }
    })
  }, [profileMap, isKo])

  const filledCount = profile.length
  const totalCategories = DNA_CATEGORIES.length

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-extrabold text-gray-800" style={{ fontFamily: 'var(--font-display)' }}>
          🧬 {t('title')}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {t('filledCategories', { filled: filledCount, total: totalCategories })}
        </p>
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full aspect-square max-w-[320px] mx-auto"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }}
            />
            <Radar
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Cards */}
      <div className="flex flex-col gap-3">
        {DNA_CATEGORIES.map((cat) => {
          const catProfile = profileMap.get(cat.id) ?? null
          return (
            <DNACategoryCard
              key={cat.id}
              category={cat}
              data={catProfile}
              locale={locale}
              suggestedTestSlug={CATEGORY_TEST_MAP[cat.id]}
            />
          )
        })}
      </div>

      {/* Cross-analysis (premium) */}
      {filledCount >= 2 && (
        <div className="mt-2">
          <PaywallGate
            requiredCredits={CREDIT_COSTS.deep_analysis}
            featureName="cross_analysis"
            theme={{ primary: '#8b5cf6', bg: '#faf5ff', accent: '#7c3aed' }}
            locale={locale}
            toriMessage={isKo
              ? '교차 분석으로 숨겨진 패턴을 찾아볼까? 🔮'
              : 'Want to discover hidden patterns? 🔮'
            }
          >
            <CrossAnalysis profile={profile} locale={locale} />
          </PaywallGate>
        </div>
      )}
    </div>
  )
}

// ─── Cross Analysis (Premium) ────────────────────────────────────

function CrossAnalysis({
  profile,
  locale,
}: {
  profile: DnaProfileByCategory[]
  locale: string
}) {
  const isKo = locale === 'ko'

  // Simple cross-analysis: find contrasting traits
  const insights = useMemo(() => {
    if (profile.length < 2) return []

    const results: string[] = []
    const catTraits = profile.map((p) => ({
      category: p.category,
      avgTraits: p.averageTraits,
    }))

    // Compare first two categories for interesting contrasts
    for (let i = 0; i < catTraits.length; i++) {
      for (let j = i + 1; j < catTraits.length; j++) {
        const a = catTraits[i]
        const b = catTraits[j]
        const aAvg = Object.values(a.avgTraits).reduce((s, v) => s + (v as number), 0) / Math.max(Object.keys(a.avgTraits).length, 1)
        const bAvg = Object.values(b.avgTraits).reduce((s, v) => s + (v as number), 0) / Math.max(Object.keys(b.avgTraits).length, 1)

        if (Math.abs(aAvg - bAvg) > 0.3) {
          const highCat = aAvg > bAvg ? a.category : b.category
          const lowCat = aAvg > bAvg ? b.category : a.category
          results.push(
            isKo
              ? `${highCat}에서는 적극적인데 ${lowCat}에서는 신중한 편이야! 이런 조합 꽤 흥미로운데... 😏`
              : `You're bold in ${highCat} but cautious in ${lowCat}! That's quite an interesting combo... 😏`
          )
        }
      }
    }

    if (results.length === 0) {
      results.push(
        isKo
          ? '전반적으로 균형 잡힌 프로필이야! 꽤 안정적인 사람인 것 같아 🌟'
          : 'You have a well-balanced profile! You seem like a stable person 🌟'
      )
    }

    return results
  }, [profile, isKo])

  return (
    <div className="flex flex-col gap-3 py-2">
      {insights.map((insight, i) => (
        <ToriMessage
          key={i}
          mood="smug"
          message={insight}
          locale={locale}
          theme={{ primary: '#8b5cf6', bg: '#faf5ff', accent: '#7c3aed' }}
          showTypingIndicator={false}
          delay={0}
        />
      ))}
    </div>
  )
}
