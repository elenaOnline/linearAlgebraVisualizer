import { EPS } from '../../linalg/vector'
import type { PolyDeg } from '../../types'

export interface PolySpaceGeo {
  effectiveA2: number
  graphPoints: Array<[number, number]>
  isZero: boolean
  a2IsZero: boolean
  a1IsZero: boolean
}

const SAMPLES = 200
const X_MIN = -10
const X_MAX = 10
const Y_CLAMP = 8

export function computePolySpaceGeo(
  deg: PolyDeg,
  a0: number,
  a1: number,
  a2: number,
): PolySpaceGeo {
  const effectiveA2 = deg === 'p2' ? a2 : 0

  const graphPoints: Array<[number, number]> = []
  for (let i = 0; i < SAMPLES; i++) {
    const x = X_MIN + (i / (SAMPLES - 1)) * (X_MAX - X_MIN)
    const raw = a0 + a1 * x + effectiveA2 * x * x
    const y = Math.max(-Y_CLAMP, Math.min(Y_CLAMP, raw))
    graphPoints.push([x, y])
  }

  return {
    effectiveA2,
    graphPoints,
    isZero: Math.abs(a0) < EPS && Math.abs(a1) < EPS && Math.abs(effectiveA2) < EPS,
    a2IsZero: Math.abs(effectiveA2) < EPS,
    a1IsZero: Math.abs(a1) < EPS,
  }
}
