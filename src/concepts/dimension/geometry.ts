/**
 * Pure geometry derivation for the Dimension concept.
 * No React, no Three.js — just math.
 */
import type { Vec, Vec3, Dim, SubspaceGeometry } from '../../types'
import { toVec3, normalize, norm, isZero, EPS } from '../../linalg/vector'
import { spanDimension } from '../../linalg/subspace'

export interface VectorStatus {
  id: string
  vec3: Vec3
  /** True if this vector is independent of all vectors that precede it in the list */
  isIndependent: boolean
}

export interface DimensionGeometry {
  vectorStatuses: VectorStatus[]
  spanSubspace: SubspaceGeometry
  /** 0, 1, 2, or 3 */
  dimension: number
  /** How many visible vectors are in the set */
  numVectors: number
  /** 2 for '2d', 3 for '3d' */
  maxDimension: number
  /** The independent direction vectors that form the basis of the span */
  spanDirections: Vec3[]
}

/**
 * Given a list of Vec3 direction vectors, return up to two orthonormal-ish
 * independent directions suitable for rendering a SubspaceMesh.
 */
function computeSpanDirections(independent: Vec3[]): Vec3[] {
  const dirs: Vec3[] = []

  for (const v of independent) {
    if (isZero(v)) continue

    if (dirs.length === 0) {
      dirs.push(normalize(v))
      continue
    }

    if (dirs.length === 1) {
      // Gram–Schmidt: subtract projection onto first direction
      const d0 = dirs[0]
      const dot = v[0] * d0[0] + v[1] * d0[1] + v[2] * d0[2]
      const perp: Vec3 = [v[0] - dot * d0[0], v[1] - dot * d0[1], v[2] - dot * d0[2]]
      if (norm(perp) > EPS * 10) {
        dirs.push(normalize(perp))
      }
      break
    }

    // Two directions is the maximum we need for SubspaceMesh
    break
  }

  return dirs
}

/**
 * Derive all geometry for the Dimension visualization.
 *
 * Only visible vectors participate in the span computation.
 * Per-vector independence is determined in order: vector i is independent
 * iff it is not in span(visible vectors 0..i-1).
 */
export function deriveDimensionGeometry(
  vectors: Array<{ id: string; vec: Vec; visible: boolean }>,
  dim: Dim,
): DimensionGeometry {
  const maxDimension = dim === '3d' ? 3 : 2

  // Filter to only visible vectors
  const activeVectors = vectors.filter((e) => e.visible)
  const numVectors = activeVectors.length

  // Convert to Vec3 and to number[] row for rank computation
  const vec3List: Vec3[] = activeVectors.map((e) => toVec3(e.vec))
  const vecRows: number[][] = vec3List.map((v) =>
    dim === '2d' ? [v[0], v[1]] : [v[0], v[1], v[2]],
  )

  // Build per-vector independence status
  // Vector i is independent iff rank(v0..vi) > rank(v0..v(i-1))
  const vectorStatuses: VectorStatus[] = []
  const independentVec3s: Vec3[] = []

  for (let i = 0; i < activeVectors.length; i++) {
    const entry = activeVectors[i]
    const v3 = vec3List[i]

    // Rank of all vectors up to and including i
    const rankWithI = spanDimension(vecRows.slice(0, i + 1))
    // Rank of vectors before i
    const rankBefore = i === 0 ? 0 : spanDimension(vecRows.slice(0, i))

    const isIndependent = rankWithI > rankBefore

    vectorStatuses.push({ id: entry.id, vec3: v3, isIndependent })
    if (isIndependent) {
      independentVec3s.push(v3)
    }
  }

  // Overall dimension = rank of all active vectors, capped at maxDimension
  const dimension = Math.min(numVectors === 0 ? 0 : spanDimension(vecRows), maxDimension)

  // Span directions for rendering
  const spanDirections = computeSpanDirections(independentVec3s)

  // Build SubspaceGeometry
  let spanSubspace: SubspaceGeometry

  if (dimension === 0) {
    spanSubspace = { kind: 'point' }
  } else if (dimension === 1) {
    spanSubspace = {
      kind: 'line',
      directions: spanDirections.length > 0 ? [spanDirections[0]] : [[1, 0, 0]],
    }
  } else if (dimension === 2) {
    if (spanDirections.length >= 2) {
      spanSubspace = { kind: 'plane', directions: [spanDirections[0], spanDirections[1]] }
    } else {
      // Fallback — should not occur in practice
      spanSubspace = { kind: 'plane', directions: [[1, 0, 0], [0, 1, 0]] }
    }
  } else {
    // dimension === 3
    spanSubspace = { kind: 'space' }
  }

  // Now build statuses that include invisible vectors (as not independent)
  // so the UI can show all vectors regardless
  const allStatuses: VectorStatus[] = vectors.map((entry) => {
    if (!entry.visible) {
      return { id: entry.id, vec3: toVec3(entry.vec), isIndependent: false }
    }
    const found = vectorStatuses.find((s) => s.id === entry.id)
    return found ?? { id: entry.id, vec3: toVec3(entry.vec), isIndependent: false }
  })

  return {
    vectorStatuses: allStatuses,
    spanSubspace,
    dimension,
    numVectors,
    maxDimension,
    spanDirections,
  }
}
