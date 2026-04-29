'use client';

import { useCreditHistory } from '@/hooks/useBilling';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  spend: { label: 'Used', color: 'text-red-500' },
  refill: { label: 'Monthly refill', color: 'text-green-500' },
  purchase: { label: 'Purchased', color: 'text-blue-500' },
  reward: { label: 'Reward', color: 'text-amber-500' },
  referral: { label: 'Referral bonus', color: 'text-purple-500' },
};

export default function TransactionHistory() {
  const { data, loading, error, fetchPage } = useCreditHistory(20);

  if (loading && !data) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">{error}</p>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No transactions yet
      </p>
    );
  }

  const { transactions, pagination } = data;
  const hasMore = pagination.offset + pagination.limit < pagination.total;
  const hasPrev = pagination.offset > 0;

  return (
    <div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {transactions.map((tx) => {
          const info = TYPE_LABELS[tx.type] ?? { label: tx.type, color: 'text-gray-500' };
          const isPositive = tx.amount > 0;

          return (
            <li key={tx.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tx.reason ?? info.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{tx.amount}
                </p>
                <p className="text-xs text-gray-400">
                  bal: {tx.balance_after}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      {(hasPrev || hasMore) && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => fetchPage(Math.max(0, pagination.offset - pagination.limit))}
            disabled={!hasPrev || loading}
            className="rounded px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:invisible dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <button
            onClick={() => fetchPage(pagination.offset + pagination.limit)}
            disabled={!hasMore || loading}
            className="rounded px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:invisible dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
