'use client'

import { trackEvent } from '@/lib/ga4'
import { buildCoupangSearchUrl } from '@/lib/utils'

interface Props {
  keyword: string
  url?: string
  testSlug: string
}

export function CoupangBanner({ keyword, url, testSlug }: Props) {
  const finalUrl = url && url !== 'https://link.coupang.com/a/example'
    ? url
    : buildCoupangSearchUrl(keyword)

  function handleClick() {
    trackEvent('coupang_click', { test_slug: testSlug })
    window.open(finalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full mt-4 px-5 py-4 rounded-2xl bg-[#FEEB00] border border-yellow-300 text-left active:scale-95 transition-all"
    >
      <p className="text-xs text-gray-500 mb-0.5">쿠팡 추천</p>
      <p className="text-sm font-bold text-gray-800">
        {keyword} 관련 상품 보기 →
      </p>
      <p className="text-[10px] text-gray-400 mt-1">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받습니다
      </p>
    </button>
  )
}
