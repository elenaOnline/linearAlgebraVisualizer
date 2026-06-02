import { EPS } from '../../linalg/vector'
import type { PolyDeg } from '../../types'

export interface PolyAdditionGeo {
  pCoeffs: [number, number, number]
  qCoeffs: [number, number, number]
  sumCoeffs: [number, number, number]
  pGraph: Array<[number, number]>
  qGraph: Array<[number, number]>
  sumGraph: Array<[number, number]>
  sumIsZero: boolean
}

const SAMPLES = 200
const X_MIN = -4
const X_MAX = 4
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

export function computePolyAdditionGeo(
  deg: PolyDeg,
  p: [number, number, number],
  q: [number, number, number],
): PolyAdditionGeo {
  const pCoeffs: [number, number, number] = [p[0], p[1], deg === 'p2' ? p[2] : 0]
  const qCoeffs: [number, number, number] = [q[0], q[1], deg === 'p2' ? q[2] : 0]
  const sumCoeffs: [number, number, number] = [
    pCoeffs[0] + qCoeffs[0],
    pCoeffs[1] + qCoeffs[1],
    pCoeffs[2] + qCoeffs[2],
  ]

  const pGraph = buildGraph(pCoeffs)
  const qGraph = buildGraph(qCoeffs)
  const sumGraph = buildGraph(sumCoeffs)

  const sumIsZero =
    Math.abs(sumCoeffs[0]) < EPS &&
    Math.abs(sumCoeffs[1]) < EPS &&
    Math.abs(sumCoeffs[2]) < EPS

  return { pCoeffs, qCoeffs, sumCoeffs, pGraph, qGraph, sumGraph, sumIsZero }
}
