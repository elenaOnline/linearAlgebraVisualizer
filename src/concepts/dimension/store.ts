import { create } from 'zustand'
import type { Dim, Vec, Vec2, Vec3 } from '../../types'

export interface VectorEntry {
  id: string
  vec: Vec
  visible: boolean
}

interface DimensionState {
  dim: Dim
  vectors: VectorEntry[]
  setDim: (d: Dim) => void
  addVector: () => void
  removeVector: (id: string) => void
  updateVector: (id: string, vec: Vec) => void
  toggleVisible: (id: string) => void
}

// Default vectors for each new addition (cycle through these)
const DEFAULT_VECS_2D: Vec2[] = [
  [1, 1],
  [1, 0],
  [0, 1],
  [-1, 1],
]
const DEFAULT_VECS_3D: Vec3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 0],
]

let counter = 3 // start after the two default vectors

function nextId(): string {
  counter += 1
  return `v${counter}`
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

export const useDimensionStore = create<DimensionState>((set) => ({
  dim: '2d',
  vectors: [
    { id: 'v1', vec: [2, 0] as Vec2, visible: true },
    { id: 'v2', vec: [0, 2] as Vec2, visible: true },
  ],

  setDim: (d) =>
    set((state) => ({
      dim: d,
      vectors: state.vectors.map((entry) => ({
        ...entry,
        vec: toVecDim(entry.vec, d),
      })),
    })),

  addVector: () =>
    set((state) => {
      if (state.vectors.length >= 4) return state
      const idx = state.vectors.length // 0-based index for default pick
      const defaults = state.dim === '3d' ? DEFAULT_VECS_3D : DEFAULT_VECS_2D
      const defaultVec = defaults[idx % defaults.length]
      return {
        vectors: [
          ...state.vectors,
          { id: nextId(), vec: defaultVec, visible: true },
        ],
      }
    }),

  removeVector: (id) =>
    set((state) => {
      if (state.vectors.length <= 1) return state
      return { vectors: state.vectors.filter((e) => e.id !== id) }
    }),

  updateVector: (id, vec) =>
    set((state) => ({
      vectors: state.vectors.map((e) => (e.id === id ? { ...e, vec } : e)),
    })),

  toggleVisible: (id) =>
    set((state) => ({
      vectors: state.vectors.map((e) =>
        e.id === id ? { ...e, visible: !e.visible } : e,
      ),
    })),
}))

// Exported helper so Dimension.tsx can read the store
export type { DimensionState }
