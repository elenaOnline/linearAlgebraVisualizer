import type { Vec, Vec3, Dim } from '../../types'
import { add, scale, toVec3, norm } from '../../linalg/vector'

export interface VectorsGeometry {
  u3: Vec3
  v3: Vec3
  sum3: Vec3
  cV3: Vec3
  /** The tail of the tip-to-tail v-copy is placed at the tip of u (= u3 itself) */
  tipToTailOffset3: Vec3
  normU: number
  normV: number
}

export function deriveVectorsGeometry(u: Vec, v: Vec, c: number, _dim: Dim): VectorsGeometry {
  const u3 = toVec3(u)
  const v3 = toVec3(v)
  const sum3 = add(u3, v3)
  const cV3 = scale(v3, c)
  // The ghost copy of v starts at the tip of u — its origin is u3
  const tipToTailOffset3: Vec3 = [u3[0], u3[1], u3[2]]
  const normU = norm(u3)
  const normV = norm(v3)

  return {
    u3,
    v3,
    sum3,
    cV3,
    tipToTailOffset3,
    normU,
    normV,
  }
}
