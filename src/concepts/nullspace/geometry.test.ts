import { describe, it, expect } from 'vitest'
import { deriveNullspaceGeometry } from './geometry'
import type { Mat2x2, Mat3x3, Vec2, Vec3 } from '../../types'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function approx(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) < eps
}

// ──────────────────────────────────────────────────────────────────────────────
// 2×2 cases
// ──────────────────────────────────────────────────────────────────────────────

describe('deriveNullspaceGeometry — 2×2', () => {
  it('identity 2×2: nullity=0, kind=point, isSingular=false', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveNullspaceGeometry(I, [1, 0] as Vec2, false, '2d')
    expect(g.nullityValue).toBe(0)
    expect(g.rankValue).toBe(2)
    expect(g.n).toBe(2)
    expect(g.nullspaceSubspace.kind).toBe('point')
    expect(g.isSingular).toBe(false)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('[[1,0],[0,0]]: nullity=1, kind=line, rankValue=1', () => {
    const A: Mat2x2 = [[1, 0], [0, 0]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    expect(g.nullityValue).toBe(1)
    expect(g.rankValue).toBe(1)
    expect(g.nullspaceSubspace.kind).toBe('line')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('zero 2×2: nullity=2, kind=plane, rankValue=0', () => {
    const Z: Mat2x2 = [[0, 0], [0, 0]]
    const g = deriveNullspaceGeometry(Z, [1, 0] as Vec2, false, '2d')
    expect(g.nullityValue).toBe(2)
    expect(g.rankValue).toBe(0)
    expect(g.nullspaceSubspace.kind).toBe('plane')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('[[1,2],[2,4]]: nullity=1, kind=line, rankValue=1', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    expect(g.nullityValue).toBe(1)
    expect(g.rankValue).toBe(1)
    expect(g.nullspaceSubspace.kind).toBe('line')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('[[1,2],[2,4]]: nullspace direction is proportional to [-2,1]', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    const dirs = g.nullspaceSubspace.directions!
    expect(dirs).toHaveLength(1)
    const [dx, dy] = dirs[0]
    // The direction should be ±[-2,1]/sqrt(5)
    const ratio = dx !== 0 ? dy / dx : null
    if (ratio !== null) {
      // dy/dx = 1/(-2) = -0.5
      expect(Math.abs(Math.abs(ratio) - 0.5)).toBeLessThan(1e-6)
    } else {
      // dx = 0: shouldn't happen for this nullspace
      expect(true).toBe(false)
    }
  })

  it('isXInNull: x=[-2,1] for A=[[1,2],[2,4]] → true', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [-2, 1] as Vec2, false, '2d')
    expect(g.isXInNull).toBe(true)
    expect(g.normAx).toBeLessThan(1e-6)
  })

  it('isXInNull: x=[1,0] for A=[[1,2],[2,4]] → false', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    expect(g.isXInNull).toBe(false)
    expect(g.normAx).toBeGreaterThan(1e-6)
  })

  it('rank + nullity = n always holds (various 2×2 matrices)', () => {
    const matrices: Mat2x2[] = [
      [[1, 0], [0, 1]],
      [[1, 2], [2, 4]],
      [[0, 0], [0, 0]],
      [[3, 1], [6, 2]],
      [[1, 0], [0, 0]],
      [[2, 3], [4, 6]],
    ]
    for (const A of matrices) {
      const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
      expect(g.rankValue + g.nullityValue).toBe(g.n)
    }
  })

  it('Ax3 computed correctly: identity * [2,3] → [2,3,0]', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveNullspaceGeometry(I, [2, 3] as Vec2, false, '2d')
    expect(approx(g.Ax3[0], 2)).toBe(true)
    expect(approx(g.Ax3[1], 3)).toBe(true)
    expect(approx(g.Ax3[2], 0)).toBe(true)
  })

  it('x3 pads 2D probe with z=0', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveNullspaceGeometry(I, [1, 2] as Vec2, false, '2d')
    expect(g.x3).toEqual([1, 2, 0])
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// 3×3 cases
// ──────────────────────────────────────────────────────────────────────────────

describe('deriveNullspaceGeometry — 3×3', () => {
  it('3×3 identity: nullity=0, kind=point, isSingular=false', () => {
    const I: Mat3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const g = deriveNullspaceGeometry(I, [1, 0, 0] as Vec3, false, '3d')
    expect(g.nullityValue).toBe(0)
    expect(g.rankValue).toBe(3)
    expect(g.n).toBe(3)
    expect(g.nullspaceSubspace.kind).toBe('point')
    expect(g.isSingular).toBe(false)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('zero 3×3: nullity=3, kind=space, rankValue=0', () => {
    const Z: Mat3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    const g = deriveNullspaceGeometry(Z, [1, 0, 0] as Vec3, false, '3d')
    expect(g.nullityValue).toBe(3)
    expect(g.rankValue).toBe(0)
    expect(g.nullspaceSubspace.kind).toBe('space')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('3×3 rank-2: [[1,2,0],[2,4,0],[0,0,1]] → nullity=1, kind=line', () => {
    const A: Mat3x3 = [[1, 2, 0], [2, 4, 0], [0, 0, 1]]
    const g = deriveNullspaceGeometry(A, [1, 0, 0] as Vec3, false, '3d')
    expect(g.nullityValue).toBe(1)
    expect(g.rankValue).toBe(2)
    expect(g.nullspaceSubspace.kind).toBe('line')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('3×3 rank-1: all zero rows except first → nullity=2, kind=plane', () => {
    const A: Mat3x3 = [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
    const g = deriveNullspaceGeometry(A, [0, 1, 0] as Vec3, false, '3d')
    expect(g.nullityValue).toBe(2)
    expect(g.rankValue).toBe(1)
    expect(g.nullspaceSubspace.kind).toBe('plane')
    expect(g.isSingular).toBe(true)
    expect(g.rankValue + g.nullityValue).toBe(g.n)
  })

  it('rank + nullity = n always holds (various 3×3 matrices)', () => {
    const matrices: Mat3x3[] = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      [[1, 2, 0], [2, 4, 0], [0, 0, 1]],
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      [[1, 0, 0], [0, 0, 0], [0, 0, 0]],
      [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    ]
    for (const A of matrices) {
      const g = deriveNullspaceGeometry(A, [1, 0, 0] as Vec3, false, '3d')
      expect(g.rankValue + g.nullityValue).toBe(g.n)
    }
  })

  it('[[1,2,3],[4,5,6],[7,8,9]] has rank 2, nullity 1', () => {
    const A: Mat3x3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const g = deriveNullspaceGeometry(A, [1, 0, 0] as Vec3, false, '3d')
    expect(g.rankValue).toBe(2)
    expect(g.nullityValue).toBe(1)
    expect(g.nullspaceSubspace.kind).toBe('line')
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// constrainedX
// ──────────────────────────────────────────────────────────────────────────────

describe('constrainedX', () => {
  it('constrainToNull=false → constrainedX is null', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    expect(g.constrainedX).toBeNull()
  })

  it('constrainToNull=true, nullity=0 → constrainedX is null (no subspace to constrain to)', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveNullspaceGeometry(I, [1, 0] as Vec2, true, '2d')
    expect(g.constrainedX).toBeNull()
  })

  it('constrainToNull=true, 1D nullspace: constrained x is in the nullspace direction', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    // Nullspace direction is proportional to [-2,1]
    // probe x=[3,0] → projection onto [-2,1]/sqrt(5)
    // dot([3,0,0], [-2,1,0]/sqrt(5)) * [-2,1,0]/sqrt(5)
    // = (3*(-2)/sqrt(5) + 0) * [-2,1,0]/sqrt(5)
    // = -6/sqrt(5) * [-2,1,0]/sqrt(5) = 12/5 * [1,0,0] + (-6/5) * [0,1,0]...
    // Let's just verify the result lies along the nullspace direction
    const g = deriveNullspaceGeometry(A, [3, 0] as Vec2, true, '2d')
    expect(g.constrainedX).not.toBeNull()
    const cx = g.constrainedX!
    // cx should satisfy A*cx ≈ 0
    // A*cx[0..1] = [[1,2],[2,4]] * [cx[0],cx[1]]
    const Acx0 = 1 * cx[0] + 2 * cx[1]
    const Acx1 = 2 * cx[0] + 4 * cx[1]
    expect(Math.abs(Acx0)).toBeLessThan(1e-6)
    expect(Math.abs(Acx1)).toBeLessThan(1e-6)
  })

  it('constrainToNull=true, 1D nullspace: x already in nullspace → stays in nullspace', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [-2, 1] as Vec2, true, '2d')
    expect(g.constrainedX).not.toBeNull()
    const cx = g.constrainedX!
    const Acx0 = 1 * cx[0] + 2 * cx[1]
    const Acx1 = 2 * cx[0] + 4 * cx[1]
    expect(Math.abs(Acx0)).toBeLessThan(1e-6)
    expect(Math.abs(Acx1)).toBeLessThan(1e-6)
  })

  it('constrainToNull=true, 2D nullspace (zero matrix): full projection', () => {
    const Z: Mat2x2 = [[0, 0], [0, 0]]
    const probe: Vec2 = [3, 4]
    const g = deriveNullspaceGeometry(Z, probe, true, '2d')
    expect(g.constrainedX).not.toBeNull()
    const cx = g.constrainedX!
    // In the zero matrix case (nullity=2, kind=plane), the whole space is the nullspace
    // The projection should reproduce x (with z=0 appended)
    expect(approx(cx[0], 3)).toBe(true)
    expect(approx(cx[1], 4)).toBe(true)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// Line direction normalization
// ──────────────────────────────────────────────────────────────────────────────

describe('nullspace direction normalization', () => {
  it('nullspace direction is a unit vector', () => {
    const A: Mat2x2 = [[1, 2], [2, 4]]
    const g = deriveNullspaceGeometry(A, [1, 0] as Vec2, false, '2d')
    const dirs = g.nullspaceSubspace.directions!
    const len = Math.sqrt(dirs[0][0] ** 2 + dirs[0][1] ** 2 + dirs[0][2] ** 2)
    expect(approx(len, 1)).toBe(true)
  })

  it('3D line nullspace direction is a unit vector', () => {
    const A: Mat3x3 = [[1, 2, 0], [2, 4, 0], [0, 0, 1]]
    const g = deriveNullspaceGeometry(A, [1, 0, 0] as Vec3, false, '3d')
    const dirs = g.nullspaceSubspace.directions!
    const len = Math.sqrt(dirs[0][0] ** 2 + dirs[0][1] ** 2 + dirs[0][2] ** 2)
    expect(approx(len, 1)).toBe(true)
  })
})
