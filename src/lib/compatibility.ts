// ============================================================
// src/lib/compatibility.ts
// 궁합 계산 로직 — Testorum Step4-D
// ============================================================

import type { CompatibilityResult, CompatibilityGrade } from '@/types';

// --- 타입 정의 (테스트 JSON 구조 참조) ---

// Using any for flexible result type matching
// Using any for flexible result type matching
interface TestResultData {
  id: string
  locale_data: Record<string, Record<string, unknown>>
  dna_mapping?: {
    category: string
    traits: Record<string, number>
  }
  emojiCombo?: string
}

// --- 등급 라벨 ---

const GRADE_LABELS: Record<CompatibilityGrade, { en: string; ko: string }> = {
  '🔥': { en: 'Perfect Match!', ko: '찰떡궁합!' },
  '💛': { en: 'Great Chemistry!', ko: '좋은 케미!' },
  '🤔': { en: 'Interesting Combo...', ko: '묘한 조합...' },
  '💀': { en: 'Opposites Attract?', ko: '정반대 매력?' },
};

// --- 궁합 하이라이트 생성 ---

const HIGHLIGHTS: Record<
  CompatibilityGrade,
  { en: string[]; ko: string[] }
> = {
  '🔥': {
    en: [
      'You naturally understand each other\'s emotional needs',
      'Your communication styles complement perfectly',
      'Conflict resolution comes easily to both of you',
    ],
    ko: [
      '서로의 감정을 본능적으로 이해하는 사이',
      '대화 스타일이 완벽하게 맞아떨어져',
      '갈등 해결이 자연스러운 최고의 조합',
    ],
  },
  '💛': {
    en: [
      'You share similar values at the core',
      'One\'s strengths cover the other\'s weaknesses',
      'Your energy levels are well-balanced',
    ],
    ko: [
      '핵심 가치관이 비슷한 편이야',
      '한 쪽의 강점이 다른 쪽의 약점을 커버해',
      '에너지 밸런스가 잘 맞는 조합',
    ],
  },
  '🤔': {
    en: [
      'Different perspectives can spark creativity',
      'You might need to work on understanding each other',
      'Patience is key in this combination',
    ],
    ko: [
      '다른 시각이 오히려 창의성을 만들어낼 수 있어',
      '서로를 이해하려는 노력이 필요한 조합',
      '인내심이 이 조합의 핵심 키워드야',
    ],
  },
  '💀': {
    en: [
      'Completely different approaches to life',
      'This combo requires serious effort from both sides',
      'But hey... opposites sometimes create the strongest bonds!',
    ],
    ko: [
      '인생에 대한 접근법이 완전히 달라',
      '양쪽 모두의 진지한 노력이 필요한 조합',
      '근데... 정반대가 가장 강한 유대를 만들기도 해!',
    ],
  },
};

// --- 점수 → 등급 변환 ---

function scoreToGrade(score: number): CompatibilityGrade {
  if (score >= 80) return '🔥';
  if (score >= 60) return '💛';
  if (score >= 40) return '🤔';
  return '💀';
}

// --- 코사인 유사도 계산 ---

function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
): number {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of allKeys) {
    const valA = a[key] ?? 0;
    const valB = b[key] ?? 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

// --- 메인 궁합 계산 ---

export function calculateCompatibility(
  resultA: TestResultData,
  resultB: TestResultData,
  locale: string = 'en'
): CompatibilityResult {
  const lang = locale === 'ko' ? 'ko' : 'en';
  let score = 50; // 기본 점수

  // 1) compatibility 필드 매칭 (JSON에 정의된 궁합 좋은 유형)
  const aCompat = String(resultA.locale_data?.[lang]?.compatibility ?? resultA.locale_data?.en?.compatibility ?? "")
  const bCompat = String(resultB.locale_data?.[lang]?.compatibility ?? resultB.locale_data?.en?.compatibility ?? "")

  const aTitle = String(resultA.locale_data?.[lang]?.title ?? resultA.locale_data?.en?.title ?? "")
  const bTitle = String(resultB.locale_data?.[lang]?.title ?? resultB.locale_data?.en?.title ?? "")

  // A의 compatibility가 B의 유형명과 매칭
  if (aCompat && bTitle && normalizeForMatch(aCompat) === normalizeForMatch(bTitle)) {
    score += 25;
  }
  // B의 compatibility가 A의 유형명과 매칭
  if (bCompat && aTitle && normalizeForMatch(bCompat) === normalizeForMatch(aTitle)) {
    score += 25;
  }
  // 양방향 매칭이면 최고
  // 단방향이면 +25 / 양방향이면 +50

  // 2) DNA traits 유사도 (존재할 경우)
  if (resultA.dna_mapping?.traits && resultB.dna_mapping?.traits) {
    const similarity = cosineSimilarity(
      resultA.dna_mapping.traits,
      resultB.dna_mapping.traits
    );
    // 유사도 0~1 → 보정 점수 -15 ~ +15
    // 0.5 기준: 0.5 미만이면 감점 / 0.5 이상이면 가점
    const traitBonus = Math.round((similarity - 0.5) * 30);
    score += traitBonus;
  }

  // 3) 같은 유형이면 보너스 (자기와 같은 유형)
  if (resultA.id === resultB.id) {
    score += 10;
  }

  // 4) 점수 클램핑 (0~100)
  score = Math.max(0, Math.min(100, score));

  // 5) 등급 결정
  const grade = scoreToGrade(score);

  return {
    score,
    grade,
    gradeLabel: GRADE_LABELS[grade][lang],
    highlights: HIGHLIGHTS[grade][lang],
  };
}

// --- 유틸리티 ---

function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '')
    .trim();
}

// --- 궁합 요약 (OG 카드용 한줄) ---

export function getCompatibilitySummary(
  score: number,
  locale: string = 'en'
): string {
  const grade = scoreToGrade(score);
  const lang = locale === 'ko' ? 'ko' : 'en';
  return GRADE_LABELS[grade][lang];
}

// --- 무료/유료 분리 ---

export function getCompatibilityFree(
  result: CompatibilityResult
): Pick<CompatibilityResult, 'score' | 'grade' | 'gradeLabel'> {
  return {
    score: result.score,
    grade: result.grade,
    gradeLabel: result.gradeLabel,
  };
}

export function getCompatibilityPremium(
  result: CompatibilityResult
): CompatibilityResult {
  return result; // 전체 반환 (highlights 포함)
}
