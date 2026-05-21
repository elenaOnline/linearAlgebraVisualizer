import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3 } from '../../types'

interface VectorsState {
  dim: Dim
  u: Vec
  v: Vec
  c: number
  showSum: boolean
  showTipToTail: boolean
  showScalarMult: boolean
  setDim: (d: Dim) => void
  setU: (u: Vec) => void
  setV: (v: Vec) => void
  setC: (c: number) => void
  setShowSum: (b: boolean) => void
  setShowTipToTail: (b: boolean) => void
  setShowScalarMult: (b: boolean) => void
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

export const useVectorsStore = create<VectorsState>((set) => ({
  dim: '2d',
  u: [2, 1] as Vec2,
  v: [0, 2] as Vec2,
  c: 1.5,
  showSum: false,
  showTipToTail: false,
  showScalarMult: false,

  setDim: (d) =>
    set((state) => ({
      dim: d,
      u: toVecDim(state.u, d),
      v: toVecDim(state.v, d),
    })),

  setU: (u) => set({ u }),
  setV: (v) => set({ v }),
  setC: (c) => set({ c }),
  setShowSum: (b) => set({ showSum: b }),
  setShowTipToTail: (b) => set({ showTipToTail: b }),
  setShowScalarMult: (b) => set({ showScalarMult: b }),
}))
