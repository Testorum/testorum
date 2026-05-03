'use client'

import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface Props {
  testTitle: string
  slug: string
  locale: string
  accentColor: string
}

export function ResultFallback({ testTitle, slug, locale, accentColor }: Props) {
  const isKo = locale === 'ko'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <Image
          src="/tori/curious.png"
          alt="Tori curious"
          width={120}
          height={120}
          className="mx-auto"
        />
        <h1 className="text-xl font-extrabold text-gray-800">
          {isKo ? '아직 결과가 없어!' : 'No result yet!'}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          {isKo
            ? `"${testTitle}" 테스트를 먼저 완료해야 결과를 볼 수 있어`
            : `Complete "${testTitle}" first to see your result`}
        </p>
        <Link
          href={`/tests/${slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white active:scale-95 transition-all"
          style={{ backgroundColor: accentColor }}
        >
          {isKo ? '테스트 시작하기' : 'Start Test'}
        </Link>
        <Link
          href="/tests"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isKo ? '다른 테스트 둘러보기' : 'Browse other tests'}
        </Link>
      </div>
    </div>
  )
}
