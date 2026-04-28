import { getTestData, getAllTestSlugs } from '@/lib/tests'
import { TestClient } from './TestClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
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
  const data = await getTestData(slug)
  if (!data) return {}

  const t = await getTranslations({ locale, namespace: 'Meta' })

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
      images: [`/api/og?slug=${slug}`],
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
  }
}

export default async function TestPage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const data = await getTestData(slug)
  if (!data) notFound()
  return <TestClient data={data} locale={locale} />
}
