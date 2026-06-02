import { create } from 'zustand'
import type { PolyDeg } from '../../types'

interface PolyScalarMulState {
  deg: PolyDeg
  p: [number, number, number]
  c: number
  showIndicators: boolean
  setDeg: (d: PolyDeg) => void
  setP: (v: [number, number, number]) => void
  setC: (v: number) => void
  setShowIndicators: (v: boolean) => void
}

export const usePolyScalarMulStore = create<PolyScalarMulState>((set) => ({
  deg: 'p2',
  p: [0, 1, 0.5],
  c: 2,
  showIndicators: true,
  setDeg: (d) => set({ deg: d }),
  setP: (v) => set({ p: v }),
  setC: (v) => set({ c: v }),
  setShowIndicators: (v) => set({ showIndicators: v }),
}))
