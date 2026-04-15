import type { GA4EventName, GA4EventParams } from '@/types'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

export function trackEvent(name: GA4EventName, params?: GA4EventParams) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}
