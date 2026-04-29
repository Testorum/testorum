'use client';

import { useBilling } from '@/hooks/useBilling';
import { useRouter } from 'next/navigation';

interface CreditBalanceProps {
  compact?: boolean;
}

export default function CreditBalance({ compact = false }: CreditBalanceProps) {
  const { data, loading } = useBilling();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!data) return null;

  const { balance, frozen } = data.credits;
  const plan = data.subscription?.plan ?? 'free';

  if (compact) {
    return (
      <button
        onClick={() => router.push('/billing')}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium transition-colors hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
        title="View billing & credits"
      >
        <svg
          className="h-3.5 w-3.5 text-amber-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
        </svg>
        <span className={frozen ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}>
          {balance}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
        <svg
          className="h-5 w-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
        <p className={`text-lg font-semibold ${frozen ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
          {balance.toLocaleString()}
        </p>
      </div>
      {frozen && (
        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
          Frozen
        </span>
      )}
      {plan !== 'free' && (
        <span className="ml-auto rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-medium uppercase text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {plan}
        </span>
      )}
    </div>
  );
}
