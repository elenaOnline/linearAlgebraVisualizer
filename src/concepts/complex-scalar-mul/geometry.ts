import { complexMul, complexMag, complexArg } from '../../linalg/complex'
import { EPS } from '../../linalg/vector'
import type { Complex, ComplexVec2 } from '../../types'

export interface ComplexScalarMulGeo {
  vec: ComplexVec2
  c: Complex
  scaled: ComplexVec2
  scaledZ1: Complex
  scaledZ2: Complex
  scaledZ2Arg: number
  scaledZ2Mag: number
  inputZ2Arg: number
  inputZ2Mag: number
  rotationAngle: number     // arg(c)
  scaleFactor: number       // |c|
  isPureRotation: boolean   // ||c|-1| < EPS
  cIsI: boolean             // c ≈ i
  cMagIsZero: boolean       // |c| < EPS
  cIsPositiveReal: boolean  // Im(c) ≈ 0 && Re(c) > 0
}

export function computeComplexScalarMulGeo(vec: ComplexVec2, c: Complex): ComplexScalarMulGeo {
  const scaledZ1 = complexMul(c, vec[0])
  const scaledZ2 = complexMul(c, vec[1])
  const scaled: ComplexVec2 = [scaledZ1, scaledZ2]

  const cMag = complexMag(c)
  const rotationAngle = complexArg(c)
  const scaleFactor = cMag
  const isPureRotation = Math.abs(cMag - 1) < EPS
  const cIsI = Math.abs(cMag - 1) < EPS && Math.abs(rotationAngle - Math.PI / 2) < 0.05
  const cMagIsZero = cMag < EPS
  const cIsPositiveReal = Math.abs(c[1]) < EPS && c[0] > EPS

  return {
    vec,
    c,
    scaled,
    scaledZ1,
    scaledZ2,
    scaledZ2Arg: complexArg(scaledZ2),
    scaledZ2Mag: complexMag(scaledZ2),
    inputZ2Arg: complexArg(vec[1]),
    inputZ2Mag: complexMag(vec[1]),
    rotationAngle,
    scaleFactor,
    isPureRotation,
    cIsI,
    cMagIsZero,
    cIsPositiveReal,
  }
}
