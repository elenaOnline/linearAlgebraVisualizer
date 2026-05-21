import { describe, it, expect } from 'vitest'
import { deriveBasisGeometry } from './geometry'

const EPS = 1e-9

function close(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps
}

describe('deriveBasisGeometry', () => {
  // ── 2D: standard basis ──────────────────────────────────────────────────────

  it('standard basis [1,0],[0,1]: isIndependent=true, doesSpan=true, isBasis=true', () => {
    const g = deriveBasisGeometry([[1, 0], [0, 1]], [2, 1], '2d')
    expect(g.isIndependent).toBe(true)
    expect(g.doesSpan).toBe(true)
    expect(g.isBasis).toBe(true)
    expect(g.reasonIfNot).toBe('')
  })

  it('coordsBasis of [2,1] in standard basis = [2,1]', () => {
    const g = deriveBasisGeometry([[1, 0], [0, 1]], [2, 1], '2d')
    expect(g.coordsBasis).not.toBeNull()
    expect(close(g.coordsBasis![0], 2)).toBe(true)
    expect(close(g.coordsBasis![1], 1)).toBe(true)
  })

  it('coordsStandard of [2,1] is just [2,1]', () => {
    const g = deriveBasisGeometry([[1, 0], [0, 1]], [2, 1], '2d')
    expect(g.coordsStandard[0]).toBeCloseTo(2)
    expect(g.coordsStandard[1]).toBeCloseTo(1)
  })

  // ── 2D: custom basis ────────────────────────────────────────────────────────

  it('custom basis [2,0],[0,3]: coordsBasis of [4,3] = [2,1]', () => {
    const g = deriveBasisGeometry([[2, 0], [0, 3]], [4, 3], '2d')
    expect(g.isBasis).toBe(true)
    expect(g.coordsBasis).not.toBeNull()
    expect(close(g.coordsBasis![0], 2)).toBe(true)
    expect(close(g.coordsBasis![1], 1)).toBe(true)
  })

  // ── 2D: dependent basis ─────────────────────────────────────────────────────

  it('dependent basis [1,0],[2,0]: isBasis=false, reasonIfNot non-empty', () => {
    const g = deriveBasisGeometry([[1, 0], [2, 0]], [2, 1], '2d')
    expect(g.isBasis).toBe(false)
    expect(g.reasonIfNot.length).toBeGreaterThan(0)
    expect(g.coordsBasis).toBeNull()
  })

  it('parallel vectors [1,1],[2,2]: isBasis=false', () => {
    const g = deriveBasisGeometry([[1, 1], [2, 2]], [1, 0], '2d')
    expect(g.isBasis).toBe(false)
    expect(g.isIndependent).toBe(false)
  })

  // ── 3D: standard basis ──────────────────────────────────────────────────────

  it('3D: [1,0,0],[0,1,0],[0,0,1]: isBasis=true', () => {
    const g = deriveBasisGeometry([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3], '3d')
    expect(g.isIndependent).toBe(true)
    expect(g.doesSpan).toBe(true)
    expect(g.isBasis).toBe(true)
  })

  it('3D: coordsBasis of [1,2,3] in standard = [1,2,3]', () => {
    const g = deriveBasisGeometry([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3], '3d')
    expect(g.coordsBasis).not.toBeNull()
    expect(close(g.coordsBasis![0], 1)).toBe(true)
    expect(close(g.coordsBasis![1], 2)).toBe(true)
    expect(close(g.coordsBasis![2], 3)).toBe(true)
  })

  // ── 3D: dependent basis ─────────────────────────────────────────────────────

  it('3D dependent: [1,0,0],[2,0,0],[0,1,0]: isBasis=false', () => {
    const g = deriveBasisGeometry([[1, 0, 0], [2, 0, 0], [0, 1, 0]], [1, 1, 0], '3d')
    expect(g.isBasis).toBe(false)
    expect(g.isIndependent).toBe(false)
    expect(g.reasonIfNot.length).toBeGreaterThan(0)
  })

  // ── Lattice generation ──────────────────────────────────────────────────────

  it('standard basis 2D lattice: i=1,j=0 → [1,0,0]; i=0,j=1 → [0,1,0]', () => {
    const g = deriveBasisGeometry([[1, 0], [0, 1]], [0, 0], '2d')
    expect(g.isBasis).toBe(true)

    const findPt = (x: number, y: number) =>
      g.latticePoints.some(
        (pt) =>
          Math.abs(pt[0] - x) < EPS &&
          Math.abs(pt[1] - y) < EPS &&
          Math.abs(pt[2]) < EPS,
      )

    expect(findPt(1, 0)).toBe(true) // i=1, j=0
    expect(findPt(0, 1)).toBe(true) // i=0, j=1
    expect(findPt(0, 0)).toBe(true) // origin
    expect(findPt(-5, -5)).toBe(true) // extreme corner
  })

  it('standard basis 2D lattice has 121 points (11×11)', () => {
    const g = deriveBasisGeometry([[1, 0], [0, 1]], [0, 0], '2d')
    expect(g.latticePoints.length).toBe(121) // 11 * 11
  })

  it('custom basis [2,0],[0,2] lattice: i=1,j=1 → [2,2,0]', () => {
    const g = deriveBasisGeometry([[2, 0], [0, 2]], [0, 0], '2d')
    const findPt = (x: number, y: number) =>
      g.latticePoints.some(
        (pt) =>
          Math.abs(pt[0] - x) < EPS &&
          Math.abs(pt[1] - y) < EPS,
      )
    expect(findPt(2, 2)).toBe(true)
    expect(findPt(-4, 6)).toBe(true) // i=-2, j=3
  })

  it('dependent basis: lattice is empty', () => {
    const g = deriveBasisGeometry([[1, 0], [2, 0]], [0, 0], '2d')
    expect(g.latticePoints.length).toBe(0)
  })

  // ── Near-singular ────────────────────────────────────────────────────────────

  it('near-singular: [1,0],[1,1e-11] should fail independence test', () => {
    const g = deriveBasisGeometry([[1, 0], [1, 1e-11]], [1, 0], '2d')
    expect(g.isBasis).toBe(false)
    expect(g.isIndependent).toBe(false)
  })

  // ── 3D lattice size ──────────────────────────────────────────────────────────

  it('3D standard basis lattice has 343 points (7×7×7)', () => {
    const g = deriveBasisGeometry(
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      [0, 0, 0],
      '3d',
    )
    expect(g.latticePoints.length).toBe(343) // 7^3
  })
})
