import type { Vec2, Vec3 } from '../../types'

const EPS = 1e-9

export interface CoordinatesGeo {
  vec: Vec2
  stdCoords: Vec2           // same as vec (trivial, in standard basis)
  customCoords: Vec2 | null // null if |det([v1,v2])| < EPS
  basisIsValid: boolean     // |det([v1,v2])| >= EPS
  detValue: number          // det of [v1 | v2] column matrix (signed)
  latticePoints: Vec3[]     // integer combinations of v1, v2 for the deformed grid
}

/**
 * Compute coordinates of vec in the custom basis {v1, v2}.
 * det = v1[0]*v2[1] - v1[1]*v2[0]
 * If |det| < EPS, the basis is degenerate and customCoords is null.
 * Otherwise, solve [v1|v2] * [x,y]ᵀ = vec by Cramer's rule:
 *   x = (vec[0]*v2[1] - vec[1]*v2[0]) / det
 *   y = (v1[0]*vec[1] - v1[1]*vec[0]) / det
 */
export function computeCoordinatesGeo(
  vec: Vec2,
  v1: Vec2,
  v2: Vec2,
): CoordinatesGeo {
  const det = v1[0] * v2[1] - v1[1] * v2[0]
  const basisIsValid = Math.abs(det) >= EPS

  let customCoords: Vec2 | null = null
  if (basisIsValid) {
    const x = (vec[0] * v2[1] - vec[1] * v2[0]) / det
    const y = (v1[0] * vec[1] - v1[1] * vec[0]) / det
    customCoords = [x, y]
  }

  // Lattice: all integer combinations i*v1 + j*v2 for i,j in [-5, 5]
  const latticePoints: Vec3[] = []
  if (basisIsValid) {
    for (let i = -5; i <= 5; i++) {
      for (let j = -5; j <= 5; j++) {
        latticePoints.push([
          i * v1[0] + j * v2[0],
          i * v1[1] + j * v2[1],
          0,
        ])
      }
    }
  }

  return {
    vec,
    stdCoords: vec,
    customCoords,
    basisIsValid,
    detValue: det,
    latticePoints,
  }
}
