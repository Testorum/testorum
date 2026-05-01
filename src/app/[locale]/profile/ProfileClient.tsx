'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { UserLevelBadge } from '@/components/gamification/UserLevelBadge'
import { XPProgressBar } from '@/components/gamification/XPProgressBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { StreakCalendar } from '@/components/gamification/StreakCalendar'
import { DNAProfile } from '@/components/dna/DNAProfile'
import { Link } from '@/i18n/navigation'
import { useProgress, useDnaProfile } from '@/hooks/useGamification'
import { trackEvent } from '@/lib/ga4'
import { ReferralTab } from './ReferralTab'
import type { DnaProfileByCategory, PersonalityDnaEntry } from '@/types'

// ─── Types ──────────────────────────────────────────────────────

type TabId = 'overview' | 'dna' | 'history' | 'referral'

interface Props {
  locale: string
  user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
    referralCode: string | null
  }
}

const TABS: Array<{ id: TabId; emoji: string; labelEn: string; labelKo: string }> = [
  { id: 'overview', emoji: '🏠', labelEn: 'Overview', labelKo: '홈' },
  { id: 'dna',      emoji: '🧬', labelEn: 'DNA', labelKo: 'DNA' },
  { id: 'history',  emoji: '📋', labelEn: 'History', labelKo: '기록' },
  { id: 'referral', emoji: '👥', labelEn: 'Referral', labelKo: '초대' },
]

// ─── Component ──────────────────────────────────────────────────

