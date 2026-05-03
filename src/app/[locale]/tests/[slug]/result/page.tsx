import { getTestData } from '@/lib/tests'
import { notFound, redirect } from 'next/navigation'
import { ResultClient } from './ResultClient'
import { ResultFallback } from './ResultFallback'
import { FocusModeWrapper } from '@/components/layout/FocusModeWrapper'
import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ slug: string; locale: string }>
  searchParams: Promise<{ r?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const { r } = await searchParams
  const data = await getTestData(slug, locale)
  if (!data) return {}

  const result = data.results.find((res) => res.id === r)
  const title = result ? `${result.title} | ${data.meta.title}` : data.meta.title

  return {
    title: `${title} | Testorum`,
    description: data.meta.description,
    alternates: {
      canonical: `https://testorum.app/${locale}/tests/${slug}/result${r ? `?r=${r}` : ''}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          `https://testorum.app/${l}/tests/${slug}/result${r ? `?r=${r}` : ''}`,
        ])
      ),
    },
    openGraph: {
      title,
      images: [`/api/og?slug=${slug}&result=${r ?? ''}&locale=${locale}`],
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
  }
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const { r } = await searchParams
  const data = await getTestData(slug, locale)
  if (!data) notFound()

  const resultId = r ?? ''
  const result = data.results.find((res) => res.id === resultId)

  // #1 Fix: r 파라미터 없거나 유효하지 않으면 fallback UI 표시
  if (!result) {
    return (
      <ResultFallback
        testTitle={data.meta.title}
        slug={slug}
        locale={locale}
        accentColor={data.meta.theme.primary}
      />
    )
  }

  const supabase = await createSupabaseServer()
  // feedback_counts is a view/table not reflected in generated Database types
  const { data: feedback } = await (supabase as any)
    .from('feedback_counts')
    .select('*')
    .eq('test_slug', slug)
    .eq('result_id', resultId)
    .single()

  const counts = {
    shocked: feedback?.shocked ?? 0,
    lol: feedback?.lol ?? 0,
    think: feedback?.think ?? 0,
  }

  return (
    <FocusModeWrapper accentColor={data.meta.theme.primary}>
      <ResultClient
        data={data}
        result={result}
        initialCounts={counts}
        locale={locale}
      />
    </FocusModeWrapper>
  )
}
