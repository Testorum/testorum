import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllTestSlugs, getTestData } from '@/lib/tests'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Home')
  const tNav = await getTranslations('Nav')
  const tFooter = await getTranslations('Footer')
  const tCat = await getTranslations('Categories')

  const slugs = getAllTestSlugs()
  const tests = await Promise.all(slugs.map((slug) => getTestData(slug, locale)))
  const validTests = tests.filter(Boolean)

  // C-3: category 매핑 헬퍼 (동적 키 → next-intl 타입 호환)
  const getCategoryLabel = (key: string) => {
    try { return tCat(key as 'love') } catch { return key }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      {/* D-3: Schema.org WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Testorum',
            url: 'https://testorum.app',
            applicationCategory: 'EntertainmentApplication',
            operatingSystem: 'Web',
            description: locale === 'ko'
              ? '재미있는 심리 테스트로 진짜 나를 발견하세요'
              : 'Discover who you really are with fun psychology tests',
            inLanguage: [locale],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image
              src="/tori/happy.png"
              alt="Tori"
              width={80}
              height={80}
              className="drop-shadow-md"
              priority
              unoptimized
            />
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-1"
            style={{ fontFamily: 'Sora, Pretendard, sans-serif', color: '#1A1A1A' }}
          >
            Testorum
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#9B9B9B' }}>
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Test Grid — 1col mobile → 2col md → 3col lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {validTests.map((data) => {
            const theme = data!.meta.theme
            return (
              <Link
                key={data!.meta.slug}
                href={`/tests/${data!.meta.slug}`}
                className="block rounded-[16px] bg-white overflow-hidden active:scale-[0.98] transition-all press-effect hover:shadow-lg"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
                }}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Emoji with theme bg */}
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    {data!.meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px]" style={{ color: '#1A1A1A' }}>
                      {data!.meta.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>
                      {locale === 'ko' ? '약' : '~'} {data!.meta.estimatedMinutes}{locale === 'ko' ? '분' : ' min'} · {getCategoryLabel(data!.meta.category)}
                    </p>
                  </div>
                  {/* Arrow */}
                  <span className="text-gray-300 text-lg shrink-0">›</span>
                </div>
                {/* Bottom accent line */}
                <div className="h-[2px]" style={{ backgroundColor: theme.primary + '30' }} />
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs flex gap-4 justify-center" style={{ color: '#C4C4C4' }}>
          <Link href="/about" className="hover:underline">{tNav('about')}</Link>
          <Link href="/privacy" className="hover:underline">{tFooter('privacy')}</Link>
        </footer>
      </div>
    </div>
  )
}
