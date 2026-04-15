import { create } from 'zustand'
import type { TestOption } from '@/types'

interface TestState {
  currentIndex: number
  answers: TestOption[]
  rpgStats: Record<string, number>
  isComplete: boolean
  addAnswer: (option: TestOption) => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  currentIndex: 0,
  answers: [],
  rpgStats: {},
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
  reset: () =>
    set({ currentIndex: 0, answers: [], rpgStats: {}, isComplete: false }),
}))
