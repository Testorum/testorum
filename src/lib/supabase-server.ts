import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Supabase server client for Server Components / Route Handlers / Server Actions.
 * Uses anon key → RLS is enforced.
 * Must be called inside a request scope (cookies() available).
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // setAll can throw in Server Components (read-only).
            // Safe to ignore — middleware handles refresh.
          }
        },
      },
    }
  );
}
export { createSupabaseServer as createServerClient };
