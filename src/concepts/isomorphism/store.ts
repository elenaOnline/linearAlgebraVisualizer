import { create } from 'zustand'

interface IsomorphismState {
  a: number   // x-component of R² vector → coefficient of x in polynomial
  b: number   // y-component → constant term
  setA: (v: number) => void
  setB: (v: number) => void
}

export const useIsomorphismStore = create<IsomorphismState>((set) => ({
  a: 1.5,
  b: 1,
  setA: (v) => set({ a: v }),
  setB: (v) => set({ b: v }),
}))
