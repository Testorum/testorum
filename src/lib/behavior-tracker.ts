// ═══════════════════════════════════════════════════════════════
// Behavior Tracker — Collects test interaction data
// Logged-in users: saved to Supabase test_interactions table
// Anonymous: kept in-memory only (for potential Phase B ARIA use)
// ═══════════════════════════════════════════════════════════════

import type { TestInteraction, QuestionType } from '@/types'
import { createClient } from '@/lib/supabase'

const MAX_INTERACTIONS = 100 // Safety cap per test session
const MAX_TIME_MS = 300_000 // 5 min cap per question (prevent stale tabs)

export class BehaviorTracker {
  private interactions: TestInteraction[] = []
  private questionStartTime = 0
  private testSlug: string

  constructor(testSlug: string) {
    this.testSlug = testSlug
  }

  startQuestion(): void {
    this.questionStartTime = Date.now()
  }

  recordAnswer(params: {
    question_index: number
    choice_made: string
    choice_changed: boolean
    question_type: QuestionType
  }): TestInteraction | null {
    if (this.interactions.length >= MAX_INTERACTIONS) return null

    const rawTime = this.questionStartTime > 0
      ? Date.now() - this.questionStartTime
      : 0

    const time_spent_ms = Math.min(rawTime, MAX_TIME_MS)

    // Sanitize choice_made — strip to first 500 chars
    const sanitizedChoice = params.choice_made.slice(0, 500)

    const interaction: TestInteraction = {
      test_slug: this.testSlug,
      question_index: params.question_index,
      choice_made: sanitizedChoice,
      time_spent_ms,
      choice_changed: params.choice_changed,
      question_type: params.question_type,
    }

    this.interactions.push(interaction)
    this.questionStartTime = 0
    return interaction
  }

  getInteractions(): TestInteraction[] {
    return [...this.interactions]
  }

  async saveToSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
    if (this.interactions.length === 0) {
      return { success: true }
    }

    // Validate userId format (UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return { success: false, error: 'Invalid user ID format' }
    }

    try {
      const supabase = createClient()

      const rows = this.interactions.map((i) => ({
        user_id: userId,
        test_slug: i.test_slug,
        question_index: i.question_index,
        choice_made: i.choice_made,
        time_spent_ms: i.time_spent_ms,
        choice_changed: i.choice_changed,
        question_type: i.question_type,
      }))

      const { error } = await supabase
        .from('test_interactions')
        .insert(rows)

      if (error) {
        console.error('[BehaviorTracker] Save failed:', error.message)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[BehaviorTracker] Save exception:', message)
      return { success: false, error: message }
    }
  }

  reset(): void {
    this.interactions = []
    this.questionStartTime = 0
  }

  get interactionCount(): number {
    return this.interactions.length
  }
}
