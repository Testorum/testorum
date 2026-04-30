import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { logger } from '@/lib/logger'
import type { PersonalityDnaEntry, DnaProfileByCategory } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entries, error } = await supabase
      .from('personality_dna')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })

    if (error) {
      logger.error('dna/profile', error, { user_id: user.id })
      return NextResponse.json({ error: 'Failed to fetch DNA profile' }, { status: 500 })
    }

    // Group by category + compute average traits per category
    const typedEntries: PersonalityDnaEntry[] = (entries ?? []).map((e) => ({
      ...e,
      trait_scores: (e.trait_scores ?? {}) as Record<string, number>,
    }))

    const categoryMap = new Map<string, PersonalityDnaEntry[]>()
    for (const entry of typedEntries) {
      const existing = categoryMap.get(entry.category) ?? []
      existing.push(entry)
      categoryMap.set(entry.category, existing)
    }

    const profile: DnaProfileByCategory[] = []
    for (const [category, catEntries] of categoryMap) {
      // Average trait scores across all tests in this category
      const traitSums: Record<string, number> = {}
      const traitCounts: Record<string, number> = {}

      for (const entry of catEntries) {
        const scores = entry.trait_scores as Record<string, number>
        for (const [trait, value] of Object.entries(scores)) {
          if (typeof value === 'number') {
            traitSums[trait] = (traitSums[trait] ?? 0) + value
            traitCounts[trait] = (traitCounts[trait] ?? 0) + 1
          }
        }
      }

      const averageTraits: Record<string, number> = {}
      for (const trait of Object.keys(traitSums)) {
        averageTraits[trait] = Math.round((traitSums[trait] / traitCounts[trait]) * 100) / 100
      }

      profile.push({
        category,
        entries: catEntries,
        averageTraits,
      })
    }

    return NextResponse.json({
      entries: typedEntries,
      profile,
    })
  } catch (error) {
    logger.error('dna/profile', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
