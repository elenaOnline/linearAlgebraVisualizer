import { complexAdd, complexSub, complexMag, complexArg } from '../../linalg/complex'
import { EPS } from '../../linalg/vector'
import type { Complex, ComplexVec2 } from '../../types'

export interface ComplexAdditionGeo {
  u: ComplexVec2
  v: ComplexVec2
  sum: ComplexVec2
  sumZ1: Complex
  sumZ2: Complex
  sumZ2Arg: number
  sumZ2Mag: number
  uZ2Arg: number
  uZ2Mag: number
  vZ2Arg: number
  vZ2Mag: number
  sumIsZero: boolean
  uEqualsV: boolean
}

export function computeComplexAdditionGeo(u: ComplexVec2, v: ComplexVec2): ComplexAdditionGeo {
  const sumZ1 = complexAdd(u[0], v[0])
  const sumZ2 = complexAdd(u[1], v[1])
  const sum: ComplexVec2 = [sumZ1, sumZ2]

  const sumIsZero = complexMag(sumZ1) < EPS && complexMag(sumZ2) < EPS
  const uEqualsV =
    complexMag(complexSub(u[0], v[0])) < EPS &&
    complexMag(complexSub(u[1], v[1])) < EPS

  return {
    u,
    v,
    sum,
    sumZ1,
    sumZ2,
    sumZ2Arg: complexArg(sumZ2),
    sumZ2Mag: complexMag(sumZ2),
    uZ2Arg: complexArg(u[1]),
    uZ2Mag: complexMag(u[1]),
    vZ2Arg: complexArg(v[1]),
    vZ2Mag: complexMag(v[1]),
    sumIsZero,
    uEqualsV,
  }
}
