import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Server Client — API Route / Server Action 전용
 *
 * service_role key를 사용하므로 RLS를 바이패스합니다.
 * 반드시 서버사이드에서만 import하세요.
 *
 * ⚠️ SUPABASE_SERVICE_ROLE_KEY는 절대 NEXT_PUBLIC_ 접두사 금지
 * ⚠️ 클라이언트 컴포넌트에서 import 금지
 */
let serverClient: SupabaseClient | null = null;

export function createServerClient(): SupabaseClient {
  // Singleton pattern: 동일 서버 인스턴스에서 재사용
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      '[Testorum] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Check .env and ensure SUPABASE_SERVICE_ROLE_KEY is set (without NEXT_PUBLIC_ prefix).'
    );
  }

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}
