import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// ─── Config ───
const locales = ['en', 'ko'] as const;
const defaultLocale = 'en';

// ─── Rate Limiter (Edge-compatible in-memory) ───
// NOTE: Vercel Edge Functions are stateless per invocation in production.
// This Map resets on cold starts. For true rate limiting at scale,
// replace with Upstash Redis (@upstash/ratelimit).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// Periodic cleanup to prevent memory leak (runs every 1000 checks)
let cleanupCounter = 0;
function maybeCleanup() {
  cleanupCounter++;
  if (cleanupCounter % 1000 === 0) {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
}

// ─── Security Headers ───
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // AdSense requires unsafe-inline + unsafe-eval
  // TODO: Monitor CSP violations via report-uri and tighten progressively
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://t1.kakaocdn.net https://cdn.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://analytics.google.com https://pagead2.googlesyndication.com https://www.google-analytics.com",
  "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_DIRECTIVES,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ─── next-intl middleware instance ───
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true, // Accept-Language based
});

// ─── Main Middleware ───
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === API Route Handling ===
  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    maybeCleanup();

    if (isRateLimited(ip)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      );
    }

    // API routes pass through with security headers only
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // === Page Routes: next-intl + Security Headers ===
  const response = intlMiddleware(request);
  return applySecurityHeaders(response);
}

export const config = {
  // Match all paths except _next, static files, and favicon
  matcher: ['/((?!_next|.*\\..*).*)'],
};
