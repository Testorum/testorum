import { getTestData } from '@/lib/tests'
import { notFound } from 'next/navigation'
import { ResultClient } from './ResultClient'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ slug: string, locale: string }>
  searchParams: Promise<{ r?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale);
  const { r } = await searchParams
  const data = await getTestData(slug)
  if (!data) return {}
  const result = data.results.find((res) => res.id === r)
  const title = result ? `${result.title} | ${data.meta.title}` : data.meta.title
  return {
    title: `${title} | Testorum`,
    description: data.meta.description,
    openGraph: {
      title,
      images: [`/api/og?slug=${slug}&result=${r ?? ''}`],
    },
  }
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { r } = await searchParams
  const data = await getTestData(slug)
  if (!data) notFound()

  const resultId = r ?? ''
  const result = data.results.find((res) => res.id === resultId)
  if (!result) notFound()

  const { data: feedback } = await supabase
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
    <ResultClient
      data={data}
      result={result}
      initialCounts={counts}
    />
  )
}
