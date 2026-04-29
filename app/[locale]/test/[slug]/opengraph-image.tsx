// app/[locale]/test/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';
export const alt = 'Test result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SLUG_PATTERN = /^[a-z0-9_-]{1,30}$/;
const VALID_LOCALES = ['en', 'ko'];

/** 브랜드 기본 OG (에러/검증 실패 시 fallback) */
function defaultOgImage() {
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
                    Testorum
                </div>
                <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9 }}>
                    Discover who you really are
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}

export default async function Image({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    try {
        const { locale, slug } = await params;

        // 입력값 검증 — 실패 시 기본 OG (에러 아닌 fallback)
        if (!SLUG_PATTERN.test(slug)) {
            return defaultOgImage();
        }

        const safeLocale = VALID_LOCALES.includes(locale) ? locale : 'en';
        const t = await getTranslations({ locale: safeLocale, namespace: 'Meta' });

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
                        Testorum
                    </div>
                    <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9 }}>
                        {t('homeDescription')}
                    </div>
                </div>
            ),
            { ...size }
        );
    } catch {
        // 어떤 에러든 기본 OG 반환 (SNS 크롤러에게 에러 노출 방지)
        return defaultOgImage();
    }
}
