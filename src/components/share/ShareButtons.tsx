'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/lib/ga4'
import type { TestTheme } from '@/types'

interface Props {
  slug: string
  resultId: string
  shareText: string
  theme?: TestTheme
  locale?: string
}

interface KakaoSDK {
  isInitialized: () => boolean
  init: (key: string) => void
  Share: {
    sendDefault: (options: Record<string, unknown>) => void
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testorum.app'

export function ShareButtons({ slug, resultId, shareText, theme, locale = 'en' }: Props) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const isKo = locale === 'ko'

  const url = `${SITE_URL}/${locale}/tests/${slug}/result?r=${resultId}`
  const ogImage = `${SITE_URL}/api/og?slug=${slug}&result=${resultId}`
  const encodedText = encodeURIComponent(`${shareText}\n${url}`)
  const primaryColor = theme?.primary || '#FF4F4F'

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
        description: isKo ? '나도 해보기 → Testorum' : 'Try it yourself → Testorum',
        imageUrl: ogImage,
        imageWidth: 1200,
        imageHeight: 630,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: isKo ? '나도 해보기' : 'Take the test', link: { mobileWebUrl: url, webUrl: url } },
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
      alert(isKo
        ? '링크 복사됨! 인스타 스토리에 붙여넣기 해봐 📸'
        : 'Link copied! Paste it in your Instagram Story 📸')
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
      <p className="text-sm text-center font-medium" style={{ color: primaryColor }}>
        {isKo ? '친구는 어떤 유형일까? 👀' : 'What type are your friends? 👀'}
      </p>

      {/* Kakao (show prominently for ko) */}
      {isKo && (
        <button
          onClick={shareKakao}
          className="w-full py-3.5 rounded-[14px] bg-[#FEE500] text-[#3A1D1D] font-bold text-base active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">💬</span>
          카카오톡 공유
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={shareX}
          className="flex-1 py-3 rounded-[14px] bg-[#0F1419] text-white font-semibold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-1"
        >
          𝕏 {isKo ? '공유' : 'Share'}
        </button>
        <button
          onClick={shareInstagram}
          className="flex-1 py-3 rounded-[14px] font-semibold text-sm text-white active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)' }}
        >
          📸 {isKo ? '인스타' : 'Insta'}
        </button>
        <button
          onClick={copyLink}
          className={`flex-1 py-3 rounded-[14px] font-semibold text-sm active:scale-[0.97] transition-all ${
            copied
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {copied ? (isKo ? '✓ 복사됨' : '✓ Copied') : (isKo ? '🔗 링크' : '🔗 Link')}
        </button>
      </div>

      {/* Kakao for non-ko (smaller) */}
      {!isKo && (
        <button
          onClick={shareKakao}
          className="w-full py-3 rounded-[14px] bg-[#FEE500] text-[#3A1D1D] font-semibold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          <span>💬</span> KakaoTalk
        </button>
      )}

      {canNativeShare && (
        <button
          onClick={shareNative}
          className="w-full py-3 rounded-[14px] border border-gray-200 text-gray-500 font-semibold text-sm active:scale-[0.97] transition-all"
        >
          {isKo ? '다른 앱으로 공유하기' : 'Share via other apps'}
        </button>
      )}
    </div>
  )
}
