'use client';

import { useState } from 'react';
import { PLAN_CONFIGS, type SubscriptionPlan, type BillingInterval } from '@/types/billing';
import { useCheckout } from '@/hooks/useBilling';

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

interface PricingCardProps {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  currentPlan?: SubscriptionPlan | null;
  isLoggedIn: boolean;
}

export default function PricingCard({
  plan,
  interval,
  currentPlan,
  isLoggedIn,
}: PricingCardProps) {
  const config = PLAN_CONFIGS[plan];
  const { createCheckout, loading } = useCheckout();
  const [error, setError] = useState<string | null>(null);

  const price = interval === 'yearly' ? config.price_yearly : config.price_monthly;
  const monthlyEquivalent =
    interval === 'yearly' && config.price_yearly
      ? (config.price_yearly / 12).toFixed(2)
      : null;

  const isFree = plan === 'free';
  const isCurrent = currentPlan === plan;
  const isPopular = plan === 'pro';
  const noYearly = plan === 'business' || plan === 'free';

  const handleSubscribe = async () => {
    setError(null);

    if (!isLoggedIn) {
      // Detect locale from current path
      const pathLocale = window.location.pathname.split('/')[1] || 'en';
      const locale = ['en', 'ko'].includes(pathLocale) ? pathLocale : 'en';
      window.location.href = `/${locale}/login?redirect=/${locale}/pricing`;
      return;
    }

    if (isFree || isCurrent) return;

    const result = await createCheckout({ plan, interval });

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
    <div
      className={`
        relative flex flex-col rounded-2xl border p-6 transition-shadow
        ${isPopular
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
          : 'border-gray-200 dark:border-gray-700'
        }
        ${isCurrent ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}
      `}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white">
          Most Popular
        </span>
      )}

      {/* Plan name */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {config.name}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        {isFree ? (
          <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
        ) : noYearly && interval === 'yearly' ? (
          <span className="text-lg font-bold text-gray-400 dark:text-gray-500">Monthly only</span>
        ) : (
          <>
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${interval === 'yearly' && !noYearly ? monthlyEquivalent : price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/mo</span>
          </>
        )}
      </div>

      {/* Yearly savings badge */}
      {interval === 'yearly' && !noYearly && config.price_yearly && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          ${config.price_yearly}/yr — save{' '}
          {Math.round(
            (1 - config.price_yearly / (config.price_monthly * 12)) * 100
          )}
          %
        </p>
      )}

      {/* Credits */}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        {config.credits_monthly > 0
          ? `${config.credits_monthly} credits/month`
          : 'No credits included'}
      </p>

      {/* Features */}
      <ul className="mt-4 flex-1 space-y-2">
        {config.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleSubscribe}
        disabled={isFree || isCurrent || loading || (noYearly && interval === 'yearly')}
        className={`
          mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors
          ${isCurrent
            ? 'cursor-default bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            : isFree
            ? 'cursor-default bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            : noYearly && interval === 'yearly'
            ? 'cursor-default bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            : isPopular
            ? 'bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60'
            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-60'
          }
        `}
      >
        {loading
          ? 'Loading...'
          : isCurrent
          ? 'Current Plan'
          : isFree
          ? 'Free Forever'
          : noYearly && interval === 'yearly'
          ? 'Switch to Monthly'
          : `Get ${config.name}`}
      </button>

      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
