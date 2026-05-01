// ============================================================
// src/app/[locale]/tests/[slug]/compare/page.tsx
// 궁합 결과 페이지 — 서버 컴포넌트
// ============================================================

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTestData } from '@/lib/tests';
import CompareClient from './CompareClient';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ session?: string; from?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const { session } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'Compare' });
  const testData = await getTestData(slug, locale);

  const title = testData
    ? `${t('ogTitle')} — ${testData.meta.title}`
    : t('ogTitle');

  return {
    title,
    description: t('ogDescription'),
    openGraph: {
      title,
      description: t('ogDescription'),
      images: session
        ? [`/api/og?type=compare&session=${session}`]
        : undefined,
    },
  };
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { session: sessionId, from } = await searchParams;

  const testData = await getTestData(slug, locale);
  if (!testData) {
    notFound();
  }

  return (
    <CompareClient
      locale={locale}
      slug={slug}
      sessionId={sessionId ?? null}
      fromSessionId={from ?? null}
      testTitle={testData.meta.title}
    />
  );
}
