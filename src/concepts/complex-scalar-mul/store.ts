import { create } from 'zustand'
import type { ComplexVec2, Complex } from '../../types'

interface ComplexScalarMulState {
  vec: ComplexVec2
  c: Complex
  setVec: (v: ComplexVec2) => void
  setC: (v: Complex) => void
}

export const useComplexScalarMulStore = create<ComplexScalarMulState>((set) => ({
  vec: [[1, 0], [0, 1]],
  c: [0.7, 0.7],
  setVec: (v) => set({ vec: v }),
  setC: (v) => set({ c: v }),
}))
