import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { globalApiLimiter } from '@/lib/rate-limit';

// ─── Config ───
const locales = ['en', 'ko'] as const;
const defaultLocale = 'en';

// ─── Security Headers ───
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // AdSense requires unsafe-inline + unsafe-eval
  // TODO: Monitor CSP violations via report-uri and tighten progressively
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://t1.kakaocdn.net https://cdn.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://analytics.google.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://accounts.google.com",
  "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://accounts.google.com https://*.supabase.co",
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

// ─── Supabase Session Refresh ───
// Refreshes the Supabase auth token on every request to keep sessions alive
async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser() triggers a token refresh if the session is about to expire
  await supabase.auth.getUser();

  return response;
}

// ─── Main Middleware ───
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === API Route Handling ===
  if (pathname.startsWith('/api/')) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Upstash Redis rate limiting (persistent across cold starts)
    try {
      const { success, limit, remaining, reset } = await globalApiLimiter.limit(ip);

      if (!success) {
        const response = NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', reset.toString());
        response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
        return applySecurityHeaders(response);
      }
    } catch (err) {
      // Redis 장애 시 요청을 차단하지 않음 (fail-open)
      // 레이트 리미팅 없이 통과시키되 로그 남김
      console.error('[rate-limit] Redis error, failing open:', err);
    }

    // API routes: security headers + Supabase session refresh
    const response = NextResponse.next();
    const refreshed = await refreshSupabaseSession(request, response);
    return applySecurityHeaders(refreshed);
  }

  // === Referral Detection ===
  const refCode = request.nextUrl.searchParams.get('ref');
  if (refCode && /^[A-Za-z0-9]{6,12}$/.test(refCode)) {
    const cleanUrl = new URL(request.nextUrl.toString());
    cleanUrl.searchParams.delete('ref');
    const refResponse = NextResponse.redirect(cleanUrl);
    refResponse.cookies.set('testorum_ref', refCode, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return applySecurityHeaders(refResponse);
  }

  // === Page Routes: next-intl + Security Headers + Supabase session refresh ===
  const response = intlMiddleware(request);
  const refreshed = await refreshSupabaseSession(request, response);
  return applySecurityHeaders(refreshed);
}

export const config = {
  // Match all paths except _next, static files, and favicon
  matcher: ['/((?!_next|.*\\..*).*)'],
};
