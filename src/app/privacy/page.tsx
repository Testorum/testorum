import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-gray-400 hover:underline mb-6 inline-block">
        ← 홈으로
      </Link>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Sora, Pretendard, sans-serif' }}>
        개인정보처리방침
      </h1>
      <p className="text-gray-500 text-sm mb-8">최종 수정일: 2026년 4월 28일</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">1 수집하는 정보</h2>
        <p className="text-gray-600 leading-relaxed">
          Testorum은 서비스 이용 과정에서 다음 정보를 수집할 수 있습니다:
          테스트 참여 기록/익명 피드백(이모지 반응)/자발적으로 입력한 한줄 소감
          회원가입 없이 이용 가능하며 이름이나 연락처 등 개인 식별 정보는 수집하지 않습니다
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">2 쿠키 및 분석 도구</h2>
        <p className="text-gray-600 leading-relaxed">
          Google Analytics 4를 통해 익명화된 방문 통계를 수집합니다
          Google AdSense를 통해 맞춤형 광고가 표시될 수 있으며 이 과정에서 Google의 쿠키가 사용됩니다
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">3 문의</h2>
        <p className="text-gray-600">contact@testorum.app</p>
      </section>
    </div>
  )
}
