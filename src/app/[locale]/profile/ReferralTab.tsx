// ============================================================
// src/app/[locale]/profile/ReferralTab.tsx
// 레퍼럴 탭 업그레이드 — 통계 + 마일스톤 + 친구 목록 + 보상 가이드
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReferral } from '@/hooks/useReferral';
import type { ReferralStatus } from '@/types';

interface ReferralTabProps {
  referralCode: string;
  locale: string;
}

const STATUS_EMOJI: Record<ReferralStatus, string> = {
  pending: '🟡',
  activated: '🟢',
  converted: '💎',
  expired: '⚫',
};

const STATUS_LABEL: Record<ReferralStatus, { en: string; ko: string }> = {
  pending: { en: 'Pending', ko: '대기중' },
  activated: { en: 'Active', ko: '활성' },
  converted: { en: 'Premium', ko: '유료전환' },
  expired: { en: 'Expired', ko: '만료' },
};

export function ReferralTab({ referralCode, locale }: ReferralTabProps) {
  const t = useTranslations('Referral');
  const lang = locale === 'ko' ? 'ko' : 'en';
  const { stats, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://testorum.app'}?ref=${referralCode}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'ko' ? 'Testorum 같이 하자!' : 'Try Testorum with me!',
          text: lang === 'ko'
            ? '심리테스트 하고 크레딧도 받자 🎁'
            : 'Take personality tests and get bonus credits 🎁',
          url: shareUrl,
        });
      } catch {
        // 유저 취소
      }
    } else {
      handleCopy();
    }
  }, [shareUrl, lang, handleCopy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 레퍼럴 코드 + 공유 */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {t('yourCode')}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 font-mono text-lg font-bold tracking-widest text-center">
            {referralCode}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {copied ? '✓' : t('copy')}
          </button>
        </div>
        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold
                     hover:bg-primary/20 transition-colors"
        >
          {t('shareLink')} 📤
        </button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('invited'), value: stats.total, emoji: '📨' },
            { label: t('active'), value: stats.activated + stats.converted, emoji: '🟢' },
            { label: t('premium'), value: stats.converted, emoji: '💎' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-card border border-border p-3 text-center"
            >
              <div className="text-lg mb-1">{item.emoji}</div>
              <div className="text-xl font-black">{item.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 마일스톤 프로그레스 */}
      {stats?.nextMilestone && (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {t('nextMilestone')}
            </p>
            <span className="text-xs font-bold text-primary">
              {stats.nextMilestone.current}/{stats.nextMilestone.target}
            </span>
          </div>

          {/* 프로그레스 바 */}
          <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (stats.nextMilestone.current / stats.nextMilestone.target) * 100)}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>

          <p className="text-sm font-medium text-center">
            🎁 {stats.nextMilestone.reward}
          </p>
        </div>
      )}

      {/* 최근 친구 목록 */}
      {stats && stats.recentReferrals.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {t('recentFriends')}
          </p>
          <div className="space-y-2">
            {stats.recentReferrals.map((friend) => (
              <div
                key={friend.index}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30"
              >
                <span className="text-sm">
                  {STATUS_EMOJI[friend.status]}{' '}
                  {lang === 'ko' ? `친구 #${friend.index}` : `Friend #${friend.index}`}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {STATUS_LABEL[friend.status][lang]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 보상 요약 (항상 노출) — #8 */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 px-4 py-3 text-center">
        <p className="text-sm font-bold" style={{ color: '#FF4F4F' }}>
          🎁 {lang === 'ko' ? '5명 초대하면 Pro 1개월 무료!' : 'Invite 5 friends → 1 month Pro free!'}
        </p>
      </div>

      {/* 보상 가이드 (접기/펼치기) */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium"
        >
          <span>{t('rewardGuide')}</span>
          <motion.span
            animate={{ rotate: showGuide ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 space-y-2"
            >
              {[
                { icon: '📨', label: t('signupReward'), credits: '+5 / +10 cr' },
                { icon: '🟢', label: t('activationReward'), credits: '+15 cr' },
                { icon: '💎', label: t('conversionReward'), credits: '+30 cr' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span>
                    {item.icon} {item.label}
                  </span>
                  <span className="font-bold text-primary">{item.credits}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 총 획득 크레딧 */}
      {stats && stats.totalCreditsEarned > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {t('totalEarned')}: <span className="font-bold text-primary">{stats.totalCreditsEarned} cr</span>
        </p>
      )}
    </div>
  );
}
