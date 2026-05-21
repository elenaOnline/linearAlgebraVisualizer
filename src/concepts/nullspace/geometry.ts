/**
 * Pure geometry derivation for the Nullspace concept.
 * No React, no Three.js — just math.
 */
import type { Vec, Vec3, Mat, Dim, SubspaceGeometry } from '../../types'
import { toVec3, normalize, dot, scale, add, norm, isZero, EPS } from '../../linalg/vector'
import { rank as matRank, nullspaceBasis } from '../../linalg/subspace'
import { matVec } from '../../linalg/matrix'

export interface NullspaceGeometry {
  /** The nullspace rendered as a subspace */
  nullspaceSubspace: SubspaceGeometry
  /** Dimension of the nullspace (nullity): 0, 1, or 2 */
  nullityValue: number
  /** Rank of A */
  rankValue: number
  /** Dimension of the domain (2 for 2D, 3 for 3D) */
  n: number
  /** Probe vector in 3D */
  x3: Vec3
  /** A * x in 3D */
  Ax3: Vec3
  /** Is x in the nullspace? */
  isXInNull: boolean
  /** |Ax| */
  normAx: number
  /** rank < n */
  isSingular: boolean
  /** Non-null when nullity > 0: projection of x onto the nullspace */
  constrainedX: Vec3 | null
}

/**
 * Project a Vec3 onto the 1D nullspace (single direction).
 */
function projectOnto1D(v: Vec3, dir: Vec3): Vec3 {
  const t = dot(v, dir)
  return scale(dir, t)
}

/**
 * Project a Vec3 onto the 2D nullspace (two orthonormal-ish directions).
 * We use Gram–Schmidt-style to get an orthonormal basis for the 2D subspace.
 */
function projectOnto2D(v: Vec3, dir1Raw: Vec3, dir2Raw: Vec3): Vec3 {
  // Orthonormalize dir2 w.r.t. dir1
  const e1 = normalize(dir1Raw)
  const proj2on1 = scale(e1, dot(dir2Raw, e1))
  const perp: Vec3 = [dir2Raw[0] - proj2on1[0], dir2Raw[1] - proj2on1[1], dir2Raw[2] - proj2on1[2]]
  const e2 = normalize(perp)

  const t1 = dot(v, e1)
  const t2 = isZero(e2) ? 0 : dot(v, e2)

  return add(scale(e1, t1), scale(e2, t2))
}

/**
 * Convert a Mat to a plain number[][] for use with the linalg functions.
 */
function matToNumberArray(A: Mat): number[][] {
  return (A as number[][]).map((row) => [...row])
}

/**
 * Derive all geometry for the Nullspace visualization.
 */
export function deriveNullspaceGeometry(
  A: Mat,
  x: Vec,
  constrainToNull: boolean,
  dim: Dim,
): NullspaceGeometry {
  const n = dim === '2d' ? 2 : 3

  // Convert matrix to number[][] for subspace utilities
  const Anum = matToNumberArray(A)

  // Compute rank and nullspace basis
  const rankValue = matRank(Anum, EPS)
  const basisRaw = nullspaceBasis(Anum, EPS)
  const nullityValue = basisRaw.length

  // Convert basis vectors to Vec3
  const basisVecs: Vec3[] = basisRaw.map((b) => toVec3(b as Vec))

  // Build SubspaceGeometry
  let nullspaceSubspace: SubspaceGeometry
  if (nullityValue === 0) {
    nullspaceSubspace = { kind: 'point' }
  } else if (nullityValue === 1) {
    const dir = normalize(basisVecs[0])
    nullspaceSubspace = { kind: 'line', directions: [dir] }
  } else if (nullityValue === 2) {
    const dir1 = normalize(basisVecs[0])
    const dir2 = normalize(basisVecs[1])
    nullspaceSubspace = { kind: 'plane', directions: [dir1, dir2] }
  } else {
    // nullity === n (full nullspace = all of R^n)
    nullspaceSubspace = { kind: 'space' }
  }

  // Probe vector
  const x3 = toVec3(x)

  // Compute Ax
  const Ax = matVec(A, x)
  const Ax3 = toVec3(Ax)

  // Is x in the nullspace?
  const normAx = norm(Ax3)
  const isXInNull = normAx < EPS * 100

  // isSingular: rank < n
  const isSingular = rankValue < n

  // Constrained x (projection onto nullspace)
  let constrainedX: Vec3 | null = null
  if (constrainToNull && nullityValue > 0) {
    if (nullityValue === 1) {
      const dir = normalize(basisVecs[0])
      constrainedX = projectOnto1D(x3, dir)
    } else if (nullityValue === 2) {
      const dir1 = normalize(basisVecs[0])
      const dir2 = normalize(basisVecs[1])
      constrainedX = projectOnto2D(x3, dir1, dir2)
    } else {
      // nullity >= n: entire space is the nullspace, x is already constrained
      constrainedX = x3
    }
  }

  return {
    nullspaceSubspace,
    nullityValue,
    rankValue,
    n,
    x3,
    Ax3,
    isXInNull,
    normAx,
    isSingular,
    constrainedX,
  }
}
