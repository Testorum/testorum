import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { timingSafeEqual } from 'crypto';

/**
 * LemonSqueezy SDK configuration.
 *
 * ⚠️  SERVER-SIDE ONLY. Call once per request before any LS SDK function.
 * Validates required env vars and initializes the SDK with API key.
 */

const REQUIRED_ENV_VARS = [
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
] as const;

let isConfigured = false;

export function configureLemonSqueezy() {
  if (isConfigured) return;

  const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required LemonSqueezy env vars: ${missing.join(', ')}`
    );
  }

  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => {
      console.error('[LemonSqueezy SDK Error]', error);
    },
  });

  isConfigured = true;
}

/**
 * Verify LemonSqueezy webhook signature.
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param rawBody - The raw request body as string
 * @param signature - The X-Signature header value
 * @returns true if signature is valid
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(rawBody)
  );

  const digest = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // ── Constant-time comparison (prevents timing side-channel attacks) ──
  try {
    return timingSafeEqual(
      Buffer.from(digest, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    // Length mismatch throws — always invalid
    return false;
  }
}

/** Resolved store ID from env */
export function getStoreId(): number {
  return Number(process.env.LEMONSQUEEZY_STORE_ID!);
}
