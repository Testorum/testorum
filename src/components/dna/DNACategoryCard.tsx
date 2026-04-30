'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import type { DnaProfileByCategory } from '@/types'

interface Props {
  category: {
    id: string
    labelEn: string
    labelKo: string
    emoji: string
  }
  data: DnaProfileByCategory | null
  locale: string
  /** Test slugs mapped to this category (for CTA when empty) */
  suggestedTestSlug?: string
}

const TRAIT_LABELS: Record<string, Record<string, { en: string; ko: string }>> = {
  love: {
    directness: { en: 'Directness', ko: '직진형' },
    patience: { en: 'Patience', ko: '인내심' },
    emotional_openness: { en: 'Emotional Openness', ko: '감정 표현' },
    strategic_thinking: { en: 'Strategic Thinking', ko: '전략적 사고' },
  },
  work: {
    leadership: { en: 'Leadership', ko: '리더십' },
    adaptability: { en: 'Adaptability', ko: '적응력' },
    ambition: { en: 'Ambition', ko: '야망' },
    collaboration: { en: 'Collaboration', ko: '협업력' },
  },
  social: {
    assertiveness: { en: 'Assertiveness', ko: '주도성' },
    empathy: { en: 'Empathy', ko: '공감력' },
    composure: { en: 'Composure', ko: '침착함' },
    diplomacy: { en: 'Diplomacy', ko: '외교력' },
  },
  money: {
    discipline: { en: 'Discipline', ko: '절제력' },
    risk_tolerance: { en: 'Risk Tolerance', ko: '위험 감수' },
    generosity: { en: 'Generosity', ko: '관대함' },
    planning: { en: 'Planning', ko: '계획성' },
  },
  communication: {
    responsiveness: { en: 'Responsiveness', ko: '반응 속도' },
    clarity: { en: 'Clarity', ko: '명확성' },
    emotional_awareness: { en: 'Emotional Awareness', ko: '감성 인식' },
    humor: { en: 'Humor', ko: '유머' },
  },
}

export function DNACategoryCard({ category, data, locale, suggestedTestSlug }: Props) {
  const isKo = locale === 'ko'
  const isEmpty = !data || data.entries.length === 0

  if (isEmpty) {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl opacity-40">🔒</span>
          <span className="text-sm font-semibold text-gray-400">
            {isKo ? category.labelKo : category.labelEn}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {isKo
            ? '이 카테고리의 테스트를 하면 알 수 있어!'
            : 'Take a test in this category to unlock!'
          }
        </p>
        {suggestedTestSlug && (
          <Link
            href={`/tests/${suggestedTestSlug}`}
            className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 active:scale-95 transition-all"
          >
            {isKo ? '테스트 하러 가기 →' : 'Take the test →'}
          </Link>
        )}
      </div>
    )
  }

  const traits = data.averageTraits
  const traitLabels = TRAIT_LABELS[category.id] ?? {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{category.emoji}</span>
        <span className="text-sm font-bold text-gray-700">
          {isKo ? category.labelKo : category.labelEn}
        </span>
      </div>

      {/* Latest result label */}
      {data.entries[0] && (
        <p className="text-xs text-gray-500 mb-3">
          {isKo ? data.entries[0].result_label_ko : data.entries[0].result_label_en}
          <span className="text-gray-300 ml-1">
            ({isKo ? `${data.entries.length}개 테스트 기반` : `based on ${data.entries.length} test${data.entries.length > 1 ? 's' : ''}`})
          </span>
        </p>
      )}

      {/* Trait bars */}
      <div className="flex flex-col gap-2">
        {Object.entries(traits).map(([traitKey, value]) => {
          const label = traitLabels[traitKey]
          return (
            <div key={traitKey}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-gray-500">
                  {label ? (isKo ? label.ko : label.en) : traitKey}
                </span>
                <span className="text-[10px] text-gray-400">
                  {Math.round((value as number) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(value as number) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
