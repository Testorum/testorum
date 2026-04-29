import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Supabase admin client — bypasses RLS via service_role key.
 *
 * ⚠️  SERVER-SIDE ONLY. Never import in client components or expose to browser.
 * Use exclusively in:
 *   - API Route Handlers (webhook processing etc.)
 *   - Server Actions requiring admin-level DB writes
 *   - pg function invocation via .rpc()
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
  );
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
