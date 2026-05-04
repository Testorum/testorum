'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { trackEvent } from '@/lib/ga4'

interface Props {
  locale: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error'

export function CreatorWaitlist({ locale }: Props) {
  const t = useTranslations('Waitlist')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setState('submitting')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, feature: 'creator' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setState('error')
        return
      }

      if (data.duplicate) {
        setState('duplicate')
      } else {
        setState('success')
        trackEvent('waitlist_signup', { feature: 'creator' })
      }

      setEmail('')
    } catch {
      setState('error')
    }
  }

  const isDone = state === 'success' || state === 'duplicate'

  return (
    <motion.section
      className="w-full rounded-[20px] px-6 py-8 md:py-10 text-center"
      style={{
        background: 'linear-gradient(135deg, #FF4F4F08 0%, #FF4F4F15 100%)',
        border: '1px solid #FF4F4F15',
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Coming Soon badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
        style={{ backgroundColor: '#FF4F4F15', color: '#FF4F4F' }}
      >
        <span className="text-sm">✨</span>
        Coming Soon
      </div>

      <h3
        className="text-xl md:text-2xl font-extrabold mb-2"
        style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}
      >
        {t('title')}
      </h3>

      <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#6B6B6B' }}>
        {t('description')}
      </p>

      {isDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
          style={{ backgroundColor: '#10B98115', color: '#10B981' }}
        >
          <span>✓</span>
          {state === 'duplicate' ? t('duplicate') : t('success')}
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
        >
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState('idle') }}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-3 rounded-full text-sm bg-white border border-gray-200 outline-none focus:border-[#FF4F4F] focus:ring-2 focus:ring-[#FF4F4F]/10 transition-all"
            style={{ color: '#1A1A1A' }}
            disabled={state === 'submitting'}
          />
          <button
            type="submit"
            disabled={state === 'submitting' || !email.trim()}
            className="px-6 py-3 rounded-full text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ backgroundColor: '#FF4F4F' }}
          >
            {state === 'submitting'
              ? (locale === 'ko' ? '등록 중...' : 'Submitting...')
              : t('submit')
            }
          </button>
        </form>
      )}

      {state === 'error' && (
        <p className="text-xs text-red-500 mt-2">
          {locale === 'ko' ? '오류가 발생했어 다시 시도해줘!' : 'Something went wrong — try again!'}
        </p>
      )}
    </motion.section>
  )
}
