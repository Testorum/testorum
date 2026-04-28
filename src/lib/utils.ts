import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildShareUrl(slug: string, resultId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testorum.app'
  return `${base}/tests/${slug}/result?r=${resultId}`
}

export function buildOgImageUrl(slug: string, resultId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://testorum.app'
  return `${base}/api/og?slug=${slug}&result=${resultId}`
}

export function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
  return n.toLocaleString()
}
