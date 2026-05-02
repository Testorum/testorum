import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Lazy singleton — only created on first access (avoids build-time crash)
let _supabase: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

/** @deprecated Use createClient() or getSupabase() instead */
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop: string | symbol) {
    const instance = getSupabase()
    const val = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? val.bind(instance) : val
  },
})
