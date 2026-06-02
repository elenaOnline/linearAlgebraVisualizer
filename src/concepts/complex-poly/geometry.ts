import {
  complexMag,
  complexMul,
  complexSub,
  complexAdd,
  complexScale,
  complexPolar,
  complexArg,
  evalComplexPoly,
} from '../../linalg/complex'
import { EPS } from '../../linalg/vector'
import type { Complex } from '../../types'

export interface ComplexPolyGeo {
  zeros: Complex[]
  isDoubleZero: boolean
  isZero: boolean
  sampleGrid: Complex[][]
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number }
}

export function computeComplexPolyGeo(
  a0: Complex,
  a1: Complex,
  a2: Complex,
  gridResolution = 8,
  bounds = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
): ComplexPolyGeo {
  const mag0 = complexMag(a0)
  const mag1 = complexMag(a1)
  const mag2 = complexMag(a2)

  // Build sampleGrid regardless of zero case
  const { xMin, xMax, yMin, yMax } = bounds
  const N = gridResolution
  const sampleGrid: Complex[][] = []
  for (let row = 0; row < N; row++) {
    const rowArr: Complex[] = []
    for (let col = 0; col < N; col++) {
      const x = xMin + (col / (N - 1)) * (xMax - xMin)
      const y = yMin + (row / (N - 1)) * (yMax - yMin)
      rowArr.push(evalComplexPoly([a0, a1, a2], [x, y]))
    }
    sampleGrid.push(rowArr)
  }

  // All zero polynomial
  if (mag0 < EPS && mag1 < EPS && mag2 < EPS) {
    return {
      zeros: [],
      isDoubleZero: false,
      isZero: true,
      sampleGrid,
      bounds,
    }
  }

  // Leading coefficient is zero — constant or linear
  if (mag2 < EPS) {
    if (mag1 >= EPS) {
      // Linear: one zero at z = -a0/a1 (complex division)
      const denom = a1[0] * a1[0] + a1[1] * a1[1]
      const zero: Complex = [
        (-a0[0] * a1[0] - a0[1] * a1[1]) / denom,
        (-a0[1] * a1[0] + a0[0] * a1[1]) / denom,
      ]
      return {
        zeros: [zero],
        isDoubleZero: false,
        isZero: false,
        sampleGrid,
        bounds,
      }
    }
    // Constant non-zero polynomial: no zeros
    return {
      zeros: [],
      isDoubleZero: false,
      isZero: false,
      sampleGrid,
      bounds,
    }
  }

  // Quadratic: discriminant = a1² - 4*a0*a2
  const a1Sq = complexMul(a1, a1)
  const fourA0A2 = complexScale(complexMul(a0, a2), 4)
  const discriminant = complexSub(a1Sq, fourA0A2)

  const isDoubleZero = complexMag(discriminant) < EPS * 4

  // Complex square root: sqrt(r * e^{i*theta}) = sqrt(r) * e^{i*theta/2}
  const sqrtD = complexPolar(Math.sqrt(complexMag(discriminant)), complexArg(discriminant) / 2)

  // Denominator: 2 * a2
  const twoA2 = complexScale(a2, 2)
  const denom = twoA2[0] * twoA2[0] + twoA2[1] * twoA2[1]

  // negA1 = -a1
  const negA1 = complexScale(a1, -1)

  // zero1 = (-a1 + sqrtD) / (2*a2)
  const num1 = complexAdd(negA1, sqrtD)
  const zero1: Complex = [
    (num1[0] * twoA2[0] + num1[1] * twoA2[1]) / denom,
    (num1[1] * twoA2[0] - num1[0] * twoA2[1]) / denom,
  ]

  // zero2 = (-a1 - sqrtD) / (2*a2)
  const num2 = complexSub(negA1, sqrtD)
  const zero2: Complex = [
    (num2[0] * twoA2[0] + num2[1] * twoA2[1]) / denom,
    (num2[1] * twoA2[0] - num2[0] * twoA2[1]) / denom,
  ]

  return {
    zeros: [zero1, zero2],
    isDoubleZero,
    isZero: false,
    sampleGrid,
    bounds,
  }
}
