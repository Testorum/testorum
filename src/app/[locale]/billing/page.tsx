'use client';

import { useBilling } from '@/hooks/useBilling';
import CreditBalance from '@/components/billing/CreditBalance';
import ManageSubscription from '@/components/billing/ManageSubscription';
import TransactionHistory from '@/components/billing/TransactionHistory';
import BuyCreditPack from '@/components/billing/BuyCreditPack';

export default function BillingPage() {
  const { data, loading, error } = useBilling();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-red-500">{error ?? 'Failed to load billing data'}</p>
        <a
          href="/login?redirect=/billing"
          className="mt-4 inline-block text-sm text-indigo-500 hover:underline"
        >
          Sign in to view billing
        </a>
      </div>
    );
  }

  const hasSub = data.subscription !== null;
  const plan = data.subscription?.plan ?? 'free';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Billing
      </h1>

      <div className="mt-8 space-y-6">
        {/* Subscription card */}
        {hasSub ? (
          <ManageSubscription
            plan={data.subscription!.plan}
            status={data.subscription!.status}
            billingInterval={data.subscription!.billing_interval}
            periodEnd={data.subscription!.current_period_end}
          />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Plan
            </h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Free
            </p>
            <a
              href="/pricing"
              className="mt-4 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
            >
              Upgrade
            </a>
          </div>
        )}

        {/* Credits */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Credits
              </h3>
              <CreditBalance />
            </div>
            <BuyCreditPack />
          </div>

          {/* Credit costs reference */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {Object.entries(data.credit_costs)
              .filter(([key]) => !key.startsWith('credit_pack') && !key.startsWith('test_') && !key.startsWith('archive'))
              .map(([key, cost]) => (
                <div
                  key={key}
                  className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {cost} cr
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Transaction History
          </h3>
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
