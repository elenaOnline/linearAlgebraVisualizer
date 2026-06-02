import { create } from 'zustand'
import type { Complex } from '../../types'

interface ComplexPlaneState {
  z: Complex
  c: Complex
  setZ: (v: Complex) => void
  setC: (v: Complex) => void
}

export const useComplexPlaneStore = create<ComplexPlaneState>((set) => ({
  z: [1.5, 0],
  c: [0.7, 0.7],
  setZ: (v) => set({ z: v }),
  setC: (v) => set({ c: v }),
}))
