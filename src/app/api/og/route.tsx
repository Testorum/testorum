import { ImageResponse } from 'next/og'
import { getTestData } from '@/lib/tests'

export const runtime = 'edge'

// SVG를 base64 data URL로 변환해서 <img>로 렌더링
function svgToDataUrl(svgContent: string): string {
  const encoded = btoa(unescape(encodeURIComponent(svgContent)))
  return `data:image/svg+xml;base64,${encoded}`
}

const ICON_SVGS: Record<string, string> = {
  t01: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="COLOR" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>`,
  t02: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="COLOR" d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"/></svg>`,
  t03: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="COLOR" d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l.3-.3c.3-.3.7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/></svg>`,
  t04: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="COLOR" d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"/></svg>`,
  t05: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="COLOR" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>`,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? 't01'
  const resultId = searchParams.get('result') ?? ''

  const data = await getTestData(slug)
  const result = data?.results.find((r) => r.id === resultId)
  const bgColor = data?.meta.ogColor ?? '#ff6b9d'

  // 아이콘 색상 치환 후 base64 변환
  const rawSvg = (ICON_SVGS[slug] ?? ICON_SVGS.t01).replace(/COLOR/g, bgColor)
  const iconSrc = svgToDataUrl(rawSvg)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 장식 원 */}
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

        {/* 메인 카드 */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: '36px',
          padding: '52px 72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '880px',
        }}>
          {/* 브랜드 */}
          <div style={{
            fontSize: '15px', fontWeight: 700, letterSpacing: '4px',
            color: bgColor, marginBottom: '28px',
          }}>
            TESTFACTORY
          </div>

          {/* 아이콘 박스 */}
          <div style={{
            width: '96px', height: '96px',
            background: bgColor + '18',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} width={52} height={52} alt="" />
          </div>

          {/* 테스트명 */}
          <div style={{
            fontSize: '22px', color: '#9ca3af',
            fontWeight: 500, marginBottom: '12px',
          }}>
            {data?.meta.title}
          </div>

          {/* 결과 제목 */}
          <div style={{
            fontSize: '54px', fontWeight: 800,
            color: '#111827', textAlign: 'center',
            lineHeight: 1.15, marginBottom: '28px',
          }}>
            {result?.title ?? data?.meta.subtitle}
          </div>

          {/* 태그 */}
          {result?.tags && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {result.tags.slice(0, 3).map((tag: string) => (
                <div key={tag} style={{
                  padding: '10px 24px', borderRadius: '40px',
                  background: bgColor + '18',
                  color: bgColor, fontSize: '18px', fontWeight: 700,
                }}>
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 CTA */}
        <div style={{
          position: 'absolute', bottom: '28px',
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '40px', padding: '12px 32px',
          display: 'flex',
        }}>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
            나도 테스트하러 가기 →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
