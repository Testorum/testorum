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

// ─── 프리미엄 결과 (flat / locale 적용 후) ──────────────────────
export interface PremiumResult {
  deepAnalysis: string
  strengths: string[]
  weaknesses: string[]
  advice: string
}

// ─── TestData 확장 (premiumResults 선택적) ─────────────────────
export interface TestDataWithPremium extends TestData {
  premiumResults?: Record<string, PremiumResult>
}

// ─── DNA Mapping ──────────────────────────────────────────────
export interface DnaMapping {
  category: string
  traits: Record<string, Record<string, number>>
}

// ─── Raw JSON 타입 (locale_data 구조 / 파일에서 읽은 그대로) ────

export interface LocaleData<T> {
  en: T
  ko: T
  [locale: string]: T
}

export interface TestMetaLocale {
  title: string
  subtitle: string
  description: string
  shareText: string
}

export interface TestQuestionLocale {
  text: string
}

export interface TestOptionLocale {
  text: string
}

export interface TestResultLocale {
  title: string
  description: string
  tags: string[]
  compatibility: string
}

export interface PremiumResultLocale {
  deepAnalysis: string
  strengths: string[]
  weaknesses: string[]
  advice: string
}

export interface TestOptionRaw {
  locale_data: LocaleData<TestOptionLocale>
  image?: string
  emoji?: string
  scores: Record<string, number>
}

export interface TestQuestionRaw {
  id: number
  type: QuestionType
  locale_data: LocaleData<TestQuestionLocale>
  options: TestOptionRaw[]
}

export interface TestResultRaw {
  id: string
  locale_data: LocaleData<TestResultLocale>
  emoji: string
  emojiCombo?: string
}

export interface TestMetaRaw {
  slug: string
  locale_data: LocaleData<TestMetaLocale>
  emoji: string
  category: string
  estimatedMinutes: number
  theme: TestTheme
}

export interface TestDataRaw {
  meta: TestMetaRaw
  scoring: ScoringConfig
  questions: TestQuestionRaw[]
  results: TestResultRaw[]
  premiumResults?: Record<string, { locale_data: LocaleData<PremiumResultLocale> }>
  dna_mapping?: DnaMapping
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

// ─── 게이미피케이션 ────────────────────────────────────────────
export interface UserProgress {
  id: string
  user_id: string
  level: number
  xp: number
  total_tests_taken: number
  current_streak: number
  longest_streak: number
  last_test_date: string | null
  created_at: string
  updated_at: string
}

export interface Badge {
  id: string
  slug: string
  name_en: string
  name_ko: string
  description_en: string | null
  description_ko: string | null
  icon_emoji: string
  category: string
  xp_reward: number
  credit_reward: number
  condition_type: string
  condition_value: number
  sort_order: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export type GamificationActionType = 'test_complete' | 'premium_unlock' | 'share' | 'referral'

export interface GamificationUpdateResult {
  xp: number
  level: number
  old_level: number
  level_up: boolean
  streak: number
  new_badges: Array<{
    slug: string
    emoji: string
    name_en: string
    name_ko: string
    xp_reward: number
    credit_reward: number
  }>
  level_rewards: Array<{
    level: number
    credits: number
  }>
}

export interface GamificationState {
  progress: UserProgress | null
  badges: UserBadge[]
  allBadges: Badge[]
}

// ─── 성격 DNA 프로필 ──────────────────────────────────────────
export interface PersonalityDnaEntry {
  id: string
  user_id: string
  category: string
  test_slug: string
  result_type_id: string
  result_label_en: string | null
  result_label_ko: string | null
  trait_scores: Record<string, number>
  taken_at: string
}

export interface DnaProfileByCategory {
  category: string
  entries: PersonalityDnaEntry[]
  averageTraits: Record<string, number>
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
  | 'xp_gained'
  | 'level_up'
  | 'badge_earned'
  | 'dna_updated'
  | 'streak_milestone'

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
