import type { TestDataRaw, TestDataWithPremium } from '@/types'
import { getLocalizedTest } from '@/lib/test-locale'

const testSlugs = [
  't01', 't02', 't03', 't04', 't05', 't06', 't07', 't08', 't09', 't10',
  't11', 't12', 't13', 't14', 't15', 't16', 't17', 't18', 't19', 't20',
]

export async function getTestData(slug: string, locale: string = 'en'): Promise<TestDataWithPremium | null> {
  if (!testSlugs.includes(slug)) return null
  try {
    const data = await import(`@/data/tests/${slug}.json`)
    const raw = data.default as TestDataRaw
    return getLocalizedTest(raw, locale)
  } catch {
    return null
  }
}

/**
 * Raw JSON 데이터 직접 반환 (premiumResults locale 개별 처리 등에 사용)
 */
export async function getTestDataRaw(slug: string): Promise<TestDataRaw | null> {
  if (!testSlugs.includes(slug)) return null
  try {
    const data = await import(`@/data/tests/${slug}.json`)
    return data.default as TestDataRaw
  } catch {
    return null
  }
}

export function getAllTestSlugs() {
  return testSlugs
}
