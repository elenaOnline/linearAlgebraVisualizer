import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3, Mat, Mat2x2, Mat3x3 } from '../../types'

interface LinearMapsState {
  dim: Dim
  A: Mat
  v: Vec
  t: number
  showTransformedGrid: boolean
  showDetRegion: boolean
  showColumnSpace: boolean
  setDim: (d: Dim) => void
  setA: (A: Mat) => void
  setV: (v: Vec) => void
  setT: (t: number) => void
  setShowTransformedGrid: (b: boolean) => void
  setShowDetRegion: (b: boolean) => void
  setShowColumnSpace: (b: boolean) => void
}

const DEFAULT_A_2D: Mat2x2 = [[2, 1], [0, 1]]
const DEFAULT_A_3D: Mat3x3 = [[2, 0, 0], [0, 1, 0.5], [0, 0, 1]]

function defaultA(dim: Dim): Mat {
  return dim === '2d' ? DEFAULT_A_2D : DEFAULT_A_3D
}

function defaultV(dim: Dim): Vec {
  return dim === '2d' ? ([1, 1] as Vec2) : ([1, 1, 1] as Vec3)
}

export const useLinearMapsStore = create<LinearMapsState>((set) => ({
  dim: '2d',
  A: DEFAULT_A_2D,
  v: [1, 1] as Vec2,
  t: 1,
  showTransformedGrid: true,
  showDetRegion: true,
  showColumnSpace: false,

  setDim: (d) =>
    set({
      dim: d,
      A: defaultA(d),
      v: defaultV(d),
    }),

  setA: (A) => set({ A }),
  setV: (v) => set({ v }),
  setT: (t) => set({ t }),
  setShowTransformedGrid: (b) => set({ showTransformedGrid: b }),
  setShowDetRegion: (b) => set({ showDetRegion: b }),
  setShowColumnSpace: (b) => set({ showColumnSpace: b }),
}))
