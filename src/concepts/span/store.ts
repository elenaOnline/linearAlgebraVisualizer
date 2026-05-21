import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3 } from '../../types'

export interface SpanState {
  dim: Dim
  numVectors: 1 | 2 | 3
  v1: Vec
  v2: Vec
  v3: Vec
  c1: number
  c2: number
  c3: number
  probe: Vec
  setDim: (d: Dim) => void
  setNumVectors: (n: 1 | 2 | 3) => void
  setV1: (v: Vec) => void
  setV2: (v: Vec) => void
  setV3: (v: Vec) => void
  setC1: (c: number) => void
  setC2: (c: number) => void
  setC3: (c: number) => void
  setProbe: (p: Vec) => void
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

export const useSpanStore = create<SpanState>((set) => ({
  dim: '2d',
  numVectors: 2,
  v1: [2, 0] as Vec2,
  v2: [0, 2] as Vec2,
  v3: [1, 1] as Vec2,
  c1: 1,
  c2: 1,
  c3: 1,
  probe: [1, 1] as Vec2,

  setDim: (d) =>
    set((state) => ({
      dim: d,
      v1: toVecDim(state.v1, d),
      v2: toVecDim(state.v2, d),
      v3: toVecDim(state.v3, d),
      probe: toVecDim(state.probe, d),
    })),

  setNumVectors: (n) => set({ numVectors: n }),
  setV1: (v) => set({ v1: v }),
  setV2: (v) => set({ v2: v }),
  setV3: (v) => set({ v3: v }),
  setC1: (c) => set({ c1: c }),
  setC2: (c) => set({ c2: c }),
  setC3: (c) => set({ c3: c }),
  setProbe: (p) => set({ probe: p }),
}))
