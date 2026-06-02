import { create } from 'zustand'
import type { PolyDeg } from '../../types'

interface PolyAdditionState {
  deg: PolyDeg
  p: [number, number, number]
  q: [number, number, number]
  showIndicators: boolean
  setDeg: (d: PolyDeg) => void
  setP: (v: [number, number, number]) => void
  setQ: (v: [number, number, number]) => void
  setShowIndicators: (v: boolean) => void
}

export const usePolyAdditionStore = create<PolyAdditionState>((set) => ({
  deg: 'p2',
  p: [0, 1, 0.5],
  q: [0, -0.5, 0.3],
  showIndicators: true,
  setDeg: (d) => set({ deg: d }),
  setP: (v) => set({ p: v }),
  setQ: (v) => set({ q: v }),
  setShowIndicators: (v) => set({ showIndicators: v }),
}))
