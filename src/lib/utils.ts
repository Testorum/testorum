import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildShareUrl(slug: string, resultId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testfactory.kr'
  return `${base}/tests/${slug}/result?r=${resultId}`
}

export function buildOgImageUrl(slug: string, resultId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testfactory.kr'
  return `${base}/api/og?slug=${slug}&result=${resultId}`
}

// 쿠팡 파트너스 링크 미설정 시 검색 fallback
export function buildCoupangSearchUrl(keyword: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}&channel=share`
}
