import { complexMul, complexMag, complexArg } from '../../linalg/complex'
import { EPS } from '../../linalg/vector'
import type { Complex } from '../../types'

export interface ComplexPlaneGeo {
  z: Complex
  c: Complex
  product: Complex
  rotationAngle: number   // arg(c), in (-π,π]
  scaleFactor: number     // |c|
  isPureRotation: boolean // ||c|-1| < EPS
  cIsI: boolean           // ||c|-1| < EPS && |arg(c) - π/2| < 0.05
  cMagIsZero: boolean     // |c| < EPS
  zIsZero: boolean        // |z| < EPS
}

export function computeComplexPlaneGeo(z: Complex, c: Complex): ComplexPlaneGeo {
  const product = complexMul(c, z)
  const rotationAngle = complexArg(c)
  const scaleFactor = complexMag(c)
  const cMag = complexMag(c)
  const isPureRotation = Math.abs(cMag - 1) < EPS
  const cIsI = Math.abs(cMag - 1) < EPS && Math.abs(rotationAngle - Math.PI / 2) < 0.05
  const cMagIsZero = cMag < EPS
  const zIsZero = complexMag(z) < EPS

  return {
    z,
    c,
    product,
    rotationAngle,
    scaleFactor,
    isPureRotation,
    cIsI,
    cMagIsZero,
    zIsZero,
  }
}
