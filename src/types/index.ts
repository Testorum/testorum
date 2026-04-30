// ─── 테스트 메타 ─────────────────────────────────────────────
export interface TestTheme {
  primary: string
  bg: string
  accent: string
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
  theme: TestTheme
}

// ─── 질문 타입 (3종) ─────────────────────────────────────────
export type QuestionType = 'text_choice' | 'image_grid' | 'binary'

export interface TestOption {
  text: string
  image?: string       // image_grid 전용
  emoji?: string       // text_choice/binary 보조
  scores: Record<string, number>
}

export interface TestQuestion {
  id: number
  type: QuestionType
  text: string
  options: TestOption[]
}

// ─── 결과 ────────────────────────────────────────────────────
export interface TestResult {
  id: string
  title: string
  description: string
  emoji: string         // 단일 이모지 (레거시)
  emojiCombo?: string   // 이모지 콤보 (🌙💌🥀)
  tags: string[]
  compatibility?: string // 궁합 유형 ID
}

// ─── 스코어링 ────────────────────────────────────────────────
export type ScoringType = 'accumulate' | 'max' | 'rpg'

export interface ScoringConfig {
  type: ScoringType
  dimensions?: string[]
}

// ─── 테스트 데이터 (JSON) ────────────────────────────────────
export interface TestData {
  meta: TestMeta
  questions: TestQuestion[]
  scoring: ScoringConfig
  results: TestResult[]
}

// ─── 피드백 / 댓글 ──────────────────────────────────────────
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

// ─── Tori 마스코트 ────────────────────────────────────────────
export type ToriMood =
  | 'happy'
  | 'curious'
  | 'excited'
  | 'smug'
  | 'surprised'
  | 'celebrating'
  | 'sad'
  | 'thinking'

export interface ToriResponse {
  message: string
  mood: ToriMood
  data_driven: boolean // Phase A: always false / Phase B: true
}

// ─── 프리미엄 결과 ────────────────────────────────────────────
export interface PremiumResult {
  deepAnalysis: { en: string; ko: string }
  strengths: { en: string[]; ko: string[] }
  weaknesses: { en: string[]; ko: string[] }
  advice: { en: string; ko: string }
}

// ─── TestData 확장 (premiumResults 선택적) ─────────────────────
// TestData에 premiumResults 추가용 인터페이스
export interface TestDataWithPremium extends TestData {
  premiumResults?: Record<string, PremiumResult>
}

// ─── 행동 추적 ────────────────────────────────────────────────
export interface TestInteraction {
  test_slug: string
  question_index: number
  choice_made: string
  time_spent_ms: number
  choice_changed: boolean
  question_type: QuestionType
}

// ─── GA4 이벤트 ──────────────────────────────────────────────
export type GA4EventName =
  | 'test_start'
  | 'question_answer'
  | 'question_drop'
  | 'test_complete'
  | 'result_feedback'
  | 'share_click'
  | 'comment_submit'
  | 'premium_unlock'
  | 'tori_message_shown'
  | 'paywall_shown'
  | 'paywall_unlock_attempt'

export interface GA4EventParams {
  test_slug?: string
  question_index?: number
  result_id?: string
  feedback_type?: FeedbackEmoji
  share_platform?: string
  feature?: string
  tori_mood?: string
  [key: string]: string | number | undefined
}
