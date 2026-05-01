// ============================================================
// src/components/test/ConversationalResult.tsx — 수정 부분
// "Compare with a friend!" 버튼 추가
// ============================================================
//
// 대화 완료 후 ShareButtons 근처에 아래 컴포넌트 추가
// 기존 ConversationalResult.tsx 에서 대화 종료 단계 (showShareButtons 등) 이후에 삽입
//

// --- 1) import 추가 ---
// import { CompareButton } from '@/components/test/CompareButton';

// --- 2) ShareButtons 아래에 CompareButton 추가 ---
// <CompareButton
//   testSlug={testSlug}
//   sessionId={sessionId}
//   resultId={resultId}
//   locale={locale}
// />

// ============================================================
// 아래는 CompareButton 독립 컴포넌트
// src/components/test/CompareButton.tsx
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface CompareButtonProps {
  testSlug: string;
  sessionId: string;
  resultId: string;
  locale: string;
}

export function CompareButton({
  testSlug,
  sessionId,
  resultId,
  locale,
}: CompareButtonProps) {
  const t = useTranslations('Compare');
  const [compareUrl, setCompareUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (compareUrl) return; // 이미 생성됨
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/compare/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_slug: testSlug,
          initiator_session_id: sessionId,
          initiator_result_id: resultId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create');
      }

      const data = await res.json();
      const fullUrl = `${window.location.origin}/${locale}${data.compare_url}`;
      setCompareUrl(fullUrl);
    } catch {
      setError(t('createError'));
    } finally {
      setIsCreating(false);
    }
  }, [testSlug, sessionId, resultId, locale, compareUrl, t]);

  const handleCopy = useCallback(async () => {
    if (!compareUrl) return;

    try {
      await navigator.clipboard.writeText(compareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = compareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [compareUrl]);

  const handleShare = useCallback(async () => {
    if (!compareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('shareTitle'),
          text: t('shareText'),
          url: compareUrl,
        });
      } catch {
        // 유저 취소 — 무시
      }
    } else {
      handleCopy();
    }
  }, [compareUrl, t, handleCopy]);

  return (
    <div className="w-full space-y-3">
      <AnimatePresence mode="wait">
        {!compareUrl ? (
          // --- 생성 버튼 ---
          <motion.button
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-primary/40
                       hover:border-primary hover:bg-primary/5
                       transition-all duration-200
                       flex items-center justify-center gap-2
                       text-sm font-bold text-primary
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <span className="animate-pulse">{t('creating')}</span>
            ) : (
              <>
                <span>{t('compareButton')}</span>
                <span>👀</span>
              </>
            )}
          </motion.button>
        ) : (
          // --- 공유 UI ---
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {/* URL 표시 + 복사 */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border">
              <input
                type="text"
                value={compareUrl}
                readOnly
                className="flex-1 text-xs bg-transparent outline-none truncate px-2"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                {copied ? '✓' : t('copy')}
              </button>
            </div>

            {/* 공유 버튼 */}
            <button
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold
                         hover:bg-primary/20 transition-colors"
            >
              {t('shareFriend')} 📤
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
