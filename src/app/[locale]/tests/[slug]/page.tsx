import { getTestData, getAllTestSlugs } from '@/lib/tests'
import { TestClient } from './TestClient'
import { FocusModeWrapper } from '@/components/layout/FocusModeWrapper'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  const slugs = getAllTestSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const data = await getTestData(slug, locale)
  if (!data) return {}

  return {
    title: `${data.meta.title} | Testorum`,
    description: data.meta.description,
    alternates: {
      canonical: `https://testorum.app/${locale}/tests/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://testorum.app/${l}/tests/${slug}`])
      ),
    },
    openGraph: {
      title: data.meta.title,
      description: data.meta.description,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      images: [{ url: `/api/og?slug=${slug}&locale=${locale}`, width: 1200, height: 630 }],
    },
  }
}

export default async function TestPage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const data = await getTestData(slug, locale)
  if (!data) notFound()
  return (
    <FocusModeWrapper accentColor={data.meta.theme.primary}>
      {/* D-3: Schema.org Quiz */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Quiz',
            name: data.meta.title,
            description: data.meta.description,
            url: `https://testorum.app/${locale}/tests/${slug}`,
            inLanguage: locale,
            educationalAlignment: {
              '@type': 'AlignmentObject',
              alignmentType: 'personality',
              targetName: data.meta.category,
            },
            provider: {
              '@type': 'Organization',
              name: 'Testorum',
              url: 'https://testorum.app',
            },
          }),
        }}
      />
      <TestClient data={data} locale={locale} />
    </FocusModeWrapper>
  )
}
