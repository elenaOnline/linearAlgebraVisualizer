import { describe, it, expect } from 'vitest'
import { matVec, matMat, det2, det3, transpose, identity, lerp } from './matrix'
import type { Mat2x2, Mat3x3, Vec2, Vec3 } from '../types'

const I2: Mat2x2 = [
  [1, 0],
  [0, 1],
]
const I3: Mat3x3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]

const A2: Mat2x2 = [
  [2, 1],
  [3, 4],
]
const A3: Mat3x3 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

describe('matVec', () => {
  it('identity * v = v (2×2)', () => {
    const v: Vec2 = [3, 5]
    expect(matVec(I2, v)).toEqual([3, 5])
  })
  it('identity * v = v (3×3)', () => {
    const v: Vec3 = [1, 2, 3]
    expect(matVec(I3, v)).toEqual([1, 2, 3])
  })
  it('2×2 product', () => {
    const v: Vec2 = [1, 1]
    // [2,1; 3,4] * [1,1] = [3, 7]
    expect(matVec(A2, v)).toEqual([3, 7])
  })
  it('3×3 product', () => {
    const v: Vec3 = [1, 0, 0]
    // First column of A3
    expect(matVec(A3, v)).toEqual([1, 4, 7])
  })
  it('zero matrix * v = 0', () => {
    const Z: Mat2x2 = [
      [0, 0],
      [0, 0],
    ]
    expect(matVec(Z, [5, 3] as Vec2)).toEqual([0, 0])
  })
})

describe('matMat', () => {
  it('I * A = A (2×2)', () => {
    expect(matMat(I2, A2)).toEqual(A2)
  })
  it('A * I = A (2×2)', () => {
    expect(matMat(A2, I2)).toEqual(A2)
  })
  it('I * A = A (3×3)', () => {
    expect(matMat(I3, A3)).toEqual(A3)
  })
  it('2×2 product', () => {
    // [2,1; 3,4] * [2,1; 3,4] = [7,6; 18,19]
    expect(matMat(A2, A2)).toEqual([
      [7, 6],
      [18, 19],
    ])
  })
})

describe('det2', () => {
  it('det(I2) = 1', () => {
    expect(det2(I2)).toBe(1)
  })
  it('det of singular = 0', () => {
    const S: Mat2x2 = [
      [1, 2],
      [2, 4],
    ]
    expect(det2(S)).toBe(0)
  })
  it('positive determinant', () => {
    // [3,1; 2,4] → 12 - 2 = 10
    const B: Mat2x2 = [
      [3, 1],
      [2, 4],
    ]
    expect(det2(B)).toBe(10)
  })
  it('negative determinant', () => {
    // [1,2; 3,4] → 4 - 6 = -2
    const B: Mat2x2 = [
      [1, 2],
      [3, 4],
    ]
    expect(det2(B)).toBe(-2)
  })
})

describe('det3', () => {
  it('det(I3) = 1', () => {
    expect(det3(I3)).toBe(1)
  })
  it('det of rank-deficient = 0', () => {
    expect(det3(A3)).toBeCloseTo(0) // rows are linearly dependent
  })
  it('det respects row swap sign change', () => {
    const B: Mat3x3 = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
    const C: Mat3x3 = [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, 1],
    ]
    // Swapping rows 1 & 2 negates det
    expect(det3(C)).toBeCloseTo(-det3(B))
  })
  it('known 3×3 determinant', () => {
    const D: Mat3x3 = [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ]
    // Tridiagonal — det = 4
    expect(det3(D)).toBeCloseTo(4)
  })
})

describe('transpose', () => {
  it('I2 transposed is I2', () => {
    expect(transpose(I2)).toEqual(I2)
  })
  it('I3 transposed is I3', () => {
    expect(transpose(I3)).toEqual(I3)
  })
  it('2×2 transpose', () => {
    expect(transpose(A2)).toEqual([
      [2, 3],
      [1, 4],
    ])
  })
  it('3×3 transpose', () => {
    const T = transpose(A3) as Mat3x3
    expect(T[0]).toEqual([1, 4, 7])
    expect(T[1]).toEqual([2, 5, 8])
    expect(T[2]).toEqual([3, 6, 9])
  })
  it('double transpose = original', () => {
    expect(transpose(transpose(A2))).toEqual(A2)
  })
})

describe('identity', () => {
  it('identity(2) = I2', () => {
    expect(identity(2)).toEqual(I2)
  })
  it('identity(3) = I3', () => {
    expect(identity(3)).toEqual(I3)
  })
})

describe('lerp (matrix)', () => {
  it('t=0 returns A (2×2)', () => {
    expect(lerp(A2, I2, 0)).toEqual(A2)
  })
  it('t=1 returns B (2×2)', () => {
    expect(lerp(A2, I2, 1)).toEqual(I2)
  })
  it('t=0.5 is midpoint entry-wise (2×2)', () => {
    const M = lerp(I2, A2, 0.5)
    // Between [[1,0],[0,1]] and [[2,1],[3,4]] → [[1.5,0.5],[1.5,2.5]]
    expect((M as Mat2x2)[0][0]).toBeCloseTo(1.5)
    expect((M as Mat2x2)[0][1]).toBeCloseTo(0.5)
    expect((M as Mat2x2)[1][0]).toBeCloseTo(1.5)
    expect((M as Mat2x2)[1][1]).toBeCloseTo(2.5)
  })
  it('t=0 returns A (3×3)', () => {
    expect(lerp(A3, I3, 0)).toEqual(A3)
  })
  it('t=1 returns B (3×3)', () => {
    expect(lerp(A3, I3, 1)).toEqual(I3)
  })
})
