'use client'

import { ConversationalResult } from '@/components/test/ConversationalResult'
import type { TestData, TestResult, FeedbackCount, PremiumResult } from '@/types'

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

  return (
    <ConversationalResult
      data={data}
      result={result}
      premiumResult={premiumResult}
      initialCounts={initialCounts}
      locale={locale}
    />
  )
}
