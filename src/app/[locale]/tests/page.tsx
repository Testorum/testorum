import { getAllTestSlugs, getTestData } from '@/lib/tests'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import type { Metadata } from 'next'
import { TestListClient } from './TestListClient'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isKo = locale === 'ko'

  return {
    title: isKo ? '전체 테스트 | 테스토럼' : 'All Tests | Testorum',
    description: isKo
      ? '심리 테스트 전체 목록 — 연애, 소통, 직장, 사회, 금전 카테고리별 탐색'
      : 'Browse all personality tests — filter by love, communication, work, social, and money',
    alternates: {
      canonical: `https://testorum.app/${locale}/tests`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://testorum.app/${l}/tests`])
      ),
    },
    openGraph: {
      title: isKo ? '전체 테스트 | 테스토럼' : 'All Tests | Testorum',
      description: isKo
        ? '심리 테스트 전체 목록'
        : 'Browse all personality tests',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
  }
}

export default async function TestListPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const slugs = getAllTestSlugs()
  const tests = await Promise.all(slugs.map((slug) => getTestData(slug, locale)))
  const validTests = tests.filter(Boolean)

  // Serialize for client component
  const testItems = validTests.map((data) => ({
    slug: data!.meta.slug,
    title: data!.meta.title,
    emoji: data!.meta.emoji,
    category: data!.meta.category,
    estimatedMinutes: data!.meta.estimatedMinutes,
    themePrimary: data!.meta.theme.primary,
    questionCount: data!.questions.length,
  }))

  return <TestListClient tests={testItems} locale={locale} />
}
