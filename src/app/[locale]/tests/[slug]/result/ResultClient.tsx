'use client'

import { useState, useEffect } from 'react'
import { ConversationalResult } from '@/components/test/ConversationalResult'
import { useTestStore } from '@/store/testStore'
import type { TestData, TestResult, FeedbackCount, PremiumResult } from '@/types'
import type { TPMResult } from '@/lib/scoring'

interface Props {
  data: TestData
  result: TestResult
  initialCounts: FeedbackCount
  locale: string
}

// TestData extended with optional premiumResults
interface TestDataExtended extends TestData {
  premiumResults?: Record<string, PremiumResult>
}

export function ResultClient({ data, result, initialCounts, locale }: Props) {
  const extData = data as TestDataExtended
  const premiumResult = extData.premiumResults?.[result.id]

  // TPM result: try Zustand store first, then sessionStorage fallback
  const storeTpm = useTestStore((s) => s.tpmResult)
  const [tpmResult, setTpmResult] = useState<TPMResult | null>(storeTpm)

  useEffect(() => {
    if (tpmResult) return
    // Fallback: read from sessionStorage
    try {
      const stored = sessionStorage.getItem(`tpm_${data.meta.slug}_${result.id}`)
      if (stored) {
        setTpmResult(JSON.parse(stored) as TPMResult)
      }
    } catch { /* sessionStorage unavailable */ }
  }, [data.meta.slug, result.id, tpmResult])

  return (
    <ConversationalResult
      data={data}
      result={result}
      premiumResult={premiumResult}
      initialCounts={initialCounts}
      locale={locale}
      tpmResult={tpmResult}
    />
  )
}
