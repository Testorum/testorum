import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createDnaCalculator } from '@/lib/dna-calculator'
import { getTestDataRaw } from '@/lib/tests'
import { logger } from '@/lib/logger'
import { validateSlug, validateResultId } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const { test_slug, result_type_id } = body as Record<string, unknown>

    // Validate inputs
    const slugValidation = validateSlug(test_slug)
    if (!slugValidation.success) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 })
    }

    const resultValidation = validateResultId(result_type_id)
    if (!resultValidation.success) {
      return NextResponse.json({ error: resultValidation.error }, { status: 400 })
    }

    const slug = slugValidation.data!
    const resultId = resultValidation.data!

    // Fetch raw test data for dna_mapping
    const testData = await getTestDataRaw(slug)
    if (!testData) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    if (!testData.dna_mapping) {
      // 이 테스트에 DNA 매핑 없음 → graceful skip
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'No DNA mapping for this test',
      })
    }

    // Calculate traits
    const calculator = createDnaCalculator()
    const traitScores = await calculator.calculateTraits({
      testSlug: slug,
      resultTypeId: resultId,
      dnaMapping: testData.dna_mapping,
    })

    if (Object.keys(traitScores).length === 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'No trait mapping found for this result type',
      })
    }

    // Find result labels
    const resultRaw = testData.results.find((r) => r.id === resultId)
    const labelEn = resultRaw?.locale_data?.en?.title ?? null
    const labelKo = resultRaw?.locale_data?.ko?.title ?? null

    // Upsert personality_dna
    const { error: upsertError } = await supabase
      .from('personality_dna')
      .upsert(
        {
          user_id: user.id,
          category: testData.dna_mapping.category,
          test_slug: slug,
          result_type_id: resultId,
          result_label_en: labelEn,
          result_label_ko: labelKo,
          trait_scores: traitScores,
          taken_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,test_slug' }
      )

    if (upsertError) {
      logger.error('dna/update', upsertError, { user_id: user.id, slug })
      return NextResponse.json({ error: 'Failed to update DNA profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: testData.dna_mapping.category,
      traits: traitScores,
    })
  } catch (error) {
    logger.error('dna/update', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
