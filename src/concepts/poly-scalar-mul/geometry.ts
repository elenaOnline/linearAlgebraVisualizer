import { EPS } from '../../linalg/vector'
import type { PolyDeg } from '../../types'

export interface PolyScalarMulGeo {
  pCoeffs: [number, number, number]
  scaledCoeffs: [number, number, number]
  pGraph: Array<[number, number]>
  scaledGraph: Array<[number, number]>
  cIsZero: boolean
  cIsOne: boolean
  cIsNegative: boolean
}

const SAMPLES = 200
const X_MIN = -10
const X_MAX = 10
const Y_CLAMP = 8

function evalPoly(coeffs: [number, number, number], x: number): number {
  return coeffs[0] + coeffs[1] * x + coeffs[2] * x * x
}

function buildGraph(coeffs: [number, number, number]): Array<[number, number]> {
  const pts: Array<[number, number]> = []
  for (let i = 0; i < SAMPLES; i++) {
    const x = X_MIN + (i / (SAMPLES - 1)) * (X_MAX - X_MIN)
    const raw = evalPoly(coeffs, x)
    const y = Math.max(-Y_CLAMP, Math.min(Y_CLAMP, raw))
    pts.push([x, y])
  }
  return pts
}

export function computePolyScalarMulGeo(
  deg: PolyDeg,
  p: [number, number, number],
  c: number,
): PolyScalarMulGeo {
  const pCoeffs: [number, number, number] = [p[0], p[1], deg === 'p2' ? p[2] : 0]
  const scaledCoeffs: [number, number, number] = [c * pCoeffs[0], c * pCoeffs[1], c * pCoeffs[2]]

  const pGraph = buildGraph(pCoeffs)
  const scaledGraph = buildGraph(scaledCoeffs)

  return {
    pCoeffs,
    scaledCoeffs,
    pGraph,
    scaledGraph,
    cIsZero: Math.abs(c) < EPS,
    cIsOne: Math.abs(c - 1) < EPS,
    cIsNegative: c < -EPS,
  }
}