export function ProfileClient({ locale, user }: Props) {
  const t = useTranslations('Profile')
  const isKo = locale === 'ko'
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialTab = (searchParams.get('tab') as TabId) || 'overview'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  const { data: gamification, loading: gamLoading } = useProgress()
  const { data: dnaData, loading: dnaLoading } = useDnaProfile()

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    router.replace(`?tab=${tab}`, { scroll: false })
    trackEvent('test_complete', { feature: `profile_tab_${tab}` })
  }, [router])

  const progress = gamification?.progress

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-gray-50">
      {/* ── Mobile Header ── */}
      <div className="md:hidden bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-gray-800 truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {user.displayName}
            </h1>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          {progress && (
            <UserLevelBadge level={progress.level} streak={progress.current_streak} />
          )}
        </div>
      </div>

      {/* ── Mobile Tabs ── */}
      <div className="md:hidden bg-white border-b border-gray-100 px-2 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold
              transition-colors relative
              ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-400'}
            `}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{isKo ? tab.labelKo : tab.labelEn}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="profile-tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-gray-800 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Desktop 2-Column Layout ── */}
      <div className="hidden md:flex gap-6 px-6 py-8">
        {/* Sidebar */}
        <aside className="w-72 shrink-0">
          <div className="sticky top-8 flex flex-col gap-4">
            {/* User Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center text-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div>
                  <h1 className="text-lg font-extrabold text-gray-800" style={{ fontFamily: 'var(--font-display)' }}>
                    {user.displayName}
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </div>
                {progress && (
                  <UserLevelBadge level={progress.level} streak={progress.current_streak} />
                )}
              </div>
              {progress && (
                <div className="mt-4">
                  <XPProgressBar level={progress.level} xp={progress.xp} />
                </div>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold
                    transition-colors border-l-3
                    ${activeTab === tab.id
                      ? 'text-gray-800 bg-gray-50 border-l-[3px] border-l-[#FF4F4F]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-l-[3px] border-l-transparent'
                    }
                  `}
                >
                  <span className="text-base">{tab.emoji}</span>
                  <span>{isKo ? tab.labelKo : tab.labelEn}</span>
                </button>
              ))}
            </nav>

            {/* Streak (sidebar) */}
            {progress && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <StreakCounter
                  streak={progress.current_streak}
                  longestStreak={progress.longest_streak}
                />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  gamification={gamification}
                  loading={gamLoading}
                  locale={locale}
                  hideXPAndStreak
                />
              )}
              {activeTab === 'dna' && (
                <DnaTab dnaData={dnaData} loading={dnaLoading} locale={locale} />
              )}
              {activeTab === 'history' && (
                <HistoryTab dnaData={dnaData} loading={dnaLoading} locale={locale} />
              )}
              {activeTab === 'referral' && (
                <ReferralTab referralCode={user.referralCode ?? ''} locale={locale} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Tab Content ── */}
      <div className="md:hidden px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab gamification={gamification} loading={gamLoading} locale={locale} />
            )}
            {activeTab === 'dna' && (
              <DnaTab dnaData={dnaData} loading={dnaLoading} locale={locale} />
            )}
            {activeTab === 'history' && (
              <HistoryTab dnaData={dnaData} loading={dnaLoading} locale={locale} />
            )}
            {activeTab === 'referral' && (
              <ReferralTab referralCode={user.referralCode ?? ''} locale={locale} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── User Avatar ────────────────────────────────────────────────

function UserAvatar({
  user,
  size = 'md',
}: {
  user: { displayName: string; avatarUrl: string | null }
  size?: 'md' | 'lg'
}) {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-14 h-14 text-xl'
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm`}>
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        : user.displayName.charAt(0).toUpperCase()
      }
    </div>
  )
}

// ─── Tab 1: Overview ────────────────────────────────────────────

function OverviewTab({
  gamification,
  loading,
  locale,
  hideXPAndStreak = false,
}: {
  gamification: ReturnType<typeof useProgress>['data']
  loading: boolean
  locale: string
  hideXPAndStreak?: boolean
}) {
  const t = useTranslations('Gamification')

  if (loading) {
    return <LoadingSkeleton />
  }

  const progress = gamification?.progress
  const badges = gamification?.badges ?? []
  const allBadges = gamification?.allBadges ?? []

  const testDates = progress?.last_test_date ? [progress.last_test_date] : []

  return (
    <div className="flex flex-col gap-5">
      {progress ? (
        <>
          {!hideXPAndStreak && (
            <>
              <XPProgressBar level={progress.level} xp={progress.xp} />
              <StreakCounter
                streak={progress.current_streak}
                longestStreak={progress.longest_streak}
              />
            </>
          )}
          <StreakCalendar testDates={testDates} />
          <BadgeGrid
            allBadges={allBadges}
            earnedBadges={badges}
            locale={locale}
          />
        </>
      ) : (
        <EmptyState
          emoji="🎮"
          message={locale === 'ko'
            ? '아직 테스트를 안 해봤어! 첫 테스트를 해볼까?'
            : "You haven't taken any tests yet! Want to start?"
          }
          ctaHref="/"
          ctaLabel={locale === 'ko' ? '테스트 하러 가기' : 'Take a test'}
        />
      )}
    </div>
  )
}

// ─── Tab 2: DNA ─────────────────────────────────────────────────

function DnaTab({
  dnaData,
  loading,
  locale,
}: {
  dnaData: ReturnType<typeof useDnaProfile>['data']
  loading: boolean
  locale: string
}) {
  if (loading) return <LoadingSkeleton />

  const profile = (dnaData?.profile ?? []) as DnaProfileByCategory[]

  if (profile.length === 0) {
    return (
      <EmptyState
        emoji="🧬"
        message={locale === 'ko'
          ? 'DNA 프로필이 아직 비어있어! 테스트를 하면 채워져'
          : 'Your DNA profile is empty! Take tests to fill it up'
        }
        ctaHref="/"
        ctaLabel={locale === 'ko' ? '테스트 하러 가기' : 'Take a test'}
      />
    )
  }

  return <DNAProfile profile={profile} locale={locale} />
}

// ─── Tab 3: History ─────────────────────────────────────────────

function HistoryTab({
  dnaData,
  loading,
  locale,
}: {
  dnaData: ReturnType<typeof useDnaProfile>['data']
  loading: boolean
  locale: string
}) {
  const isKo = locale === 'ko'

  if (loading) return <LoadingSkeleton />

  const entries = (dnaData?.entries ?? []) as PersonalityDnaEntry[]

  if (entries.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        message={isKo
          ? '아직 기록이 없어! 테스트를 하면 여기에 쌓여'
          : 'No history yet! Your test results will appear here'
        }
        ctaHref="/"
        ctaLabel={isKo ? '테스트 하러 가기' : 'Take a test'}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/tests/${entry.test_slug}/result?r=${entry.result_type_id}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 active:scale-[0.98] transition-all hover:shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {isKo ? entry.result_label_ko : entry.result_label_en}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {entry.test_slug} · {entry.category} · {new Date(entry.taken_at).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}
            </p>
          </div>
          <span className="text-gray-300 text-sm">→</span>
        </Link>
      ))}
    </div>
  )
}

// ─── Shared Components ──────────────────────────────────────────

function EmptyState({
  emoji,
  message,
  ctaHref,
  ctaLabel,
}: {
  emoji: string
  message: string
  ctaHref?: string
  ctaLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <span className="text-4xl">{emoji}</span>
      <p className="text-sm text-gray-400 text-center max-w-[240px]">{message}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="px-4 py-2 rounded-full text-xs font-bold text-white active:scale-95 transition-all"
          style={{ backgroundColor: '#FF4F4F' }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-full w-2/3" />
      <div className="h-4 bg-gray-100 rounded-full w-full" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-20 bg-gray-100 rounded-2xl" />
    </div>
  )
}
