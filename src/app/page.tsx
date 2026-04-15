import Link from 'next/link'
import { getAllTestSlugs, getTestData } from '@/lib/tests'

export default async function HomePage() {
  const slugs = getAllTestSlugs()
  const tests = await Promise.all(slugs.map(getTestData))
  const validTests = tests.filter(Boolean)

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          테스트팩토리 🧪
        </h1>
        <p className="text-gray-500 text-sm">재미있는 심리테스트 모음</p>
      </div>

      <div className="flex flex-col gap-3">
        {validTests.map((data) => (
          <Link
            key={data!.meta.slug}
            href={`/tests/${data!.meta.slug}`}
            className="block px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{data!.meta.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{data!.meta.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  약 {data!.meta.estimatedMinutes}분 · {data!.meta.category}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-12 text-center text-xs text-gray-300 flex gap-4 justify-center">
        <Link href="/about">소개</Link>
        <Link href="/privacy">개인정보처리방침</Link>
      </footer>
    </div>
  )
}
