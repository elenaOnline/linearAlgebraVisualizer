import { create } from 'zustand'

interface IsomorphismState {
  a: number   // x-component of R³ vector → coefficient of 1 in polynomial
  b: number   // y-component → coefficient of x
  c: number   // z-component → coefficient of x²
  setA: (v: number) => void
  setB: (v: number) => void
  setC: (v: number) => void
}

export const useIsomorphismStore = create<IsomorphismState>((set) => ({
  a: 1.5,
  b: 1,
  c: 0.5,
  setA: (v) => set({ a: v }),
  setB: (v) => set({ b: v }),
  setC: (v) => set({ c: v }),
}))
