import { create } from 'zustand'
import type { ComplexVec2 } from '../../types'

interface ComplexVectorsState {
  vec: ComplexVec2
  setVec: (v: ComplexVec2) => void
}

export const useComplexVectorsStore = create<ComplexVectorsState>((set) => ({
  vec: [[1, 0], [0, 1]],
  setVec: (v) => set({ vec: v }),
}))
