'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { CreatorWaitlist } from '@/components/waitlist/CreatorWaitlist'
import { FEATURES } from '@/lib/feature-flags'

// ─── Types ─────────────────────────────────────────────────

interface TestItem {
  slug: string
  title: string
  subtitle: string
  emoji: string
  category: string
  estimatedMinutes: number
  themePrimary: string
}

interface Props {
  tests: TestItem[]
  locale: string
}

// ─── Constants ─────────────────────────────────────────────

const CATEGORY_FILTERS = ['all', 'love', 'communication', 'work', 'social', 'money', 'identity', 'lifestyle'] as const

const CATEGORY_EMOJI: Record<string, string> = {
  love: '💕',
  communication: '💬',
  work: '💼',
  social: '🎭',
  money: '💰',
  identity: '🔮',
  lifestyle: '🌿',
}

const FEATURED_SLUGS = ['t01', 't03', 't06']

// ─── Component ─────────────────────────────────────────────

export function LandingClient({ tests, locale }: Props) {
  const t = useTranslations('Home')
  const tCat = useTranslations('Categories')
  const tFooter = useTranslations('Footer')
  const tNav = useTranslations('Nav')
  const isKo = locale === 'ko'

  const [activeFilter, setActiveFilter] = useState<string>('all')

  const featured = useMemo(
    () => tests.filter((t) => FEATURED_SLUGS.includes(t.slug)),
    [tests]
  )

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return tests
    return tests.filter((t) => t.category === activeFilter)
  }, [tests, activeFilter])

  const getCategoryLabel = (key: string) => {
    if (key === 'all') return tCat('all')
    try { return tCat(key as 'love') } catch { return key }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-4xl mx-auto px-4">

        {/* ═══ Hero ═══ */}
        <motion.section
          className="pt-16 pb-10 md:pt-20 md:pb-14 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-5">
            <Image
              src="/tori/celebrating.png"
              alt="Tori"
              width={96}
              height={96}
              className="drop-shadow-lg"
              priority
              unoptimized
            />
          </div>

          <h1
            className="text-3xl md:text-[40px] font-extrabold tracking-tight leading-tight mb-3"
            style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}
          >
            {t('heroHeadline')}
          </h1>

          <p className="text-sm md:text-base mb-6 max-w-md mx-auto" style={{ color: '#9B9B9B' }}>
            {t('heroStats')}
          </p>

          <Link
            href="/tests/t01"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all active:scale-[0.97] hover:brightness-110"
            style={{
              backgroundColor: '#FF4F4F',
              boxShadow: '0 4px 14px #FF4F4F44',
            }}
          >
            {t('heroCta')}
            <span className="text-base">→</span>
          </Link>
        </motion.section>

        {/* ═══ Featured Tests ═══ */}
        {featured.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-lg font-extrabold mb-4"
              style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}
            >
              🔥 {t('featuredTitle')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {featured.map((test, i) => (
                <motion.div
                  key={test.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <FeaturedCard test={test} locale={locale} getCategoryLabel={getCategoryLabel} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ Category Filter + All Tests ═══ */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-extrabold"
              style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}
            >
              {t('allTestsTitle')}
            </h2>
            <Link
              href="/tests"
              className="text-xs font-semibold"
              style={{ color: '#FF4F4F' }}
            >
              {t('viewAll')} →
            </Link>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((test, i) => (
              <motion.div
                key={test.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              >
                <TestCard test={test} locale={locale} getCategoryLabel={getCategoryLabel} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: '#9B9B9B' }}>
              {isKo ? '해당 카테고리에 테스트가 없어요' : 'No tests in this category yet'}
            </p>
          )}
        </section>

        {/* ═══ Creator Waitlist ═══ */}
        {!FEATURES.CREATOR_ENABLED && (
          <section className="mb-10">
            <CreatorWaitlist locale={locale} />
          </section>
        )}

        {/* ═══ Footer ═══ */}
        <footer className="border-t border-gray-100 py-8 mb-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4 text-xs font-medium" style={{ color: '#9B9B9B' }}>
              <Link href="/about" className="hover:underline">{tNav('about')}</Link>
              <Link href="/privacy" className="hover:underline">{tFooter('privacy')}</Link>
              <Link href="/tests" className="hover:underline">{tNav('tests')}</Link>
            </div>
            <p className="text-[10px] text-center max-w-sm" style={{ color: '#C4C4C4' }}>
              {t('disclaimer')}
            </p>
            <p className="text-[10px]" style={{ color: '#C4C4C4' }}>
              © {new Date().getFullYear()} Testorum
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ─── Featured Card ─────────────────────────────────────────

function FeaturedCard({
  test,
  locale,
  getCategoryLabel,
}: {
  test: TestItem
  locale: string
  getCategoryLabel: (key: string) => string
}) {
  return (
    <Link
      href={`/tests/${test.slug}`}
      className="group block rounded-[16px] bg-white overflow-hidden active:scale-[0.98] transition-all hover:shadow-lg"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      {/* Top accent */}
      <div className="h-1" style={{ backgroundColor: test.themePrimary }} />

      <div className="px-5 py-4">
        <div className="flex items-start gap-3 mb-2">
          <div
            className="w-11 h-11 rounded-[10px] flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: test.themePrimary + '15' }}
          >
            {test.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] leading-tight" style={{ color: '#1A1A1A' }}>
              {test.title}
            </p>
            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9B9B9B' }}>
              {test.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: test.themePrimary + '12', color: test.themePrimary }}
          >
            {CATEGORY_EMOJI[test.category] || '📝'} {getCategoryLabel(test.category)}
          </span>
          <span className="text-[10px]" style={{ color: '#C4C4C4' }}>
            ~{test.estimatedMinutes}{locale === 'ko' ? '분' : ' min'}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Test Card ─────────────────────────────────────────────

function TestCard({
  test,
  locale,
  getCategoryLabel,
}: {
  test: TestItem
  locale: string
  getCategoryLabel: (key: string) => string
}) {
  return (
    <Link
      href={`/tests/${test.slug}`}
      className="group block rounded-[16px] bg-white overflow-hidden active:scale-[0.98] transition-all hover:shadow-lg press-effect"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Emoji */}
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
          {/* Subtitle: always visible on mobile, extra info on desktop */}
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9B9B9B' }}>
            {test.subtitle}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: test.themePrimary + '12', color: test.themePrimary }}
            >
              {getCategoryLabel(test.category)}
            </span>
            <span className="text-[10px]" style={{ color: '#C4C4C4' }}>
              ~{test.estimatedMinutes}{locale === 'ko' ? '분' : ' min'}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <span className="text-gray-300 text-lg shrink-0 group-hover:text-gray-400 transition-colors">›</span>
      </div>

      {/* Bottom accent */}
      <div className="h-[2px]" style={{ backgroundColor: test.themePrimary + '30' }} />
    </Link>
  )
}
