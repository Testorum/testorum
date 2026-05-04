// ============================================================
// src/components/auth/AuthButton.tsx
// 헤더 로그인 상태 표시 — 아바타/로그인 버튼
// ============================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { FEATURES } from '@/lib/feature-flags';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.href = `/${locale}`;
  };

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-[#1A1A1A]/5 animate-pulse" />
    );
  }

  // Not logged in → login button
  if (!user) {
    const currentUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    return (
      <a
        href={`/${locale}/login?redirect=${encodeURIComponent(currentUrl)}`}
        className="flex items-center gap-1.5 rounded-full bg-[#FF4F4F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform active:scale-95 hover:brightness-110"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        {locale === 'ko' ? '로그인' : 'Sign in'}
      </a>
    );
  }

  // Logged in → avatar with dropdown
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '?';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-full border border-[#1A1A1A]/10 bg-white px-2 py-1 shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4F4F] text-[11px] font-bold text-white">
            {initials}
          </div>
        )}
        <span className="hidden sm:block max-w-[100px] truncate text-xs font-medium text-[#1A1A1A]">
          {displayName}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-[#1A1A1A]/40 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-lg overflow-hidden z-[60]"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-[#1A1A1A]/5">
              <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#1A1A1A]/40 truncate">
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <a
                href={`/${locale}/profile`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {locale === 'ko' ? '프로필' : 'Profile'}
              </a>
              {FEATURES.PAYMENT_ENABLED && (
              <a
                href={`/${locale}/billing`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                {locale === 'ko' ? '결제 관리' : 'Billing'}
              </a>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-[#1A1A1A]/5 py-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {locale === 'ko' ? '로그아웃' : 'Sign out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
