'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface TestItem {
  slug: string
  title: string
  emoji: string
  category: string
  estimatedMinutes: number
  themePrimary: string
  questionCount: number
}

interface Props {
  tests: TestItem[]
  locale: string
}

const CATEGORY_FILTERS = ['all', 'love', 'communication', 'work', 'social', 'money'] as const

export function TestListClient({ tests, locale }: Props) {
  const t = useTranslations('TestList')
  const tCat = useTranslations('Categories')
  const isKo = locale === 'ko'
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return tests
    return tests.filter((t) => t.category === activeFilter)
  }, [tests, activeFilter])

  const getCategoryLabel = (key: string) => {
    if (key === 'all') return t('filterAll')
    try { return tCat(key as 'love') } catch { return key }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl md:text-3xl font-extrabold"
            style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}
          >
            {t('title')}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#9B9B9B' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`
                  shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all
                  ${isActive
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }
                `}
                style={isActive ? { backgroundColor: '#FF4F4F' } : undefined}
              >
                {getCategoryLabel(cat)}
              </button>
            )
          })}
        </div>

        {/* Test grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Image
              src="/tori/curious.png"
              alt="Tori curious"
              width={80}
              height={80}
            />
            <p className="text-sm text-gray-400">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filtered.map((test) => (
              <Link
                key={test.slug}
                href={`/tests/${test.slug}`}
                className="block rounded-[16px] bg-white overflow-hidden active:scale-[0.98] transition-all press-effect hover:shadow-lg"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
                }}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Emoji with theme bg */}
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: test.themePrimary + '15' }}
                  >
                    {test.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px]" style={{ color: '#1A1A1A' }}>
                      {test.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>
                      {isKo ? '약' : '~'} {test.estimatedMinutes}{isKo ? '분' : ' min'} · {getCategoryLabel(test.category)}
                    </p>
                  </div>
                  {/* Arrow */}
                  <span className="text-gray-300 text-lg shrink-0">›</span>
                </div>
                {/* Bottom accent line */}
                <div className="h-[2px]" style={{ backgroundColor: test.themePrimary + '30' }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
