// ============================================================
// src/hooks/useReferral.ts
// 레퍼럴 통계 훅 — 프로필 ReferralTab용
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReferralStats } from '@/types';
import { trackEvent } from '@/lib/ga4';

interface UseReferralReturn {
  stats: ReferralStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_STATS: ReferralStats = {
  total: 0,
  pending: 0,
  activated: 0,
  converted: 0,
  expired: 0,
  totalCreditsEarned: 0,
  recentReferrals: [],
  nextMilestone: null,
};

export function useReferral(): UseReferralReturn {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/referral/stats', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          setStats(DEFAULT_STATS);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data: ReferralStats = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// ============================================================
// 가입 직후 레퍼럴 클레임 훅
// ============================================================

interface UseReferralClaimReturn {
  claim: () => Promise<{ claimed: boolean; credits?: number }>;
  isClaiming: boolean;
}

export function useReferralClaim(): UseReferralClaimReturn {
  const [isClaiming, setIsClaiming] = useState(false);

  const claim = useCallback(async () => {
    setIsClaiming(true);
    try {
      const res = await fetch('/api/referral/claim', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        return { claimed: false };
      }

      const data = await res.json();
      if (data.claimed) {
        trackEvent('referral_claimed', { feature: 'referral' });
      }
      return {
        claimed: data.claimed ?? false,
        credits: data.credits_received,
      };
    } catch {
      return { claimed: false };
    } finally {
      setIsClaiming(false);
    }
  }, []);

  return { claim, isClaiming };
}
