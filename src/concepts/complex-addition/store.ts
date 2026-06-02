import { create } from 'zustand'
import type { ComplexVec2 } from '../../types'

interface ComplexAdditionState {
  u: ComplexVec2
  v: ComplexVec2
  setU: (v: ComplexVec2) => void
  setV: (v: ComplexVec2) => void
}

export const useComplexAdditionStore = create<ComplexAdditionState>((set) => ({
  u: [[1, 0], [0, 0.5]],
  v: [[-0.5, 0.5], [0.3, 0.3]],
  setU: (val) => set({ u: val }),
  setV: (val) => set({ v: val }),
}))
