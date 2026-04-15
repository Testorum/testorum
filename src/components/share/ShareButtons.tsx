'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/lib/ga4'
import { buildShareUrl } from '@/lib/utils'

interface Props {
  slug: string
  resultId: string
  shareText: string
}

interface KakaoSDK {
  isInitialized: () => boolean
  init: (key: string) => void
  Share: {
    sendDefault: (options: Record<string, unknown>) => void
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testfactory-kmtuxwnip-lordofwins.vercel.app'

export function ShareButtons({ slug, resultId, shareText }: Props) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  const url = `${SITE_URL}/tests/${slug}/result?r=${resultId}`
  const ogImage = `${SITE_URL}/api/og?slug=${slug}&result=${resultId}`
  const encodedText = encodeURIComponent(`${shareText}\n${url}`)

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    )

    function initKakao() {
      const kakao = (window as unknown as { Kakao?: KakaoSDK }).Kakao
      if (!kakao) return
      if (!kakao.isInitialized()) {
        kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!)
      }
    }

    if ((window as unknown as { Kakao?: KakaoSDK }).Kakao) {
      initKakao()
    } else {
      const script = document.querySelector('script[src*="kakao"]')
      script?.addEventListener('load', initKakao)
    }
  }, [])

  function shareKakao() {
    trackEvent('share_click', { share_platform: 'kakao', test_slug: slug })
    const kakao = (window as unknown as { Kakao?: KakaoSDK }).Kakao
    if (!kakao?.isInitialized()) {
      window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`)
      return
    }
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: shareText,
        description: '테스트팩토리에서 나도 해보기 →',
        imageUrl: ogImage,   // 절대경로 보장
        imageWidth: 1200,
        imageHeight: 630,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: '나도 해보기',
          link: { mobileWebUrl: url, webUrl: url },
        },
      ],
    })
  }

  function shareX() {
    trackEvent('share_click', { share_platform: 'twitter', test_slug: slug })
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function shareInstagram() {
    trackEvent('share_click', { share_platform: 'instagram', test_slug: slug })
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 복사됐어요!\n인스타 스토리에 붙여넣기 해보세요 📸')
    })
  }

  async function copyLink() {
    trackEvent('share_click', { share_platform: 'link_copy', test_slug: slug })
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareNative() {
    trackEvent('share_click', { share_platform: 'native', test_slug: slug })
    await navigator.share({ title: shareText, url })
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={shareKakao}
        className="w-full py-3.5 rounded-2xl bg-[#FEE500] text-[#3A1D1D] font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <span className="text-lg">💬</span>
        카카오톡으로 공유하기
      </button>

      <div className="flex gap-2">
        <button
          onClick={shareX}
          className="flex-1 py-3 rounded-2xl bg-black text-white font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-1"
        >
          𝕏 공유
        </button>
        <button
          onClick={shareInstagram}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-sm active:scale-95 transition-all"
        >
          📸 인스타
        </button>
        <button
          onClick={copyLink}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm active:scale-95 transition-all ${
            copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {copied ? '✓ 복사됨' : '🔗 링크'}
        </button>
      </div>

      {canNativeShare && (
        <button
          onClick={shareNative}
          className="w-full py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-semibold text-sm active:scale-95 transition-all"
        >
          더 많은 앱으로 공유하기
        </button>
      )}
    </div>
  )
}
