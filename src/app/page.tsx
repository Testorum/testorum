import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server';
import { getAllTestSlugs, getTestData } from '@/lib/tests'

type Props = {
  params: Promise<{ locale: string }>;
};
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const slugs = getAllTestSlugs()
  const tests = await Promise.all(slugs.map(getTestData))
  const validTests = tests.filter(Boolean)

  return (
    <div className="max-w-[480px] mx-auto px-4 py-8 min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ fontFamily: 'Sora, Pretendard, sans-serif', color: '#1A1A1A' }}
        >
          Testorum
        </h1>
        <p className="text-sm" style={{ color: '#9B9B9B' }}>
          심리테스트 한판 어때?
        </p>
      </div>

      {/* Test Grid */}
      <div className="flex flex-col gap-3">
        {validTests.map((data) => {
          const theme = data!.meta.theme
          return (
            <Link
              key={data!.meta.slug}
              href={`/tests/${data!.meta.slug}`}
              className="block rounded-[16px] bg-white overflow-hidden active:scale-[0.98] transition-all press-effect"
              style={{
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Emoji with theme bg */}
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: theme.primary + '15' }}
                >
                  {data!.meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px]" style={{ color: '#1A1A1A' }}>
                    {data!.meta.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9B9B9B' }}>
                    약 {data!.meta.estimatedMinutes}분 · {data!.meta.category}
                  </p>
                </div>
                {/* Arrow */}
                <span className="text-gray-300 text-lg shrink-0">›</span>
              </div>
              {/* Bottom accent line */}
              <div className="h-[2px]" style={{ backgroundColor: theme.primary + '30' }} />
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs flex gap-4 justify-center" style={{ color: '#C4C4C4' }}>
        <Link href="/about" className="hover:underline">소개</Link>
        <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
      </footer>
    </div>
  )
}
