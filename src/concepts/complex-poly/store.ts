import { create } from 'zustand'
import type { Complex } from '../../types'

interface ComplexPolyState {
  a0: Complex
  a1: Complex
  a2: Complex
  displayMode: '3d' | '2d'
  setA0: (v: Complex) => void
  setA1: (v: Complex) => void
  setA2: (v: Complex) => void
  setDisplayMode: (m: '3d' | '2d') => void
}

export const useComplexPolyStore = create<ComplexPolyState>((set) => ({
  a0: [0, 0],
  a1: [0, 0],
  a2: [1, 0],
  displayMode: '3d',
  setA0: (v) => set({ a0: v }),
  setA1: (v) => set({ a1: v }),
  setA2: (v) => set({ a2: v }),
  setDisplayMode: (m) => set({ displayMode: m }),
}))
