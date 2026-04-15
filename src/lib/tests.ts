import type { TestData } from '@/types'

const testSlugs = ['t01', 't02', 't03', 't04', 't05']

export async function getTestData(slug: string): Promise<TestData | null> {
  if (!testSlugs.includes(slug)) return null
  try {
    const data = await import(`@/data/tests/${slug}.json`)
    return data.default as TestData
  } catch {
    return null
  }
}

export function getAllTestSlugs() {
  return testSlugs
}
