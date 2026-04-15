// ─── 테스트 관련 타입 ───────────────────────────────────────────
export interface TestQuestion {
  id: number
  text: string
  options: TestOption[]
}

export interface TestOption {
  text: string
  scores: Record<string, number>
}

export interface TestResult {
  id: string
  title: string
  description: string
  emoji: string
  tags: string[]
  coupangKeyword?: string
  coupangUrl?: string
}

export interface TestMeta {
  slug: string
  title: string
  subtitle: string
  description: string
  emoji: string
  category: string
  estimatedMinutes: number
  shareText: string
  ogColor: string
}

export interface TestData {
  meta: TestMeta
  questions: TestQuestion[]
  scoring: ScoringConfig
  results: TestResult[]
}

// ─── 스코어링 타입 ──────────────────────────────────────────────
export type ScoringType = 'accumulate' | 'max' | 'rpg'

export interface ScoringConfig {
  type: ScoringType
  dimensions?: string[]
}

// ─── 피드백 / 댓글 타입 ─────────────────────────────────────────
export type FeedbackEmoji = 'shocked' | 'lol' | 'think'

export interface FeedbackCount {
  shocked: number
  lol: number
  think: number
}

export interface Comment {
  id: string
  test_slug: string
  result_id: string
  content: string
  created_at: string
}

// ─── GA4 이벤트 타입 ────────────────────────────────────────────
export type GA4EventName =
  | 'test_start'
  | 'question_answer'
  | 'question_drop'
  | 'test_complete'
  | 'result_feedback'
  | 'share_click'
  | 'coupang_click'
  | 'comment_submit'

export interface GA4EventParams {
  test_slug?: string
  question_index?: number
  result_id?: string
  feedback_type?: FeedbackEmoji
  share_platform?: string
  [key: string]: string | number | undefined
}
