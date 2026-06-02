import { create } from 'zustand'

interface DifferentiationState {
  a0: number
  a1: number
  a2: number
  showKernel: boolean
  setA0: (v: number) => void
  setA1: (v: number) => void
  setA2: (v: number) => void
  setShowKernel: (v: boolean) => void
}

export const useDifferentiationStore = create<DifferentiationState>((set) => ({
  a0: 0,
  a1: 2,
  a2: 1,
  showKernel: true,
  setA0: (v) => set({ a0: v }),
  setA1: (v) => set({ a1: v }),
  setA2: (v) => set({ a2: v }),
  setShowKernel: (v) => set({ showKernel: v }),
}))
