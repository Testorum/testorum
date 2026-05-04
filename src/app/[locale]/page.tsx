import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllTestSlugs, getTestData } from '@/lib/tests'
import { LandingClient } from './LandingClient'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const slugs = getAllTestSlugs()
  const tests = await Promise.all(slugs.map((slug) => getTestData(slug, locale)))
  const validTests = tests.filter(Boolean)

  // Serialize for client component (include subtitle)
  const testItems = validTests.map((data) => ({
    slug: data!.meta.slug,
    title: data!.meta.title,
    subtitle: data!.meta.subtitle,
    emoji: data!.meta.emoji,
    category: data!.meta.category,
    estimatedMinutes: data!.meta.estimatedMinutes,
    themePrimary: data!.meta.theme.primary,
  }))

  return (
    <>
      {/* Schema.org WebApplication */}
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
      <LandingClient tests={testItems} locale={locale} />
    </>
  )
}
