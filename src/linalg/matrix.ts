import type { Mat, Mat2x2, Mat3x3, Vec, Vec2, Vec3 } from '../types'

/** Entry-wise linear interpolation between two same-shape matrices */
export function lerp(A: Mat, B: Mat, t: number): Mat {
  if (A.length === 2 && B.length === 2) {
    const a = A as Mat2x2
    const b = B as Mat2x2
    return [
      [a[0][0] + (b[0][0] - a[0][0]) * t, a[0][1] + (b[0][1] - a[0][1]) * t],
      [a[1][0] + (b[1][0] - a[1][0]) * t, a[1][1] + (b[1][1] - a[1][1]) * t],
    ] as Mat2x2
  }
  const a = A as Mat3x3
  const b = B as Mat3x3
  return [
    [
      a[0][0] + (b[0][0] - a[0][0]) * t,
      a[0][1] + (b[0][1] - a[0][1]) * t,
      a[0][2] + (b[0][2] - a[0][2]) * t,
    ],
    [
      a[1][0] + (b[1][0] - a[1][0]) * t,
      a[1][1] + (b[1][1] - a[1][1]) * t,
      a[1][2] + (b[1][2] - a[1][2]) * t,
    ],
    [
      a[2][0] + (b[2][0] - a[2][0]) * t,
      a[2][1] + (b[2][1] - a[2][1]) * t,
      a[2][2] + (b[2][2] - a[2][2]) * t,
    ],
  ] as Mat3x3
}

/** Matrix-vector product. Dimensions must match (2×2·Vec2 or 3×3·Vec3) */
export function matVec(A: Mat, v: Vec): Vec {
  if (A.length === 2) {
    const a = A as Mat2x2
    const u = v as Vec2
    return [a[0][0] * u[0] + a[0][1] * u[1], a[1][0] * u[0] + a[1][1] * u[1]] as Vec2
  }
  const a = A as Mat3x3
  const u = v as Vec3
  return [
    a[0][0] * u[0] + a[0][1] * u[1] + a[0][2] * u[2],
    a[1][0] * u[0] + a[1][1] * u[1] + a[1][2] * u[2],
    a[2][0] * u[0] + a[2][1] * u[1] + a[2][2] * u[2],
  ] as Vec3
}

/** Matrix-matrix product. Both must be same size (2×2 or 3×3) */
export function matMat(A: Mat, B: Mat): Mat {
  if (A.length === 2) {
    const a = A as Mat2x2
    const b = B as Mat2x2
    return [
      [
        a[0][0] * b[0][0] + a[0][1] * b[1][0],
        a[0][0] * b[0][1] + a[0][1] * b[1][1],
      ],
      [
        a[1][0] * b[0][0] + a[1][1] * b[1][0],
        a[1][0] * b[0][1] + a[1][1] * b[1][1],
      ],
    ] as Mat2x2
  }
  const a = A as Mat3x3
  const b = B as Mat3x3
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0] + a[0][2] * b[2][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1] + a[0][2] * b[2][1],
      a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2] * b[2][2],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0] + a[1][2] * b[2][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1] + a[1][2] * b[2][1],
      a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2] * b[2][2],
    ],
    [
      a[2][0] * b[0][0] + a[2][1] * b[1][0] + a[2][2] * b[2][0],
      a[2][0] * b[0][1] + a[2][1] * b[1][1] + a[2][2] * b[2][1],
      a[2][0] * b[0][2] + a[2][1] * b[1][2] + a[2][2] * b[2][2],
    ],
  ] as Mat3x3
}

/** Determinant of a 2×2 matrix */
export function det2(A: Mat2x2): number {
  return A[0][0] * A[1][1] - A[0][1] * A[1][0]
}

/** Determinant of a 3×3 matrix (cofactor expansion along first row) */
export function det3(A: Mat3x3): number {
  return (
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
  )
}

/** Transpose */
export function transpose(A: Mat): Mat {
  if (A.length === 2) {
    const a = A as Mat2x2
    return [
      [a[0][0], a[1][0]],
      [a[0][1], a[1][1]],
    ] as Mat2x2
  }
  const a = A as Mat3x3
  return [
    [a[0][0], a[1][0], a[2][0]],
    [a[0][1], a[1][1], a[2][1]],
    [a[0][2], a[1][2], a[2][2]],
  ] as Mat3x3
}

/** Identity matrix of size n */
export function identity(n: 2 | 3): Mat {
  if (n === 2) {
    return [
      [1, 0],
      [0, 1],
    ] as Mat2x2
  }
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ] as Mat3x3
}
