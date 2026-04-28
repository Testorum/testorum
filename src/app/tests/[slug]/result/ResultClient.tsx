'use client'

import { ResultCard } from '@/components/test/ResultCard'
import { ShareButtons } from '@/components/share/ShareButtons'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import { AdBanner } from '@/components/ads/AdBanner'
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
    <div
      className="max-w-[480px] mx-auto px-4 py-8 flex flex-col gap-4 min-h-screen"
      style={{ backgroundColor: data.meta.theme.bg }}
    >
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

      <ShareButtons
        slug={data.meta.slug}
        resultId={result.id}
        shareText={`${data.meta.shareText} - ${result.title}`}
        theme={data.meta.theme}
      />

      <Link
        href="/"
        className="block w-full text-center py-4 rounded-[14px] border border-gray-200 text-gray-500 font-semibold text-sm active:scale-[0.97] transition-all bg-white"
      >
        다른 테스트 해보기
      </Link>

      {/* Testorum watermark */}
      <p className="text-center text-[10px] text-gray-300 mt-4 pb-4">
        testorum.app
      </p>
    </div>
  )
}
