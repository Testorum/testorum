'use client';

import { useEffect, useState } from 'react';
import { useBilling } from '@/hooks/useBilling';

export default function BillingSuccessPage() {
  const { data, loading, refresh } = useBilling();
  const [retryCount, setRetryCount] = useState(0);

  // Poll for subscription update (webhook may take a few seconds)
  useEffect(() => {
    if (loading || retryCount > 5) return;

    if (!data?.subscription || data.subscription.status !== 'active') {
      const timer = setTimeout(() => {
        setRetryCount((c) => c + 1);
        refresh();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data, loading, retryCount, refresh]);

  const isReady = data?.subscription?.status === 'active';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      {isReady ? (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to {data?.subscription?.plan ? data.subscription.plan.charAt(0).toUpperCase() + data.subscription.plan.slice(1) : 'your plan'}!
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Your subscription is active and {data?.credits.balance ?? 0} credits have been added to your account
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/billing"
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              View Billing
            </a>
            <a
              href="/"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Start Testing
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Setting up your subscription...
          </p>
          {retryCount > 5 && (
            <p className="mt-2 text-xs text-gray-400">
              Taking longer than expected —{' '}
              <a href="/billing" className="text-indigo-500 hover:underline">
                check billing page
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
