'use client'

import { ResultCard } from '@/components/test/ResultCard'
import { ShareButtons } from '@/components/share/ShareButtons'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import { AdBanner } from '@/components/ads/AdBanner'
import { CoupangBanner } from '@/components/ads/CoupangBanner'
import { RPGRadarChart } from '@/components/test/RadarChart'
import { useTestStore } from '@/store/testStore'
import type { TestData, TestResult, FeedbackCount } from '@/types'
import Link from 'next/link'

interface Props {
  data: TestData
  result: TestResult
  initialCounts: FeedbackCount
}

export function ResultClient({ data, result, initialCounts }: Props) {
  const { rpgStats } = useTestStore()
  const isRPG = data.scoring.type === 'rpg'
  const hasStats = isRPG && Object.keys(rpgStats).length > 0

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-4">
      <ResultCard result={result} meta={data.meta}>
        {hasStats && (
          <div className="mt-4 w-full">
            <RPGRadarChart stats={rpgStats} />
          </div>
        )}
        <FeedbackWidget
          testSlug={data.meta.slug}
          resultId={result.id}
          initialCounts={initialCounts}
        />
      </ResultCard>

      <AdBanner slot="0987654321" />

      <div>
        <p className="text-sm text-gray-500 text-center mb-3 font-medium">
          친구한테 공유해보세요!
        </p>
        <ShareButtons
          slug={data.meta.slug}
          resultId={result.id}
          shareText={`${data.meta.shareText} - ${result.title}`}
        />
      </div>

      {result.coupangKeyword && (
        <CoupangBanner
          keyword={result.coupangKeyword}
          url={result.coupangUrl}
          testSlug={data.meta.slug}
        />
      )}

      <Link
        href="/"
        className="block w-full text-center py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-semibold text-sm active:scale-95 transition-all"
      >
        다른 테스트 해보기
      </Link>
    </div>
  )
}
