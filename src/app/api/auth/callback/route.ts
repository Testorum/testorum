// ============================================================
// src/app/api/auth/callback/route.ts
// Google OAuth 콜백 — code ↔ session 교환
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[auth/callback] Missing Supabase env vars');
    return NextResponse.redirect(new URL('/en/login?error=config', origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie setting may fail in certain contexts — handled by middleware
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] Session exchange error:', error.message);
    return NextResponse.redirect(
      new URL(`/en/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  // Determine redirect path
  // Ensure `next` is a relative path (prevent open redirect)
  const safePath = next.startsWith('/') ? next : '/';

  return NextResponse.redirect(new URL(safePath, origin));
}
