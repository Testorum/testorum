import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-400 hover:underline mb-6 inline-block">
        ← 홈으로
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Sora, Pretendard, sans-serif' }}>
        About Testorum
      </h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        Testorum은 연애/성격/심리 등 다양한 주제의 재미있는 심리테스트를 제공하는 플랫폼이에요
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        모든 테스트는 오락 목적으로 제작되었으며 과학적 심리 진단 도구가 아닙니다
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">Contact</h2>
      <p className="text-gray-600">contact@testorum.app</p>
    </div>
  )
}
