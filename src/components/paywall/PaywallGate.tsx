'use client'

import { useState, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useBilling, useDeductCredits, useCheckout } from '@/hooks/useBilling'
import { ToriMessage } from '@/components/tori/ToriMessage'
import { trackEvent } from '@/lib/ga4'
import { CREDIT_COSTS } from '@/types/billing'
import { FEATURES } from '@/lib/feature-flags'
import type { TestTheme } from '@/types'

interface PaywallGateProps {
  requiredCredits: number
  featureName: string          // 'deep_analysis' | 'compatibility_comparison' | etc
  theme?: TestTheme
  locale: string
  children: ReactNode
  toriMessage?: string         // Optional Tori upsell message
}

type GateState = 'locked' | 'unlocking' | 'unlocked' | 'error'

export function PaywallGate({
  requiredCredits,
  featureName,
  theme,
  locale,
  children,
  toriMessage,
}: PaywallGateProps) {
  // Feature flag: bypass paywall entirely when payment is disabled
  if (!FEATURES.PAYMENT_ENABLED) {
    return <>{children}</>;
  }
  const t = useTranslations('Paywall')
  const { data: billing, loading: billingLoading, refresh } = useBilling()
  const { deduct, loading: deducting } = useDeductCredits()
  const { createCheckout, loading: checkoutLoading } = useCheckout()
  const [gateState, setGateState] = useState<GateState>('locked')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Build redirect URL to return to current page after login
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname

  const primaryColor = theme?.primary || '#FF4F4F'
  const isKo = locale === 'ko'

  // Already unlocked — render children directly
  if (gateState === 'unlocked') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    )
  }

  // Loading billing data
  if (billingLoading) {
    return (
      <div className="relative rounded-[16px] overflow-hidden">
        <div className="blur-[8px] select-none pointer-events-none opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${primaryColor} transparent transparent transparent` }}
          />
        </div>
      </div>
    )
  }

  // Determine user state
  const isLoggedIn = billing !== null
  const credits = billing?.credits
  const isFrozen = credits?.frozen ?? false
  const balance = credits?.balance ?? 0
  const hasEnough = balance >= requiredCredits

  // Track paywall impression
  if (gateState === 'locked') {
    trackEvent('paywall_shown', { feature: featureName })
  }

  async function handleUnlock() {
    if (!isLoggedIn || !hasEnough || isFrozen) return

    setGateState('unlocking')
    setErrorMsg(null)

    trackEvent('paywall_unlock_attempt', {
      feature: featureName,
      test_slug: undefined,
    })

    const result = await deduct(featureName)

    if (result.success) {
      setGateState('unlocked')
      trackEvent('premium_unlock', { feature: featureName })
      refresh()
    } else {
      setGateState('error')
      setErrorMsg(result.error || (isKo ? '오류가 발생했어' : 'Something went wrong'))
    }
  }

  async function handleBuyCredits() {
    const result = await createCheckout({ type: 'credit_pack' })
    if (result.success && result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="relative rounded-[16px] overflow-hidden">
      {/* Blurred content preview */}
      <div className="blur-[8px] select-none pointer-events-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8"
        style={{
          background: `linear-gradient(to bottom, ${primaryColor}08, ${primaryColor}15)`,
        }}
      >
        {/* Tori upsell message */}
        {toriMessage && (
          <div className="mb-4 w-full max-w-[320px]">
            <ToriMessage
              mood="smug"
              message={toriMessage}
              locale={locale}
              theme={theme}
              showTypingIndicator={false}
              delay={0}
            />
          </div>
        )}

        {/* Lock icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <span className="text-2xl select-none">🔒</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Not logged in */}
          {!isLoggedIn && (
            <motion.div
              key="login"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-semibold text-base mb-1" style={{ color: theme?.accent || '#1F2937' }}>
                {t('signUpTitle')}
              </p>
              <p className="text-sm mb-4" style={{ color: (theme?.accent || '#1F2937') + '88' }}>
                {t('signUpDesc')}
              </p>
              <a
                href={`/${locale}/login?redirect=${encodeURIComponent(currentUrl)}`}
                className="inline-block px-6 py-3 rounded-full font-semibold text-sm text-white transition-transform active:scale-[0.97]"
                style={{ backgroundColor: primaryColor }}
              >
                {t('signUpCta')}
              </a>
            </motion.div>
          )}

          {/* Frozen */}
          {isLoggedIn && isFrozen && (
            <motion.div
              key="frozen"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-semibold text-base mb-1" style={{ color: theme?.accent || '#1F2937' }}>
                {t('frozenTitle')}
              </p>
              <p className="text-sm mb-4" style={{ color: (theme?.accent || '#1F2937') + '88' }}>
                {t('frozenDesc')}
              </p>
              <a
                href={`/${locale}/pricing`}
                className="inline-block px-6 py-3 rounded-full font-semibold text-sm text-white transition-transform active:scale-[0.97]"
                style={{ backgroundColor: primaryColor }}
              >
                {t('frozenCta')}
              </a>
            </motion.div>
          )}

          {/* Insufficient credits */}
          {isLoggedIn && !isFrozen && !hasEnough && (
            <motion.div
              key="insufficient"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-semibold text-base mb-1" style={{ color: theme?.accent || '#1F2937' }}>
                {t('insufficientTitle')}
              </p>
              <p className="text-sm mb-4" style={{ color: (theme?.accent || '#1F2937') + '88' }}>
                {isKo
                  ? `${requiredCredits}크레딧 필요 (현재 ${balance})`
                  : `${requiredCredits} credits needed (you have ${balance})`
                }
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <button
                  onClick={handleBuyCredits}
                  disabled={checkoutLoading}
                  className="w-full px-6 py-3 rounded-full font-semibold text-sm text-white transition-transform active:scale-[0.97] disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {checkoutLoading
                    ? (isKo ? '처리 중...' : 'Processing...')
                    : t('buyCreditsCta')
                  }
                </button>
                <a
                  href={`/${locale}/pricing`}
                  className="text-xs text-center font-medium underline"
                  style={{ color: primaryColor }}
                >
                  {t('viewPlans')}
                </a>
              </div>
            </motion.div>
          )}

          {/* Can unlock */}
          {isLoggedIn && !isFrozen && hasEnough && gateState !== 'error' && (
            <motion.div
              key="unlock"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={handleUnlock}
                disabled={deducting}
                className="px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 14px ${primaryColor}44`,
                }}
              >
                {deducting
                  ? (isKo ? '열고 있어...' : 'Unlocking...')
                  : (isKo
                    ? `${requiredCredits}크레딧으로 열기 ✨`
                    : `Unlock for ${requiredCredits} credits ✨`
                  )
                }
              </button>
              <p className="text-xs mt-2" style={{ color: (theme?.accent || '#1F2937') + '66' }}>
                {isKo
                  ? `잔여 ${balance}크레딧`
                  : `${balance} credits remaining`
                }
              </p>
            </motion.div>
          )}

          {/* Error state */}
          {gateState === 'error' && (
            <motion.div
              key="error"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-red-500 mb-3">{errorMsg}</p>
              <button
                onClick={() => { setGateState('locked'); setErrorMsg(null) }}
                className="px-6 py-2.5 rounded-full font-semibold text-sm border transition-transform active:scale-[0.97]"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {isKo ? '다시 시도' : 'Try Again'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
