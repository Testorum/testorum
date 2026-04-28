// app/[locale]/test/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';
export const alt = 'Test result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const t = await getTranslations({ locale, namespace: 'Meta' });

    // 테스트 데이터 fetch + locale content 추출
    // const testData = await getTestBySlug(slug);
    // const content = getLocalizedTestContent(testData, locale);

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 60, fontWeight: 700 }}>
                    {/* content.title */}
                    Testorum
                </div>
                <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9 }}>
                    {t('homeDescription')}
                </div>
            </div>
        ),
        { ...size }
    );
}
