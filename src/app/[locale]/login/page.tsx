// ============================================================
// src/app/[locale]/login/page.tsx
// Google OAuth 로그인 페이지 — Tori 캐릭터 + i18n
// ============================================================

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const t = useTranslations('Login');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || `/${locale}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const siteUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://testorum.app';

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent(redirect)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
      // If successful, the browser will redirect — no need to setLoading(false)
    } catch {
      setError(t('genericError'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FAFAF8] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[380px] rounded-3xl bg-white p-8 shadow-lg"
      >
        {/* Tori character */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <Image
            src="/tori/happy.png"
            alt="Tori"
            width={120}
            height={120}
            className="drop-shadow-md"
            priority
          />
        </motion.div>

        {/* Heading */}
        <h1 className="text-center text-xl font-bold text-[#1A1A1A] mb-2">
          {t('title')}
        </h1>
        <p className="text-center text-sm text-[#1A1A1A]/60 mb-8">
          {t('subtitle')}
        </p>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Google Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#dadce0] bg-white px-6 py-3.5 text-sm font-medium text-[#3c4043] shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-[#FF4F4F]" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>{loading ? t('signingIn') : t('googleButton')}</span>
        </motion.button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1A1A1A]/10" />
          <span className="text-xs text-[#1A1A1A]/40">{t('or')}</span>
          <div className="h-px flex-1 bg-[#1A1A1A]/10" />
        </div>

        {/* Continue without login */}
        <button
          onClick={() => {
            window.location.href = redirect.startsWith('/') ? redirect : `/${locale}`;
          }}
          className="w-full rounded-2xl bg-[#FAFAF8] px-6 py-3 text-sm font-medium text-[#1A1A1A]/60 transition-colors hover:bg-[#f0f0ee] text-center"
        >
          {t('continueWithout')}
        </button>

        {/* Privacy note */}
        <p className="mt-6 text-center text-[10px] text-[#1A1A1A]/30 leading-relaxed">
          {t('privacyNote')}
        </p>
      </motion.div>
    </div>
  );
}
