import { ImageResponse } from 'next/og'
import { getTestData } from '@/lib/tests'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? 't01'
  const resultId = searchParams.get('result') ?? ''

  const data = await getTestData(slug)
  const result = data?.results.find((r) => r.id === resultId)
  const theme = data?.meta.theme ?? { primary: '#FF4F4F', bg: '#FFF5F5', accent: '#1A1A1A' }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: theme.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-140px', right: '-140px',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', display: 'flex',
        }} />

        {/* Main card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '36px',
          padding: '52px 72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '880px',
        }}>
          {/* Brand */}
          <div style={{
            fontSize: '15px', fontWeight: 700, letterSpacing: '4px',
            color: theme.primary, marginBottom: '28px',
          }}>
            TESTORUM
          </div>

          {/* Emoji */}
          <div style={{
            fontSize: '64px', marginBottom: '20px',
          }}>
            {result?.emojiCombo || result?.emoji || data?.meta.emoji || '🔮'}
          </div>

          {/* Test name */}
          <div style={{
            fontSize: '22px', color: '#9ca3af',
            fontWeight: 500, marginBottom: '12px',
          }}>
            {data?.meta.title}
          </div>

          {/* Result title */}
          <div style={{
            fontSize: '54px', fontWeight: 800,
            color: theme.accent, textAlign: 'center',
            lineHeight: 1.15, marginBottom: '28px',
          }}>
            {result?.title ?? data?.meta.subtitle}
          </div>

          {/* Tags */}
          {result?.tags && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {result.tags.slice(0, 3).map((tag: string) => (
                <div key={tag} style={{
                  padding: '10px 24px', borderRadius: '40px',
                  background: theme.primary + '18',
                  color: theme.primary, fontSize: '18px', fontWeight: 700,
                }}>
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{
          position: 'absolute', bottom: '28px',
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '40px', padding: '12px 32px',
          display: 'flex',
        }}>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
            testorum.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
