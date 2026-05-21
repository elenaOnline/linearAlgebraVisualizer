import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3 } from '../../types'

export type CandidateType = 'zero' | 'line' | 'plane' | 'whole-space' | 'offset-line' | 'offset-plane'

interface VectorSpacesState {
  dim: Dim
  candidateType: CandidateType
  lineDir: Vec       // defining direction for line/offset-line
  planeDir1: Vec     // first direction for plane/offset-plane
  planeDir2: Vec     // second direction for plane/offset-plane
  offset: number     // offset for non-examples (how far from origin)
  a: Vec             // test vector a
  b: Vec             // test vector b
  c: number          // scalar
  setDim: (d: Dim) => void
  setCandidateType: (t: CandidateType) => void
  setLineDir: (v: Vec) => void
  setPlaneDir1: (v: Vec) => void
  setPlaneDir2: (v: Vec) => void
  setOffset: (o: number) => void
  setA: (a: Vec) => void
  setB: (b: Vec) => void
  setC: (c: number) => void
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

export const useVectorSpacesStore = create<VectorSpacesState>((set) => ({
  dim: '2d',
  candidateType: 'line',
  lineDir: [1, 0] as Vec2,
  planeDir1: [1, 0] as Vec2,
  planeDir2: [0, 1] as Vec2,
  offset: 1,
  a: [1, 0] as Vec2,
  b: [0, 1] as Vec2,
  c: 2,

  setDim: (d) =>
    set((state) => {
      // Reset candidate if 'plane'/'offset-plane' selected in 2d
      let candidateType = state.candidateType
      if (d === '2d' && (candidateType === 'plane' || candidateType === 'offset-plane')) {
        candidateType = 'line'
      }
      return {
        dim: d,
        candidateType,
        lineDir: toVecDim(state.lineDir, d),
        planeDir1: toVecDim(state.planeDir1, d),
        planeDir2: toVecDim(state.planeDir2, d),
        a: toVecDim(state.a, d),
        b: toVecDim(state.b, d),
      }
    }),

  setCandidateType: (t) => set({ candidateType: t }),
  setLineDir: (v) => set({ lineDir: v }),
  setPlaneDir1: (v) => set({ planeDir1: v }),
  setPlaneDir2: (v) => set({ planeDir2: v }),
  setOffset: (o) => set({ offset: o }),
  setA: (a) => set({ a }),
  setB: (b) => set({ b }),
  setC: (c) => set({ c }),
}))
