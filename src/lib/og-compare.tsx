import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { getTestDataRaw } from '@/lib/tests'
import { calculateCompatibility } from '@/lib/compatibility'

const GRADE_COLORS: Record<string, string> = {
  '🔥': '#EF4444',
  '💛': '#EAB308',
  '🤔': '#6B7280',
  '💀': '#8B5CF6',
}

export async function generateCompareOG(
  searchParams: URLSearchParams
): Promise<ImageResponse | Response> {
  const sessionId = searchParams.get('session')
  if (!sessionId) return new Response('Missing session', { status: 400 })

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(sessionId)) return new Response('Invalid session', { status: 400 })

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) return new Response('Config error', { status: 500 })

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: session } = await supabase
      .from('compare_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session || !session.partner_result_id) return new Response('Not found', { status: 404 })

    const testDataRaw = await getTestDataRaw(session.test_slug)
    if (!testDataRaw) return new Response('Test not found', { status: 404 })

    const initiatorResult = testDataRaw.results.find((r: any) => r.id === session.initiator_result_id)
    const partnerResult = testDataRaw.results.find((r: any) => r.id === session.partner_result_id)
    if (!initiatorResult || !partnerResult) return new Response('Results not found', { status: 404 })

    const compatibility = calculateCompatibility(initiatorResult as any, partnerResult as any, 'en')
    const gradeColor = GRADE_COLORS[compatibility.grade] ?? '#6B7280'
    const iTitle = initiatorResult.locale_data?.en?.title ?? 'Type A'
    const pTitle = partnerResult.locale_data?.en?.title ?? 'Type B'
    const iEmoji = initiatorResult.emojiCombo ?? '🎭'
    const pEmoji = partnerResult.emojiCombo ?? '🎭'

    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0F0F', color: '#FAFAFA', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 30% 50%, ${gradeColor}22, transparent 50%), radial-gradient(circle at 70% 50%, ${gradeColor}22, transparent 50%)` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '64px' }}>{iEmoji}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, maxWidth: '200px', textAlign: 'center' }}>{iTitle}</span>
            </div>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#666' }}>VS</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '64px' }}>{pEmoji}</span>
              <span style={{ fontSize: '20px', fontWeight: 700, maxWidth: '200px', textAlign: 'center' }}>{pTitle}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '80px', fontWeight: 900, color: gradeColor }}>{compatibility.score}%</span>
            <span style={{ fontSize: '48px' }}>{compatibility.grade}</span>
          </div>
          <span style={{ fontSize: '24px', color: gradeColor, fontWeight: 600, marginTop: '8px' }}>{compatibility.gradeLabel}</span>
          <div style={{ position: 'absolute', bottom: '20px', right: '30px', fontSize: '16px', color: '#444', fontWeight: 700 }}>testorum.app</div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch {
    return new Response('Internal error', { status: 500 })
  }
}
