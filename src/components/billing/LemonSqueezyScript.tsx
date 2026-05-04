'use client';

import Script from 'next/script';
import { FEATURES } from '@/lib/feature-flags';

/**
 * LemonSqueezy Lemon.js loader.
 * Add this once in a root layout to enable checkout overlays site-wide.
 */
export default function LemonSqueezyScript() {
  if (!FEATURES.PAYMENT_ENABLED) return null;

  return (
    <Script
      src="https://app.lemonsqueezy.com/js/lemon.js"
      strategy="lazyOnload"
      onLoad={() => {
        // @ts-expect-error — LemonSqueezy global from lemon.js
        if (typeof window.createLemonSqueezy === 'function') {
          // @ts-expect-error
          window.createLemonSqueezy();
        }
      }}
    />
  );
}
