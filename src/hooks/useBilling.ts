import { useState, useEffect, useCallback } from 'react';
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  BillingInterval,
  CreditTransaction,
} from '@/types/billing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BillingState {
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billing_interval: BillingInterval | null;
    current_period_end: string | null;
    created_at: string;
  } | null;
  plan_details: {
    name: string;
    price_monthly: number;
    price_yearly: number | null;
    credits_monthly: number;
    features: string[];
  };
  credits: {
    balance: number;
    cap: number;
    frozen: boolean;
  };
  credit_costs: Record<string, number>;
}

export interface CreditHistoryState {
  transactions: CreditTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ---------------------------------------------------------------------------
// useBilling — subscription + credits summary
// ---------------------------------------------------------------------------

export function useBilling() {
  const [data, setData] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/billing/subscription');
      if (!res.ok) throw new Error('Failed to fetch billing data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// ---------------------------------------------------------------------------
// useCreditHistory — paginated transaction list
// ---------------------------------------------------------------------------

export function useCreditHistory(limit = 20) {
  const [data, setData] = useState<CreditHistoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/billing/credits?limit=${limit}&offset=${offset}`
      );
      if (!res.ok) throw new Error('Failed to fetch credit history');
      const json = await res.json();
      setData({
        transactions: json.transactions,
        pagination: json.pagination,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  return { data, loading, error, fetchPage };
}

// ---------------------------------------------------------------------------
// useDeductCredits — credit deduction action
// ---------------------------------------------------------------------------

export function useDeductCredits() {
  const [loading, setLoading] = useState(false);

  const deduct = useCallback(async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error, code: json.code };
      }
      return { success: true, ...json };
    } catch {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { deduct, loading };
}

// ---------------------------------------------------------------------------
// useCheckout — create checkout URL
// ---------------------------------------------------------------------------

export function useCheckout() {
  const [loading, setLoading] = useState(false);

  const createCheckout = useCallback(async (
    params: { plan: string; interval: string } | { type: 'credit_pack' }
  ) => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error };
      }
      return { success: true, url: json.url };
    } catch {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCheckout, loading };
}

// ---------------------------------------------------------------------------
// usePortalUrl — get customer portal URL
// ---------------------------------------------------------------------------

export function usePortalUrl() {
  const [loading, setLoading] = useState(false);

  const getPortalUrl = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/portal');
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.error };
      return { success: true, ...json };
    } catch {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getPortalUrl, loading };
}
