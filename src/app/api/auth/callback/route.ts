// ============================================================
// src/app/api/auth/callback/route.ts
// Google OAuth 콜백 — code ↔ session 교환
// Supabase 공식 권장 패턴: redirect response에 직접 쿠키 설정
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 문자 제외 (0/O, 1/I)
  let code = 'TS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Map internal Supabase/OAuth errors to safe client-facing codes.
 * Prevents leaking internal state (DB config, token details) via URL params.
 */
function toSafeErrorCode(error: string | undefined): string {
  if (!error) return 'unknown';
  const lower = error.toLowerCase();
  if (lower.includes('expired') || lower.includes('timeout')) return 'session_expired';
  if (lower.includes('invalid') || lower.includes('malformed')) return 'invalid_request';
  if (lower.includes('denied') || lower.includes('cancel')) return 'access_denied';
  if (lower.includes('rate') || lower.includes('limit')) return 'rate_limited';
  return 'auth_failed';
}

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
      new URL(`/en/login?error=${toSafeErrorCode(errorDesc || errorParam)}`, origin)
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
      new URL(`/en/login?error=${toSafeErrorCode(error.message)}`, origin)
    );
  }

  // 3.5) Ensure profile exists with referral_code (multi-layer defense)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        const admin = createClient(supabaseUrl, serviceKey);
        const { data: existing } = await admin
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (!existing?.referral_code) {
          // Generate unique referral code (retry on collision)
          let code = generateReferralCode();
          let attempts = 0;
          while (attempts < 5) {
            const { error: upsertErr } = await admin
              .from('profiles')
              .upsert(
                {
                  id: user.id,
                  referral_code: code,
                  display_name: existing ? undefined : (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'),
                },
                { onConflict: 'id', ignoreDuplicates: false }
              );
            if (!upsertErr) break;
            // referral_code unique constraint collision — regenerate
            code = generateReferralCode();
            attempts++;
          }
        }
      }
    }
  } catch (profileErr) {
    // Non-critical — log and continue
    console.error('[auth/callback] Profile upsert error:', profileErr);
  }

  // 4) Return the response with cookies attached
  return response;
}
