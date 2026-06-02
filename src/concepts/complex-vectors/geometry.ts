import { complexMag, complexArg } from '../../linalg/complex'
import { EPS } from '../../linalg/vector'
import type { Complex, ComplexVec2 } from '../../types'

export interface ComplexVectorsGeo {
  z1: Complex
  z2: Complex
  z2Arg: number
  z2Mag: number
  z2IsZero: boolean
  vecIsZero: boolean
  combinedPos: [number, number]  // [Re(z1), Im(z1)]
}

export function computeComplexVectorsGeo(vec: ComplexVec2): ComplexVectorsGeo {
  const z1 = vec[0]
  const z2 = vec[1]
  const z2Mag = complexMag(z2)
  const z2IsZero = z2Mag < EPS
  const vecIsZero = complexMag(z1) < EPS && z2IsZero

  return {
    z1,
    z2,
    z2Arg: complexArg(z2),
    z2Mag,
    z2IsZero,
    vecIsZero,
    combinedPos: [z1[0], z1[1]],
  }
}
