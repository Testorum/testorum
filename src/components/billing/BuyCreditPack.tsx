'use client';

import { useState } from 'react';
import { useCheckout } from '@/hooks/useBilling';
import { CREDIT_COSTS } from '@/types/billing';

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

export default function BuyCreditPack() {
  const { createCheckout, loading } = useCheckout();
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setError(null);
    const result = await createCheckout({ type: 'credit_pack' });

    if (result.success && result.url) {
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Url.Open(result.url);
      } else {
        window.location.href = result.url;
      }
    } else {
      setError(result.error ?? 'Failed to create checkout');
    }
  };

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <svg
          className="h-4 w-4 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {loading ? 'Loading...' : `Buy ${CREDIT_COSTS.credit_pack_amount} credits — $${CREDIT_COSTS.credit_pack_price_usd}`}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
