'use client';

import Script from 'next/script';

/**
 * LemonSqueezy Lemon.js loader.
 * Add this once in a root layout to enable checkout overlays site-wide.
 *
 * Usage: <LemonSqueezyScript />
 *
 * Then open overlays with:
 *   window.LemonSqueezy.Url.Open(checkoutUrl)
 */
export default function LemonSqueezyScript() {
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
