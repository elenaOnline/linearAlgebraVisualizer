import { create } from 'zustand'
import type { Vec2 } from '../../types'

interface CoordinatesState {
  vec: Vec2
  v1: Vec2
  v2: Vec2
  setVec: (v: Vec2) => void
  setV1: (v: Vec2) => void
  setV2: (v: Vec2) => void
}

export const useCoordinatesStore = create<CoordinatesState>((set) => ({
  vec: [1, 1],
  v1: [1, 0.5],
  v2: [0.5, 1],
  setVec: (v) => set({ vec: v }),
  setV1: (v) => set({ v1: v }),
  setV2: (v) => set({ v2: v }),
}))
