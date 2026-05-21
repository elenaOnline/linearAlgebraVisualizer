/**
 * Pure geometry derivation for the Linear Maps concept.
 * No React, no Three.js — math only.
 */
import type { Vec, Vec3, Mat, Mat2x2, Mat3x3, Dim } from '../../types'
import { toVec3 } from '../../linalg/vector'
import { matVec, det2, det3, identity, lerp as matLerp } from '../../linalg/matrix'

export const SINGULAR_EPS = 1e-6

export interface LinearMapsGeometry {
  /** The interpolated matrix A_t = lerp(I, A, t) */
  At: Mat
  /** Transformed standard basis vectors (columns of At) */
  col1: Vec3
  col2: Vec3
  col3: Vec3 | null // null in 2D
  /** Probe vector and its image under At */
  v3: Vec3
  Av3: Vec3
  /** Determinant of the original A (not At) */
  detA: number
  isSingular: boolean
  /**
   * Grid lines for the transformed grid.
   * Each entry is a [start, end] pair of Vec3 endpoints after applying At.
   */
  gridLines: Array<[Vec3, Vec3]>
  /**
   * Unit square (2D) or unit cube (3D) corners after applying At.
   * 4 corners for 2D, 8 for 3D.
   */
  unitShapeCorners: Vec3[]
}

/** Apply mat to a Vec (2D→2D or 3D→3D) and return as Vec3 */
function applyToVec3(mat: Mat, v: Vec): Vec3 {
  return toVec3(matVec(mat, v))
}

/** Compute grid lines for 2D: x = k and y = k for k in [-5..5] */
function gridLines2D(At: Mat): Array<[Vec3, Vec3]> {
  const lines: Array<[Vec3, Vec3]> = []
  for (let k = -5; k <= 5; k++) {
    // Vertical line: x = k, y from -5 to 5
    const p1: [number, number] = [k, -5]
    const p2: [number, number] = [k, 5]
    lines.push([applyToVec3(At, p1), applyToVec3(At, p2)])

    // Horizontal line: y = k, x from -5 to 5
    const p3: [number, number] = [-5, k]
    const p4: [number, number] = [5, k]
    lines.push([applyToVec3(At, p3), applyToVec3(At, p4)])
  }
  return lines
}

/** Compute grid lines for 3D: XZ plane grid x=k and z=m for k,m in [-3..3] */
function gridLines3D(At: Mat): Array<[Vec3, Vec3]> {
  const lines: Array<[Vec3, Vec3]> = []
  for (let k = -3; k <= 3; k++) {
    // Lines parallel to Z axis: x = k, y = 0, z from -3 to 3
    const p1: [number, number, number] = [k, 0, -3]
    const p2: [number, number, number] = [k, 0, 3]
    lines.push([applyToVec3(At, p1), applyToVec3(At, p2)])

    // Lines parallel to X axis: z = k, y = 0, x from -3 to 3
    const p3: [number, number, number] = [-3, 0, k]
    const p4: [number, number, number] = [3, 0, k]
    lines.push([applyToVec3(At, p3), applyToVec3(At, p4)])
  }
  return lines
}

/** Compute the 4 corners of the unit square [0,1]² after transformation */
function unitSquareCorners(At: Mat): Vec3[] {
  const corners: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
  return corners.map((c) => applyToVec3(At, c))
}

/** Compute the 8 corners of the unit cube [0,1]³ after transformation */
function unitCubeCorners(At: Mat): Vec3[] {
  const corners: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ]
  return corners.map((c) => applyToVec3(At, c))
}

export function deriveLinearMapsGeometry(
  A: Mat,
  v: Vec,
  t: number,
  dim: Dim,
): LinearMapsGeometry {
  const n = dim === '2d' ? 2 : 3
  const I = identity(n as 2 | 3)

  // Interpolated matrix: A_t = lerp(I, A, t)
  const At = matLerp(I, A, t)

  // Columns of At = transformed standard basis vectors
  let col1: Vec3
  let col2: Vec3
  let col3: Vec3 | null

  if (dim === '2d') {
    const at = At as Mat2x2
    col1 = [at[0][0], at[1][0], 0]
    col2 = [at[0][1], at[1][1], 0]
    col3 = null
  } else {
    const at = At as Mat3x3
    col1 = [at[0][0], at[1][0], at[2][0]]
    col2 = [at[0][1], at[1][1], at[2][1]]
    col3 = [at[0][2], at[1][2], at[2][2]]
  }

  // Probe vector and image
  const v3 = toVec3(v)
  const Av3 = applyToVec3(At, v)

  // Determinant (of the original A, not At)
  const detA = dim === '2d' ? det2(A as Mat2x2) : det3(A as Mat3x3)
  const isSingular = Math.abs(detA) < SINGULAR_EPS

  // Grid lines
  const gridLines = dim === '2d' ? gridLines2D(At) : gridLines3D(At)

  // Unit shape corners
  const unitShapeCorners = dim === '2d' ? unitSquareCorners(At) : unitCubeCorners(At)

  return {
    At,
    col1,
    col2,
    col3,
    v3,
    Av3,
    detA,
    isSingular,
    gridLines,
    unitShapeCorners,
  }
}
