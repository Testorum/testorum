import { getTestData, getAllTestSlugs } from '@/lib/tests'
import { TestClient } from './TestClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ slug: string, locale: string }>
}

export async function generateStaticParams() {
  return getAllTestSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale);
  const data = await getTestData(slug)
  if (!data) return {}
  return {
    title: `${data.meta.title} | Testorum`,
    description: data.meta.description,
    openGraph: {
      title: data.meta.title,
      description: data.meta.description,
      images: [`/api/og?slug=${slug}`],
    },
  }
}

export default async function TestPage({ params }: Props) {
  const { slug } = await params
  const data = await getTestData(slug)
  if (!data) notFound()
  return <TestClient data={data} />
}
