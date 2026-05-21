/**
 * Pure geometry derivation for the Vector Spaces concept.
 * No React, no Three.js — only math.
 */

import type { Vec, Vec3, SubspaceGeometry } from '../../types'
import { add, scale, toVec3, isZero, normalize } from '../../linalg/vector'
import { isInSpan } from '../../linalg/subspace'
import type { CandidateType } from './store'

export interface ConditionResult {
  containsZero: boolean
  closedUnderAddition: boolean      // does a+b land in the candidate?
  closedUnderScalarMult: boolean    // does c*a land in the candidate?
  isSubspace: boolean
}

export interface VectorSpacesGeometry {
  candidateSubspace: SubspaceGeometry
  aPlus_b: Vec3
  cTimesA: Vec3
  conditions: ConditionResult
  /**
   * For offset non-examples: the offset normal vector from origin, so the
   * visualization can show that the origin is NOT on the offset line/plane.
   */
  offsetPoint: Vec3 | null
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * True if vec lies in the span of the given direction vectors.
 * dirs must be Vec3[] already normalised isn't required — isInSpan handles it.
 */
function inSpan(vec: Vec3, dirs: Vec3[]): boolean {
  const numArrayDirs = dirs.map((d) => Array.from(d))
  return isInSpan(Array.from(vec), numArrayDirs)
}

/**
 * True if vec is in the offset set  { dir*t + offsetVec : t ∈ R }.
 * Equivalently: (vec - offsetVec) ∈ span(dir).
 * We do NOT fudge near-misses.
 */
function inOffsetLine(vec: Vec3, dir: Vec3, offsetVec: Vec3): boolean {
  const rel: Vec3 = [vec[0] - offsetVec[0], vec[1] - offsetVec[1], vec[2] - offsetVec[2]]
  return inSpan(rel, [dir])
}

/**
 * True if vec is in the offset plane  { d1*s + d2*t + offsetVec }.
 */
function inOffsetPlane(vec: Vec3, dir1: Vec3, dir2: Vec3, offsetVec: Vec3): boolean {
  const rel: Vec3 = [vec[0] - offsetVec[0], vec[1] - offsetVec[1], vec[2] - offsetVec[2]]
  return inSpan(rel, [dir1, dir2])
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function deriveVectorSpacesGeometry(
  candidateType: CandidateType,
  lineDir: Vec,
  planeDir1: Vec,
  planeDir2: Vec,
  offset: number,
  a: Vec,
  b: Vec,
  c: number,
): VectorSpacesGeometry {
  const a3 = toVec3(a)
  const b3 = toVec3(b)
  const aPlus_b = add(a3, b3)
  const cTimesA = scale(a3, c)

  const lineDirN = normalize(toVec3(lineDir))
  const planeDir1N = normalize(toVec3(planeDir1))
  const planeDir2N = normalize(toVec3(planeDir2))

  // The offset vector: we pick an arbitrary vector perpendicular to the
  // direction (or just a unit vector if that's fine) scaled by offset.
  // For simplicity we place the offset along a fixed axis so it's always
  // clearly away from the origin.  We use a non-zero perpendicular to
  // the line direction for offset-line, and the normal of the plane for
  // offset-plane.
  //
  // BUT the spec says "offset parameter: how far from origin".  We use a
  // simple approach: take a fixed perpendicular direction.
  //
  // For offset-line: perp = any vector not parallel to lineDir.
  // For offset-plane: the plane normal direction.
  const offsetPoint: Vec3 | null = (() => {
    if (candidateType === 'offset-line' || candidateType === 'offset-plane') {
      // For offset-line, push origin perpendicularly to the line direction.
      // For offset-plane, push along the normal.
      // We use a simple cross-product trick to find a perpendicular direction.
      if (candidateType === 'offset-line') {
        // find a vector perpendicular to lineDirN
        let perp: Vec3 = [0, 1, 0]
        // if lineDirN is nearly parallel to [0,1,0], use [1,0,0]
        const dot = Math.abs(lineDirN[0] * 0 + lineDirN[1] * 1 + lineDirN[2] * 0)
        if (dot > 0.9) perp = [1, 0, 0]
        // cross product to get true perpendicular
        const cx = lineDirN[1] * perp[2] - lineDirN[2] * perp[1]
        const cy = lineDirN[2] * perp[0] - lineDirN[0] * perp[2]
        const cz = lineDirN[0] * perp[1] - lineDirN[1] * perp[0]
        const cn = Math.sqrt(cx * cx + cy * cy + cz * cz)
        if (cn < 1e-12) return [offset, 0, 0] as Vec3
        return [cx / cn * offset, cy / cn * offset, cz / cn * offset] as Vec3
      } else {
        // offset-plane: use normal = planeDir1N × planeDir2N
        const nx = planeDir1N[1] * planeDir2N[2] - planeDir1N[2] * planeDir2N[1]
        const ny = planeDir1N[2] * planeDir2N[0] - planeDir1N[0] * planeDir2N[2]
        const nz = planeDir1N[0] * planeDir2N[1] - planeDir1N[1] * planeDir2N[0]
        const nn = Math.sqrt(nx * nx + ny * ny + nz * nz)
        if (nn < 1e-12) return [offset, 0, 0] as Vec3
        return [nx / nn * offset, ny / nn * offset, nz / nn * offset] as Vec3
      }
    }
    return null
  })()

  // ---------- condition tests per candidate type ----------

  let containsZero: boolean
  let closedUnderAddition: boolean
  let closedUnderScalarMult: boolean
  let candidateSubspace: SubspaceGeometry

  switch (candidateType) {
    case 'zero': {
      candidateSubspace = { kind: 'point' }
      containsZero = true
      // Closed under addition: a+b must be zero
      closedUnderAddition = isZero(aPlus_b)
      // Closed under scalar mult: c*a must be zero
      closedUnderScalarMult = isZero(cTimesA)
      break
    }

    case 'line': {
      candidateSubspace = {
        kind: 'line',
        directions: [lineDirN],
      }
      containsZero = true  // line THROUGH origin always contains 0
      closedUnderAddition = inSpan(aPlus_b, [lineDirN])
      closedUnderScalarMult = inSpan(cTimesA, [lineDirN])
      break
    }

    case 'plane': {
      candidateSubspace = {
        kind: 'plane',
        directions: [planeDir1N, planeDir2N],
      }
      containsZero = true  // plane THROUGH origin always contains 0
      closedUnderAddition = inSpan(aPlus_b, [planeDir1N, planeDir2N])
      closedUnderScalarMult = inSpan(cTimesA, [planeDir1N, planeDir2N])
      break
    }

    case 'whole-space': {
      candidateSubspace = { kind: 'space' }
      containsZero = true
      closedUnderAddition = true
      closedUnderScalarMult = true
      break
    }

    case 'offset-line': {
      // Offset line: { lineDirN * t + offsetPoint : t ∈ R }
      // This is NOT a subspace when offset ≠ 0.
      // We still display it as a 'line' SubspaceMesh but shifted;
      // however SubspaceMesh only draws through origin.
      // We represent it visually as a line (the structure is the same shape).
      // The SubspaceMesh will show the direction, and we'll note the offset.
      candidateSubspace = {
        kind: 'line',
        directions: [lineDirN],
      }
      // containsZero: 0 is in the offset line iff 0 - offsetPoint is in span(lineDirN)
      // i.e., -offsetPoint is in span(lineDirN)
      const op = offsetPoint ?? ([0, 0, 0] as Vec3)
      const negOp: Vec3 = [-op[0], -op[1], -op[2]]
      containsZero = inSpan(negOp, [lineDirN])
      // For closed-under-addition / scalar-mult: check if a+b and c*a lie in the
      // AFFINE set (not the subspace through origin).
      // But we only report honestly: since containsZero is already false (for non-zero offset),
      // isSubspace will be false. We still check the geometric closure for information.
      closedUnderAddition = inOffsetLine(aPlus_b, lineDirN, op)
      closedUnderScalarMult = inOffsetLine(cTimesA, lineDirN, op)
      break
    }

    case 'offset-plane': {
      const op = offsetPoint ?? ([0, 0, 0] as Vec3)
      candidateSubspace = {
        kind: 'plane',
        directions: [planeDir1N, planeDir2N],
      }
      // containsZero: -offsetPoint must be in span(planeDir1N, planeDir2N)
      const negOp: Vec3 = [-op[0], -op[1], -op[2]]
      containsZero = inSpan(negOp, [planeDir1N, planeDir2N])
      closedUnderAddition = inOffsetPlane(aPlus_b, planeDir1N, planeDir2N, op)
      closedUnderScalarMult = inOffsetPlane(cTimesA, planeDir1N, planeDir2N, op)
      break
    }
  }

  const isSubspace = containsZero && closedUnderAddition && closedUnderScalarMult

  return {
    candidateSubspace,
    aPlus_b,
    cTimesA,
    conditions: {
      containsZero,
      closedUnderAddition,
      closedUnderScalarMult,
      isSubspace,
    },
    offsetPoint,
  }
}
