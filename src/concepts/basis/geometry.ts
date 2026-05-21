/**
 * Pure geometry derivation for the Basis concept.
 * No React, no Three.js — math only.
 */
import type { Vec, Vec3, Dim } from '../../types'
import { toVec3, add, scale } from '../../linalg/vector'
import { isLinearlyIndependent, spanDimension, changeOfBasis, EPS } from '../../linalg/subspace'

export interface BasisGeometry {
  vectors3: Vec3[]         // 3D form of basis candidates
  p3: Vec3
  isIndependent: boolean
  doesSpan: boolean
  isBasis: boolean
  reasonIfNot: string      // human-readable reason if not a basis
  coordsStandard: number[] // p in standard basis (just p's components)
  coordsBasis: number[] | null // p in chosen basis (null if not a basis)
  latticePoints: Vec3[]    // integer combinations for the lattice grid
}

export function deriveBasisGeometry(
  candidates: Vec[],
  p: Vec,
  dim: Dim,
): BasisGeometry {
  const n = dim === '2d' ? 2 : 3
  const p3 = toVec3(p)
  const vectors3 = candidates.map(toVec3)

  // Truncate/pad candidates to the right number of vectors for this dimension
  const activeCandidates = candidates.slice(0, n)
  const activeVecs = activeCandidates.map((v) => Array.from(v) as number[])

  // --- Independence check ---
  const isIndependent = isLinearlyIndependent(activeVecs)

  // --- Span check: span dimension must equal n ---
  const sd = spanDimension(activeVecs)
  const doesSpan = sd === n

  // --- Basis verdict ---
  const isBasis = isIndependent && doesSpan

  // --- Reason if not a basis ---
  let reasonIfNot = ''
  if (!isBasis) {
    if (!isIndependent && !doesSpan) {
      reasonIfNot =
        'The vectors are linearly dependent and do not span R' +
        (n === 2 ? '²' : '³') +
        '.'
    } else if (!isIndependent) {
      // Try to give a more specific reason
      if (activeVecs.length >= 2) {
        // Check if all vectors are zero
        const allZero = activeVecs.every((v) => v.every((c) => Math.abs(c) < EPS))
        if (allZero) {
          reasonIfNot = 'All vectors are zero — the zero vector is never part of a basis.'
        } else {
          reasonIfNot =
            'The vectors are linearly dependent — at least one is a linear combination of the others.'
        }
      } else {
        reasonIfNot = 'The vectors are linearly dependent.'
      }
    } else {
      // doesSpan is false; this shouldn't happen if we supply exactly n candidates,
      // but handle it defensively (e.g. zero vectors)
      reasonIfNot =
        'The vectors do not span R' +
        (n === 2 ? '²' : '³') +
        ' — they span only a ' +
        sd +
        '-dimensional subspace.'
    }
  }

  // --- Standard coordinates ---
  const coordsStandard = Array.from(p) as number[]

  // --- Basis coordinates ---
  let coordsBasis: number[] | null = null
  if (isBasis) {
    try {
      coordsBasis = changeOfBasis(Array.from(p) as number[], activeVecs)
    } catch {
      coordsBasis = null
    }
  }

  // --- Lattice points ---
  const latticePoints: Vec3[] = []
  if (isBasis) {
    const b = vectors3.slice(0, n)
    if (n === 2) {
      const b1 = b[0]
      const b2 = b[1]
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const pt = add(scale(b1, i), scale(b2, j))
          latticePoints.push(pt)
        }
      }
    } else {
      const b1 = b[0]
      const b2 = b[1]
      const b3 = b[2]
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          for (let k = -3; k <= 3; k++) {
            const pt = add(add(scale(b1, i), scale(b2, j)), scale(b3, k))
            latticePoints.push(pt)
          }
        }
      }
    }
  }

  return {
    vectors3,
    p3,
    isIndependent,
    doesSpan,
    isBasis,
    reasonIfNot,
    coordsStandard,
    coordsBasis,
    latticePoints,
  }
}
