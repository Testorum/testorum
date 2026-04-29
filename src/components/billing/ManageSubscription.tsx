'use client';

import { useState } from 'react';
import { usePortalUrl } from '@/hooks/useBilling';

interface ManageSubscriptionProps {
  plan: string;
  status: string;
  billingInterval: string | null;
  periodEnd: string | null;
}

export default function ManageSubscription({
  plan,
  status,
  billingInterval,
  periodEnd,
}: ManageSubscriptionProps) {
  const { getPortalUrl, loading } = usePortalUrl();
  const [error, setError] = useState<string | null>(null);

  const handleManage = async () => {
    setError(null);
    const result = await getPortalUrl();
    if (result.success && result.portal_url) {
      window.open(result.portal_url, '_blank');
    } else {
      setError(result.error ?? 'Failed to get portal URL');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    past_due: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    expired: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Current Plan
          </h3>
          <p className="mt-1 text-2xl font-bold capitalize text-gray-900 dark:text-white">
            {plan}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? statusColors.active}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
        {billingInterval && (
          <p>Billed {billingInterval}</p>
        )}
        {periodEnd && (
          <p>
            {status === 'cancelled' ? 'Access until' : 'Renews'}{' '}
            {new Date(periodEnd).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleManage}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </button>
        <a
          href="/pricing"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          View Plans
        </a>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
