import { create } from 'zustand'
import type { TestOption } from '@/types'
import type { TPMResult } from '@/lib/scoring'

interface TestState {
  currentIndex: number
  answers: TestOption[]
  rpgStats: Record<string, number>
  tpmResult: TPMResult | null
  isComplete: boolean
  addAnswer: (option: TestOption) => void
  setTPMResult: (result: TPMResult) => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  currentIndex: 0,
  answers: [],
  rpgStats: {},
  tpmResult: null,
  isComplete: false,
  addAnswer: (option) =>
    set((state) => {
      // RPG 스탯 누적
      const newStats = { ...state.rpgStats }
      Object.entries(option.scores).forEach(([key, val]) => {
        newStats[key] = (newStats[key] ?? 0) + val
      })
      return {
        answers: [...state.answers, option],
        currentIndex: state.currentIndex + 1,
        rpgStats: newStats,
      }
    }),
  setTPMResult: (result) => set({ tpmResult: result }),
  reset: () =>
    set({ currentIndex: 0, answers: [], rpgStats: {}, tpmResult: null, isComplete: false }),
}))
