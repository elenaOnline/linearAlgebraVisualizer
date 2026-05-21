import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3, Mat, Mat2x2, Mat3x3 } from '../../types'

export interface NullspaceState {
  dim: Dim
  A: Mat
  x: Vec
  constrainToNull: boolean
  setDim: (d: Dim) => void
  setA: (A: Mat) => void
  setX: (x: Vec) => void
  setConstrainToNull: (b: boolean) => void
}

const DEFAULT_A_2D: Mat2x2 = [
  [1, 2],
  [2, 4],
]

// rank-1 matrix: nullspace = span([-2,1,0]), rank=2 in first two columns
const DEFAULT_A_3D: Mat3x3 = [
  [1, 2, 0],
  [2, 4, 0],
  [0, 0, 1],
]

function toVecDim(v: Vec, dim: Dim): Vec {
  if (dim === '3d') {
    if (v.length === 3) return v
    return [v[0], v[1], 0] as Vec3
  } else {
    if (v.length === 2) return v
    return [v[0], v[1]] as Vec2
  }
}

export const useNullspaceStore = create<NullspaceState>((set) => ({
  dim: '2d',
  A: DEFAULT_A_2D,
  x: [1, 0] as Vec2,
  constrainToNull: false,

  setDim: (d) =>
    set((state) => ({
      dim: d,
      A: d === '2d' ? DEFAULT_A_2D : DEFAULT_A_3D,
      x: toVecDim(state.x, d),
    })),

  setA: (A) => set({ A }),
  setX: (x) => set({ x }),
  setConstrainToNull: (b) => set({ constrainToNull: b }),
}))
