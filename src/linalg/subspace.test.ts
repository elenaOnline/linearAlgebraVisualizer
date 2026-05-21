import { describe, it, expect } from 'vitest'
import {
  rref,
  rank,
  nullspaceBasis,
  spanDimension,
  isLinearlyIndependent,
  isInSpan,
  changeOfBasis,
  EPS,
} from './subspace'

// ---------------------------------------------------------------------------
// RREF
// ---------------------------------------------------------------------------
describe('rref', () => {
  it('identity matrix stays identity', () => {
    const I = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]
    const R = rref(I)
    expect(R).toEqual(I)
  })

  it('upper triangular 2×2 reduces to identity', () => {
    const A = [
      [2, 4],
      [0, 3],
    ]
    const R = rref(A)
    expect(R[0][0]).toBeCloseTo(1)
    expect(R[0][1]).toBeCloseTo(0)
    expect(R[1][0]).toBeCloseTo(0)
    expect(R[1][1]).toBeCloseTo(1)
  })

  it('rank-deficient 2×3', () => {
    // rows are scalar multiples → one non-zero row in RREF
    const A = [
      [1, 2, 3],
      [2, 4, 6],
    ]
    const R = rref(A)
    expect(R[0]).toEqual([1, 2, 3])
    expect(R[1].every((v) => Math.abs(v) < 1e-10)).toBe(true)
  })

  it('zero matrix produces zero RREF', () => {
    const Z = [
      [0, 0],
      [0, 0],
    ]
    const R = rref(Z)
    expect(R).toEqual(Z)
  })

  it('3×4 augmented-matrix style', () => {
    // System: x + 2y = 5, 2x + y = 4, ... check leading 1s
    const A = [
      [1, 2, 5],
      [2, 1, 4],
    ]
    const R = rref(A)
    // x = 1, y = 2
    expect(R[0][0]).toBeCloseTo(1)
    expect(R[0][1]).toBeCloseTo(0)
    expect(R[0][2]).toBeCloseTo(1)
    expect(R[1][0]).toBeCloseTo(0)
    expect(R[1][1]).toBeCloseTo(1)
    expect(R[1][2]).toBeCloseTo(2)
  })

  it('empty matrix returns empty', () => {
    expect(rref([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// rank
// ---------------------------------------------------------------------------
describe('rank', () => {
  it('rank of identity 3×3 is 3', () => {
    expect(rank([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(3)
  })

  it('rank of zero matrix is 0', () => {
    expect(rank([[0, 0], [0, 0]])).toBe(0)
  })

  it('rank 1: all rows multiples', () => {
    expect(rank([[1, 2, 3], [2, 4, 6], [3, 6, 9]])).toBe(1)
  })

  it('rank of 2×3 full-row-rank is 2', () => {
    expect(rank([[1, 0, 2], [0, 1, 3]])).toBe(2)
  })

  it('rank of empty is 0', () => {
    expect(rank([])).toBe(0)
  })

  it('rank 2 for linearly dependent 3×3', () => {
    // third row is sum of first two
    expect(rank([[1, 0, 0], [0, 1, 0], [1, 1, 0]])).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// nullspaceBasis
// ---------------------------------------------------------------------------
describe('nullspaceBasis', () => {
  it('trivial nullspace for invertible 2×2', () => {
    const A = [[1, 0], [0, 1]]
    const ns = nullspaceBasis(A)
    expect(ns).toHaveLength(0)
  })

  it('trivial nullspace for invertible 3×3', () => {
    const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    expect(nullspaceBasis(I)).toHaveLength(0)
  })

  it('1D nullspace for rank-1 2×2', () => {
    const A = [[1, 2], [2, 4]]
    const ns = nullspaceBasis(A)
    expect(ns).toHaveLength(1)
    // Verify Ax = 0 for each basis vector
    const x = ns[0]
    expect(A[0][0] * x[0] + A[0][1] * x[1]).toBeCloseTo(0)
    expect(A[1][0] * x[0] + A[1][1] * x[1]).toBeCloseTo(0)
  })

  it('1D nullspace for rank-2 3×3', () => {
    // Rank 2 → nullity 1
    const A = [[1, 0, -1], [0, 1, -2], [0, 0, 0]]
    const ns = nullspaceBasis(A)
    expect(ns).toHaveLength(1)
    const x = ns[0]
    // Ax = 0
    expect(A[0][0] * x[0] + A[0][1] * x[1] + A[0][2] * x[2]).toBeCloseTo(0)
    expect(A[1][0] * x[0] + A[1][1] * x[1] + A[1][2] * x[2]).toBeCloseTo(0)
  })

  it('2D nullspace for zero 3×3', () => {
    const Z = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    const ns = nullspaceBasis(Z)
    expect(ns).toHaveLength(3)
  })

  it('2D nullspace for rank-1 3×3', () => {
    const A = [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
    const ns = nullspaceBasis(A)
    expect(ns).toHaveLength(2)
    // Each basis vector should satisfy Ax = 0
    for (const x of ns) {
      for (let i = 0; i < 3; i++) {
        const dot = A[i][0] * x[0] + A[i][1] * x[1] + A[i][2] * x[2]
        expect(Math.abs(dot)).toBeLessThan(1e-8)
      }
    }
  })

  it('empty matrix returns empty', () => {
    expect(nullspaceBasis([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// spanDimension
// ---------------------------------------------------------------------------
describe('spanDimension', () => {
  it('empty set spans dimension 0', () => {
    expect(spanDimension([])).toBe(0)
  })

  it('zero vector alone spans dimension 0', () => {
    expect(spanDimension([[0, 0, 0]])).toBe(0)
  })

  it('single non-zero vector spans dimension 1', () => {
    expect(spanDimension([[1, 2, 3]])).toBe(1)
  })

  it('two independent vectors span dimension 2', () => {
    expect(spanDimension([[1, 0, 0], [0, 1, 0]])).toBe(2)
  })

  it('two parallel vectors span dimension 1', () => {
    expect(spanDimension([[1, 2, 3], [2, 4, 6]])).toBe(1)
  })

  it('three independent vectors span dimension 3', () => {
    expect(spanDimension([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(3)
  })

  it('four vectors cannot span more than 3D (in R³)', () => {
    expect(spanDimension([[1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]])).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// isLinearlyIndependent
// ---------------------------------------------------------------------------
describe('isLinearlyIndependent', () => {
  it('empty set is independent', () => {
    expect(isLinearlyIndependent([])).toBe(true)
  })

  it('single non-zero vector is independent', () => {
    expect(isLinearlyIndependent([[1, 0, 0]])).toBe(true)
  })

  it('single zero vector is NOT independent', () => {
    expect(isLinearlyIndependent([[0, 0, 0]])).toBe(false)
  })

  it('two orthogonal vectors are independent', () => {
    expect(isLinearlyIndependent([[1, 0, 0], [0, 1, 0]])).toBe(true)
  })

  it('two parallel vectors are NOT independent', () => {
    expect(isLinearlyIndependent([[1, 2, 3], [2, 4, 6]])).toBe(false)
  })

  it('three standard basis vectors are independent', () => {
    expect(isLinearlyIndependent([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true)
  })

  it('three vectors with third = sum of first two are NOT independent', () => {
    expect(isLinearlyIndependent([[1, 0, 0], [0, 1, 0], [1, 1, 0]])).toBe(false)
  })

  it('near-zero vector is treated as dependent via EPS', () => {
    const tiny = EPS * 0.1
    expect(isLinearlyIndependent([[tiny, tiny, tiny]])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isInSpan
// ---------------------------------------------------------------------------
describe('isInSpan', () => {
  it('zero vector is in span of empty set', () => {
    expect(isInSpan([0, 0, 0], [])).toBe(true)
  })

  it('non-zero vector is NOT in span of empty set', () => {
    expect(isInSpan([1, 0, 0], [])).toBe(false)
  })

  it('vector is in its own span', () => {
    expect(isInSpan([1, 2, 3], [[1, 2, 3]])).toBe(true)
  })

  it('scalar multiple is in span', () => {
    expect(isInSpan([2, 4, 6], [[1, 2, 3]])).toBe(true)
  })

  it('vector NOT in span of one independent vector', () => {
    expect(isInSpan([0, 1, 0], [[1, 0, 0]])).toBe(false)
  })

  it('linear combination is in span', () => {
    // [3,4,0] = 3*[1,0,0] + 4*[0,1,0]
    expect(isInSpan([3, 4, 0], [[1, 0, 0], [0, 1, 0]])).toBe(true)
  })

  it('out-of-plane vector is NOT in span of xy-plane basis', () => {
    expect(isInSpan([0, 0, 1], [[1, 0, 0], [0, 1, 0]])).toBe(false)
  })

  it('zero vector is in span of non-zero vectors', () => {
    expect(isInSpan([0, 0, 0], [[1, 2, 3]])).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// changeOfBasis
// ---------------------------------------------------------------------------
describe('changeOfBasis', () => {
  it('standard basis: coordinates equal components (2D)', () => {
    const p = [3, 5]
    const e1 = [1, 0]
    const e2 = [0, 1]
    const coords = changeOfBasis(p, [e1, e2])
    expect(coords[0]).toBeCloseTo(3)
    expect(coords[1]).toBeCloseTo(5)
  })

  it('standard basis: coordinates equal components (3D)', () => {
    const p = [1, 2, 3]
    const e1 = [1, 0, 0]
    const e2 = [0, 1, 0]
    const e3 = [0, 0, 1]
    const coords = changeOfBasis(p, [e1, e2, e3])
    expect(coords[0]).toBeCloseTo(1)
    expect(coords[1]).toBeCloseTo(2)
    expect(coords[2]).toBeCloseTo(3)
  })

  it('custom 2D basis', () => {
    // basis: b1=[2,0], b2=[0,3]
    // p=[4,6] should be [2,2] in this basis
    const p = [4, 6]
    const b1 = [2, 0]
    const b2 = [0, 3]
    const coords = changeOfBasis(p, [b1, b2])
    expect(coords[0]).toBeCloseTo(2)
    expect(coords[1]).toBeCloseTo(2)
  })

  it('rotated 2D basis at 45 degrees', () => {
    const inv2 = 1 / Math.sqrt(2)
    const b1 = [inv2, inv2]
    const b2 = [-inv2, inv2]
    // p = b1 direction = [inv2, inv2], should be [1,0] in this basis
    const coords = changeOfBasis([inv2, inv2], [b1, b2])
    expect(coords[0]).toBeCloseTo(1)
    expect(coords[1]).toBeCloseTo(0)
  })

  it('custom 3D basis', () => {
    // Permutation basis: b1=[0,1,0], b2=[0,0,1], b3=[1,0,0]
    // p=[1,0,0] should be [0,0,1] in this basis
    const b1 = [0, 1, 0]
    const b2 = [0, 0, 1]
    const b3 = [1, 0, 0]
    const coords = changeOfBasis([1, 0, 0], [b1, b2, b3])
    expect(coords[0]).toBeCloseTo(0)
    expect(coords[1]).toBeCloseTo(0)
    expect(coords[2]).toBeCloseTo(1)
  })

  it('throws on non-square basis', () => {
    expect(() => changeOfBasis([1, 2], [[1, 0, 0]])).toThrow()
  })
})

// ---------------------------------------------------------------------------
// Degenerate / EPS boundary cases
// ---------------------------------------------------------------------------
describe('EPS boundary cases', () => {
  it('nearly-zero row treated as zero in rank', () => {
    const A = [
      [1, 0],
      [0, EPS * 0.1], // effectively zero
    ]
    expect(rank(A)).toBe(1)
  })

  it('value just above EPS creates pivot', () => {
    const A = [
      [1, 0],
      [0, EPS * 10], // above threshold
    ]
    expect(rank(A)).toBe(2)
  })

  it('dependent vectors near EPS boundary are caught', () => {
    // Three vectors where the third is the sum of the first two plus a tiny perturbation
    const v1 = [1, 0, 0]
    const v2 = [0, 1, 0]
    const v3 = [1, 1, EPS * 0.1] // near-zero z component
    expect(spanDimension([v1, v2, v3])).toBe(2)
  })
})
