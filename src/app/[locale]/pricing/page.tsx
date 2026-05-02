'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import PricingCard from '@/components/billing/PricingCard';
import { CREDIT_COSTS } from '@/types/billing';
import { useCheckout } from '@/hooks/useBilling';
import type { SubscriptionPlan, BillingInterval } from '@/types/billing';

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { createCheckout, loading: checkoutLoading } = useCheckout();
  const locale = useLocale();
  const [creditError, setCreditError] = useState<string | null>(null);

  // Check login + current plan
  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.subscription) {
          setCurrentPlan(data.subscription.plan);
        }
      })
      .catch(() => {});
  }, []);

  const plans: SubscriptionPlan[] = ['free', 'pro', 'creator', 'business'];

  const handleBuyCreditPack = async () => {
    setCreditError(null);
    if (!isLoggedIn) {
      window.location.href = `/${locale}/login?redirect=/${locale}/pricing`;
      return;
    }
    const result = await createCheckout({ type: 'credit_pack' });
    if (result.success && result.url) {
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Url.Open(result.url);
      } else {
        window.location.href = result.url;
      }
    } else {
      setCreditError(result.error ?? 'Failed to create checkout');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Choose your plan
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Unlock deep insights and premium features
        </p>
      </div>

      {/* Interval toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm ${interval === 'monthly' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setInterval(interval === 'monthly' ? 'yearly' : 'monthly')}
          className={`
            relative h-6 w-11 rounded-full transition-colors
            ${interval === 'yearly' ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}
          `}
        >
          <span
            className={`
              absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform
              ${interval === 'yearly' ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        <span
          className={`text-sm ${interval === 'yearly' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}
        >
          Yearly
        </span>
        {interval === 'yearly' && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Save up to 33%
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard
            key={plan}
            plan={plan}
            interval={interval}
            currentPlan={currentPlan}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      {/* Credit pack section */}
      <div className="mt-16 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Need more credits?
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buy {CREDIT_COSTS.credit_pack_amount} credits for ${CREDIT_COSTS.credit_pack_price_usd} — available for all users
          </p>
          <button
            onClick={handleBuyCreditPack}
            disabled={checkoutLoading}
            className="mt-4 rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
          >
            {checkoutLoading ? 'Loading...' : 'Buy Credit Pack'}
          </button>
          {creditError && (
            <p className="mt-2 text-xs text-red-500">{creditError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
