import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3 } from '../../types'

interface BasisState {
  dim: Dim
  b1: Vec
  b2: Vec
  b3: Vec // only used in 3D
  p: Vec  // point to express in both bases
  setDim: (d: Dim) => void
  setB1: (v: Vec) => void
  setB2: (v: Vec) => void
  setB3: (v: Vec) => void
  setP: (p: Vec) => void
}

function toVecDim(v: Vec, dim: Dim): Vec {
  if (dim === '3d') {
    if (v.length === 3) return v
    return [v[0], v[1], 0] as Vec3
  } else {
    if (v.length === 2) return v
    return [v[0], v[1]] as Vec2
  }
}

export const useBasisStore = create<BasisState>((set) => ({
  dim: '2d',
  b1: [1, 0] as Vec2,
  b2: [0, 1] as Vec2,
  b3: [0, 0, 1] as Vec3,
  p: [2, 1] as Vec2,

  setDim: (d) =>
    set((state) => ({
      dim: d,
      b1: toVecDim(state.b1, d),
      b2: toVecDim(state.b2, d),
      b3: toVecDim(state.b3, d),
      p: toVecDim(state.p, d),
    })),

  setB1: (v) => set({ b1: v }),
  setB2: (v) => set({ b2: v }),
  setB3: (v) => set({ b3: v }),
  setP: (p) => set({ p }),
}))
