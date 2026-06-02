import { create } from 'zustand'
import type { PolyDeg } from '../../types'

interface PolySpaceState {
  deg: PolyDeg
  a0: number
  a1: number
  a2: number
  setDeg: (d: PolyDeg) => void
  setA0: (v: number) => void
  setA1: (v: number) => void
  setA2: (v: number) => void
}

export const usePolySpaceStore = create<PolySpaceState>((set) => ({
  deg: 'p2',
  a0: 0,
  a1: 1,
  a2: 0.5,
  setDeg: (d) => set({ deg: d }),
  setA0: (v) => set({ a0: v }),
  setA1: (v) => set({ a1: v }),
  setA2: (v) => set({ a2: v }),
}))
