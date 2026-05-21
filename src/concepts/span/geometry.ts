/**
 * Pure geometry derivation for the Span concept.
 * No React, no Three.js — just math.
 */
import type { Vec, Vec3, Dim, SubspaceGeometry } from '../../types'
import { toVec3, add, scale, normalize, norm, isZero, EPS } from '../../linalg/vector'
import { spanDimension, isInSpan } from '../../linalg/subspace'

export interface SpanGeometry {
  /** 3D form of active vectors */
  vectors3: Vec3[]
  /** The span as a subspace descriptor */
  spanSubspace: SubspaceGeometry
  /** Dimension of the span: 0, 1, 2, or 3 */
  dimension: number
  /** c1*v1 + c2*v2 + c3*v3 (only active vectors contribute) */
  combinationPoint: Vec3
  /** Whether probe lies in the span */
  isProbeInSpan: boolean
  /** 3D form of the probe point */
  probe3: Vec3
}

/**
 * Pick an orthonormal-ish basis for the span of the given Vec3 vectors.
 * Returns up to 2 independent direction unit vectors.
 */
function basisDirections(vecs: Vec3[]): Vec3[] {
  const dirs: Vec3[] = []

  for (const v of vecs) {
    if (isZero(v)) continue

    if (dirs.length === 0) {
      dirs.push(normalize(v))
      continue
    }

    if (dirs.length === 1) {
      // Check if v is linearly independent from dirs[0]
      // Project out the dirs[0] component
      const d0 = dirs[0]
      const proj = scale(d0, v[0] * d0[0] + v[1] * d0[1] + v[2] * d0[2])
      const perp: Vec3 = [v[0] - proj[0], v[1] - proj[1], v[2] - proj[2]]
      if (norm(perp) > EPS * 10) {
        dirs.push(normalize(perp))
      }
      continue
    }

    // dirs.length === 2 — we have enough for a plane
    break
  }

  return dirs
}

/**
 * Derive all geometry for the Span visualization.
 *
 * @param vecs  Active vectors (1–3), in the current dim's coordinate space
 * @param c1    Coefficient for v1
 * @param c2    Coefficient for v2
 * @param c3    Coefficient for v3
 * @param probe The probe point
 * @param dim   Current dimension mode
 */
export function deriveSpanGeometry(
  vecs: Vec[],
  c1: number,
  c2: number,
  c3: number,
  probe: Vec,
  dim: Dim,
): SpanGeometry {
  // Convert all vectors to 3D form
  const vectors3 = vecs.map(toVec3)
  const probe3 = toVec3(probe)

  // Build the linear-algebra representation (as number[][] rows)
  // In 2D mode, use only 2 components; in 3D, use all 3
  const vecRows: number[][] = vectors3.map((v) => (dim === '2d' ? [v[0], v[1]] : [v[0], v[1], v[2]]))
  const probeRow: number[] = dim === '2d' ? [probe3[0], probe3[1]] : [probe3[0], probe3[1], probe3[2]]

  // Dimension of the span
  const dimension = spanDimension(vecRows)

  // Build SubspaceGeometry
  let spanSubspace: SubspaceGeometry

  if (dimension === 0) {
    spanSubspace = { kind: 'point' }
  } else if (dimension === 1) {
    // One independent direction
    const dirs = basisDirections(vectors3)
    spanSubspace = { kind: 'line', directions: dirs.length > 0 ? [dirs[0]] : [[1, 0, 0]] }
  } else if (dimension === 2) {
    // Two independent directions
    const dirs = basisDirections(vectors3)
    if (dirs.length >= 2) {
      spanSubspace = { kind: 'plane', directions: [dirs[0], dirs[1]] }
    } else {
      // Fallback — should not normally happen
      spanSubspace = { kind: 'plane', directions: [[1, 0, 0], [0, 1, 0]] }
    }
  } else {
    // dimension === 3
    spanSubspace = { kind: 'space' }
  }

  // Compute combination point: sum of ci * vi for active vectors
  const coefficients = [c1, c2, c3]
  let combinationPoint: Vec3 = [0, 0, 0]
  for (let i = 0; i < vectors3.length; i++) {
    const contribution = scale(vectors3[i], coefficients[i])
    combinationPoint = add(combinationPoint, contribution)
  }

  // Check whether probe is in span
  const probeInSpan = isInSpan(probeRow, vecRows)

  return {
    vectors3,
    spanSubspace,
    dimension,
    combinationPoint,
    isProbeInSpan: probeInSpan,
    probe3,
  }
}
