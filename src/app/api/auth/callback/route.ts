// ============================================================
// src/app/api/auth/callback/route.ts
// Google OAuth 콜백 — code ↔ session 교환
// Supabase 공식 권장 패턴: redirect response에 직접 쿠키 설정
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  // OAuth provider returned an error
  if (errorParam) {
    console.error('[auth/callback] OAuth error:', errorParam, errorDesc);
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(errorDesc || errorParam)}`, origin)
    );
  }

  if (!code) {
    console.error('[auth/callback] No code parameter');
    return NextResponse.redirect(new URL('/en/login?error=no_code', origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[auth/callback] Missing Supabase env vars');
    return NextResponse.redirect(new URL('/en/login?error=config', origin));
  }

  // Ensure `next` is a relative path (prevent open redirect)
  const safePath = next.startsWith('/') ? next : '/';

  // 1) Create the redirect response FIRST
  const redirectUrl = new URL(safePath, origin);
  const response = NextResponse.redirect(redirectUrl);

  // 2) Create Supabase client that reads cookies from request
  //    and writes cookies directly to the redirect response
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Set on the redirect response — this is the key fix
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 3) Exchange code for session — this triggers setAll with session cookies
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] Session exchange error:', error.message);
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // 4) Return the response with cookies attached
  return response;
}
