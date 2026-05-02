import type { TestData, TestOption } from '@/types'

// 유형별 점수 누적 방식 (T01, T02, T03, T04)
export function scoreAccumulate(
  answers: TestOption[],
  data: TestData
): string {
  const scores: Record<string, number> = {}
  const dims = data.scoring.dimensions ?? []
  dims.forEach((d) => (scores[d] = 0))

  answers.forEach((opt) => {
    Object.entries(opt.scores).forEach(([key, val]) => {
      scores[key] = (scores[key] ?? 0) + val
    })
  })

  const winner = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )
  return winner[0]
}

// RPG 방식 (T05) - 각 스탯 합산
export function scoreRPG(answers: TestOption[]): Record<string, number> {
  const stats: Record<string, number> = {}
  answers.forEach((opt) => {
    Object.entries(opt.scores).forEach(([key, val]) => {
      stats[key] = (stats[key] ?? 0) + val
    })
  })
  return stats
}

// 최고 스탯으로 결과 ID 결정
export function resolveResult(
  testData: TestData,
  answers: TestOption[]
): string {
  if (testData.scoring.type === 'rpg') {
    const stats = scoreRPG(answers)
    const winner = Object.entries(stats).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )
    const topDimension = winner[0]

    // dimensionToResult 매핑이 있으면 변환 (e.g. charm → bard)
    if (testData.scoring.dimensionToResult?.[topDimension]) {
      return testData.scoring.dimensionToResult[topDimension]
    }

    // 매핑 없으면 dimension 이름을 그대로 반환 (fallback)
    return topDimension
  }
  return scoreAccumulate(answers, testData)
}
