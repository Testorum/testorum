/**
 * Testorum DNA Calculator — Provider Pattern
 *
 * Phase A: 규칙 기반 (JSON dna_mapping.traits에서 직접 매핑)
 * Phase B: ARIA 분석으로 교체 (env NEXT_PUBLIC_ARIA_API_URL 감지)
 */

import type { DnaMapping, TestInteraction } from '@/types'

// ─── Provider Interface ─────────────────────────────────────────

export interface DnaCalculatorProvider {
  calculateTraits(params: {
    testSlug: string
    resultTypeId: string
    dnaMapping: DnaMapping
    interactions?: TestInteraction[]
  }): Promise<Record<string, number>>
}

// ─── Phase A: Rule-Based ────────────────────────────────────────

class RuleBasedDnaCalculator implements DnaCalculatorProvider {
  async calculateTraits({
    resultTypeId,
    dnaMapping,
  }: {
    testSlug: string
    resultTypeId: string
    dnaMapping: DnaMapping
    interactions?: TestInteraction[]
  }): Promise<Record<string, number>> {
    const traits = dnaMapping.traits[resultTypeId]
    if (!traits || typeof traits !== 'object') {
      return {}
    }
    // trait 값 0~1 범위 클램핑
    const clamped: Record<string, number> = {}
    for (const [key, value] of Object.entries(traits)) {
      if (typeof value === 'number' && !isNaN(value)) {
        clamped[key] = Math.max(0, Math.min(1, value))
      }
    }
    return clamped
  }
}

// ─── Phase B: ARIA (준비만 / 미구현) ─────────────────────────────
// class AriaDnaCalculator implements DnaCalculatorProvider {
//   private apiUrl: string
//   constructor(apiUrl: string) { this.apiUrl = apiUrl }
//   async calculateTraits(params) {
//     // ARIA API 호출 → interactions 행동 데이터 반영
//     // const res = await fetch(this.apiUrl, { ... })
//     return {}
//   }
// }

// ─── Factory ────────────────────────────────────────────────────

let _instance: DnaCalculatorProvider | null = null

export function createDnaCalculator(): DnaCalculatorProvider {
  if (_instance) return _instance

  // Phase B 활성화 조건
  // const ariaUrl = process.env.NEXT_PUBLIC_ARIA_API_URL
  // if (ariaUrl) {
  //   _instance = new AriaDnaCalculator(ariaUrl)
  //   return _instance
  // }

  _instance = new RuleBasedDnaCalculator()
  return _instance
}

// ─── DNA Category Definitions ───────────────────────────────────

export const DNA_CATEGORIES = [
  { id: 'love',          labelEn: 'Love & Romance',          labelKo: '연애',       emoji: '💕' },
  { id: 'work',          labelEn: 'Career & Work',           labelKo: '직장',       emoji: '💼' },
  { id: 'social',        labelEn: 'Social & Relationships',  labelKo: '사회성',     emoji: '🤝' },
  { id: 'money',         labelEn: 'Money & Lifestyle',       labelKo: '소비',       emoji: '💰' },
  { id: 'communication', labelEn: 'Communication',           labelKo: '소통',       emoji: '💬' },
  { id: 'stress',        labelEn: 'Stress Management',       labelKo: '스트레스',   emoji: '🧘' },
  { id: 'creativity',    labelEn: 'Creativity',              labelKo: '창의성',     emoji: '🎨' },
] as const

export type DnaCategoryId = typeof DNA_CATEGORIES[number]['id']

// ─── Trait Keys per Category ────────────────────────────────────

export const CATEGORY_TRAITS: Record<string, string[]> = {
  love:          ['directness', 'patience', 'emotional_openness', 'strategic_thinking'],
  work:          ['leadership', 'adaptability', 'ambition', 'collaboration'],
  social:        ['assertiveness', 'empathy', 'composure', 'diplomacy'],
  money:         ['discipline', 'risk_tolerance', 'generosity', 'planning'],
  communication: ['responsiveness', 'clarity', 'emotional_awareness', 'humor'],
  stress:        [],  // 향후 추가
  creativity:    [],  // 향후 추가
}
