// ============================================================
// src/app/[locale]/tests/[slug]/compare/CompareClient.tsx
// 궁합 결과 클라이언트 — 비교 UI + PaywallGate
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ToriMessage } from '@/components/tori/ToriMessage';
import { PaywallGate } from '@/components/paywall/PaywallGate';
import { ShareButtons } from '@/components/share/ShareButtons';
import type { CompatibilityGrade } from '@/types';

interface CompareClientProps {
  locale: string;
  slug: string;
  sessionId: string | null;
  fromSessionId: string | null; // 파트너가 진입한 경우
  testTitle: string;
}

interface CompareData {
  session: { id: string; test_slug: string; completed_at: string };
  initiator: {
    resultId: string;
    typeName: string;
    emojiCombo: string;
    description: string;
  };
  partner: {
    resultId: string;
    typeName: string;
    emojiCombo: string;
    description: string;
  };
  compatibility: {
    score: number;
    grade: CompatibilityGrade;
    gradeLabel: string;
    highlights: string[];
  };
}

// 등급별 색상
const GRADE_COLORS: Record<CompatibilityGrade, string> = {
  '🔥': '#EF4444', // red
  '💛': '#EAB308', // yellow
  '🤔': '#6B7280', // gray
  '💀': '#8B5CF6', // purple
};

const GRADE_BG: Record<CompatibilityGrade, string> = {
  '🔥': 'from-red-500/20 to-orange-500/20',
  '💛': 'from-yellow-500/20 to-amber-500/20',
  '🤔': 'from-gray-500/20 to-slate-500/20',
  '💀': 'from-purple-500/20 to-violet-500/20',
};

export default function CompareClient({
  locale,
  slug,
  sessionId,
  fromSessionId,
  testTitle,
}: CompareClientProps) {
  const t = useTranslations('Compare');
  const router = useRouter();
  const [data, setData] = useState<CompareData | null>(null);
  const [status, setStatus] = useState<'loading' | 'waiting' | 'ready' | 'error'>('loading');
  const [showScore, setShowScore] = useState(false);

  const effectiveSessionId = sessionId ?? fromSessionId;

  useEffect(() => {
    if (!effectiveSessionId) {
      setStatus('error');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/compare/${effectiveSessionId}?locale=${locale}`
        );

        if (!res.ok) {
          setStatus('error');
          return;
        }

        const json = await res.json();

        if (json.status === 'waiting') {
          setStatus('waiting');
          return;
        }

        setData(json as CompareData);
        setStatus('ready');

        // 점수 애니메이션 지연
        setTimeout(() => setShowScore(true), 800);
      } catch {
        setStatus('error');
      }
    };

    fetchData();
  }, [effectiveSessionId, locale]);

  // --- Loading ---
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-t-transparent rounded-full"
          style={{ borderColor: 'var(--color-primary)' }}
        />
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  // --- Waiting: Friend arrived via shared link → show "Take the Test" ---
  if (status === 'waiting' && fromSessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <h2 className="text-xl font-bold text-center">{t('friendInviteTitle')}</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {t('friendInviteDesc')}
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() =>
            router.push(`/${locale}/tests/${slug}?from=${fromSessionId}`)
          }
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-base shadow-md"
        >
          {t('friendTakeTest')} 🚀
        </motion.button>
      </div>
    );
  }

  // --- Waiting: Initiator waiting for partner ---
  if (status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
        <h2 className="text-xl font-bold text-center">{t('waitingTitle')}</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {t('waitingDescription')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          {t('refresh')}
        </button>
      </div>
    );
  }

  // --- Error ---
  if (status === 'error' || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="text-5xl">😥</div>
        <h2 className="text-lg font-bold">{t('errorTitle')}</h2>
        <p className="text-sm text-muted-foreground text-center">
          {t('errorDescription')}
        </p>
        <button
          onClick={() => router.push(`/${locale}/tests/${slug}`)}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          {t('tryTest')}
        </button>
      </div>
    );
  }

  // --- Result ---
  const { initiator, partner, compatibility } = data;
  const gradeColor = GRADE_COLORS[compatibility.grade];
  const gradeBg = GRADE_BG[compatibility.grade];

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 py-8 space-y-6">
      {/* Tori 인트로 */}
      <ToriMessage
        mood="curious"
        locale={locale}
        message={
          locale === 'ko'
            ? '이 조합 흥미로운데... 😏'
            : 'This combo is interesting... 😏'
        }
      />

      {/* VS 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-stretch gap-3"
      >
        {/* Initiator 카드 */}
        <div className="flex-1 rounded-2xl bg-card border border-border p-4 text-center">
          <div className="text-3xl mb-2">{initiator.emojiCombo}</div>
          <p className="text-sm font-bold leading-tight">{initiator.typeName}</p>
        </div>

        {/* VS */}
        <div className="flex items-center">
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-2xl font-black text-muted-foreground"
          >
            VS
          </motion.span>
        </div>

        {/* Partner 카드 */}
        <div className="flex-1 rounded-2xl bg-card border border-border p-4 text-center">
          <div className="text-3xl mb-2">{partner.emojiCombo}</div>
          <p className="text-sm font-bold leading-tight">{partner.typeName}</p>
        </div>
      </motion.div>

      {/* 궁합 점수 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className={`rounded-3xl bg-gradient-to-br ${gradeBg} p-8 text-center`}
      >
        {/* 원형 점수 표시 */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* 배경 원 */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* 진행 원 */}
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={gradeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{
                strokeDashoffset: showScore
                  ? 2 * Math.PI * 52 * (1 - compatibility.score / 100)
                  : 2 * Math.PI * 52,
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence>
              {showScore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <span className="text-3xl font-black" style={{ color: gradeColor }}>
                    {compatibility.score}%
                  </span>
                  <div className="text-lg">{compatibility.grade}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 등급 라벨 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showScore ? 1 : 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-bold"
          style={{ color: gradeColor }}
        >
          {compatibility.gradeLabel}
        </motion.p>
      </motion.div>

      {/* 상세 분석 (유료) */}
      <PaywallGate
        requiredCredits={3}
        featureName={t('premiumFeature')}
        locale={locale}
        toriMessage={
          locale === 'ko'
            ? '진짜 궁합 분석은 여기부터야... 👀'
            : 'The real analysis starts here... 👀'
        }
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {t('detailedAnalysis')}
          </h3>
          {compatibility.highlights.map((highlight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <span className="text-lg mt-0.5">
                {idx === 0 ? '✨' : idx === 1 ? '💡' : '🎯'}
              </span>
              <p className="text-sm leading-relaxed">{highlight}</p>
            </motion.div>
          ))}
        </motion.div>
      </PaywallGate>

      {/* 공유 */}
      <div className="space-y-3">
        <ShareButtons
          slug={slug}
          resultId={data.session.id}
          shareText={`${initiator.typeName} ${compatibility.grade} ${partner.typeName} — ${compatibility.score}%`}
          locale={locale}
        />
      </div>

      {/* "나도 해보기!" CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push(`/${locale}/tests/${slug}`)}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-center"
      >
        {t('tryTest')} 🎯
      </motion.button>
    </div>
  );
}
