import { useState, useEffect, useCallback } from 'react'
import type {
  GamificationState,
  GamificationActionType,
  GamificationUpdateResult,
  PersonalityDnaEntry,
  DnaProfileByCategory,
} from '@/types'

// ─── useProgress ────────────────────────────────────────────────

export function useProgress() {
  const [data, setData] = useState<GamificationState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/gamification/progress')
      if (res.status === 401) {
        // Not logged in — not an error
        setData(null)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch progress')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

// ─── useUpdateProgress ──────────────────────────────────────────

export function useUpdateProgress() {
  const [loading, setLoading] = useState(false)

  const update = useCallback(async (params: {
    action_type: GamificationActionType
    test_slug?: string
    test_category?: string
  }): Promise<{ success: boolean; data?: GamificationUpdateResult; error?: string }> => {
    setLoading(true)
    try {
      const res = await fetch('/api/gamification/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const json = await res.json()
      if (!res.ok) {
        return { success: false, error: json.error }
      }
      return { success: true, data: json as GamificationUpdateResult }
    } catch {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading }
}

// ─── useDnaProfile ──────────────────────────────────────────────

export function useDnaProfile() {
  const [data, setData] = useState<{
    entries: PersonalityDnaEntry[]
    profile: DnaProfileByCategory[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/dna/profile')
      if (res.status === 401) {
        setData(null)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch DNA profile')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

// ─── useUpdateDna ───────────────────────────────────────────────

export function useUpdateDna() {
  const [loading, setLoading] = useState(false)

  const update = useCallback(async (params: {
    test_slug: string
    result_type_id: string
  }): Promise<{ success: boolean; category?: string; traits?: Record<string, number>; skipped?: boolean; error?: string }> => {
    setLoading(true)
    try {
      const res = await fetch('/api/dna/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const json = await res.json()
      if (!res.ok) {
        return { success: false, error: json.error }
      }
      return json
    } catch {
      return { success: false, error: 'Network error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading }
}
