import { describe, it, expect } from 'vitest'
import { deriveSpanGeometry } from './geometry'

describe('deriveSpanGeometry', () => {
  // -----------------------------------------------------------------------
  // Dimension / kind tests
  // -----------------------------------------------------------------------

  it('two parallel vectors [1,0],[2,0] → dimension=1, kind=line', () => {
    const g = deriveSpanGeometry([[1, 0], [2, 0]], 1, 1, 1, [0, 0], '2d')
    expect(g.dimension).toBe(1)
    expect(g.spanSubspace.kind).toBe('line')
  })

  it('two independent vectors [1,0],[0,1] in 2D → dimension=2, kind=plane', () => {
    const g = deriveSpanGeometry([[1, 0], [0, 1]], 1, 1, 1, [0, 0], '2d')
    expect(g.dimension).toBe(2)
    expect(g.spanSubspace.kind).toBe('plane')
  })

  it('three independent vectors in 3D → dimension=3, kind=space', () => {
    const g = deriveSpanGeometry(
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      1, 1, 1,
      [0, 0, 0],
      '3d',
    )
    expect(g.dimension).toBe(3)
    expect(g.spanSubspace.kind).toBe('space')
  })

  it('all zero vectors → dimension=0, kind=point', () => {
    const g = deriveSpanGeometry([[0, 0], [0, 0]], 1, 1, 1, [0, 0], '2d')
    expect(g.dimension).toBe(0)
    expect(g.spanSubspace.kind).toBe('point')
  })

  it('single zero vector → dimension=0, kind=point', () => {
    const g = deriveSpanGeometry([[0, 0]], 1, 0, 0, [0, 0], '2d')
    expect(g.dimension).toBe(0)
    expect(g.spanSubspace.kind).toBe('point')
  })

  it('single non-zero vector → dimension=1, kind=line', () => {
    const g = deriveSpanGeometry([[3, 4]], 1, 0, 0, [0, 0], '2d')
    expect(g.dimension).toBe(1)
    expect(g.spanSubspace.kind).toBe('line')
  })

  it('two independent vectors in 3D → dimension=2, kind=plane', () => {
    const g = deriveSpanGeometry(
      [[1, 0, 0], [0, 1, 0]],
      1, 1, 1,
      [0, 0, 0],
      '3d',
    )
    expect(g.dimension).toBe(2)
    expect(g.spanSubspace.kind).toBe('plane')
    expect(g.spanSubspace.directions).toHaveLength(2)
  })

  // -----------------------------------------------------------------------
  // Combination point tests
  // -----------------------------------------------------------------------

  it('combinationPoint: c1=2, v1=[1,0], c2=3, v2=[0,1] → [2,3,0]', () => {
    const g = deriveSpanGeometry([[1, 0], [0, 1]], 2, 3, 0, [0, 0], '2d')
    expect(g.combinationPoint[0]).toBeCloseTo(2)
    expect(g.combinationPoint[1]).toBeCloseTo(3)
    expect(g.combinationPoint[2]).toBeCloseTo(0)
  })

  it('combinationPoint: c1=1, c2=1, c3=1 on standard basis in 3D', () => {
    const g = deriveSpanGeometry(
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      1, 1, 1,
      [0, 0, 0],
      '3d',
    )
    expect(g.combinationPoint[0]).toBeCloseTo(1)
    expect(g.combinationPoint[1]).toBeCloseTo(1)
    expect(g.combinationPoint[2]).toBeCloseTo(1)
  })

  it('combinationPoint: negative coefficients', () => {
    const g = deriveSpanGeometry([[2, 0], [0, 3]], -1, -2, 0, [0, 0], '2d')
    expect(g.combinationPoint[0]).toBeCloseTo(-2)
    expect(g.combinationPoint[1]).toBeCloseTo(-6)
    expect(g.combinationPoint[2]).toBeCloseTo(0)
  })

  // -----------------------------------------------------------------------
  // isInSpan tests
  // -----------------------------------------------------------------------

  it('[3,0] is in span of [1,0] → true', () => {
    const g = deriveSpanGeometry([[1, 0]], 1, 0, 0, [3, 0], '2d')
    expect(g.isProbeInSpan).toBe(true)
  })

  it('[0,1] is NOT in span of [1,0] → false', () => {
    const g = deriveSpanGeometry([[1, 0]], 1, 0, 0, [0, 1], '2d')
    expect(g.isProbeInSpan).toBe(false)
  })

  it('[1,1] is in span of [1,0],[0,1] → true', () => {
    const g = deriveSpanGeometry([[1, 0], [0, 1]], 1, 1, 1, [1, 1], '2d')
    expect(g.isProbeInSpan).toBe(true)
  })

  it('[0,0] is in span of anything (zero is always in span)', () => {
    const g = deriveSpanGeometry([[1, 0]], 1, 0, 0, [0, 0], '2d')
    expect(g.isProbeInSpan).toBe(true)
  })

  it('[0,0,1] is NOT in span of [1,0,0],[0,1,0] in 3D → false', () => {
    const g = deriveSpanGeometry(
      [[1, 0, 0], [0, 1, 0]],
      1, 1, 1,
      [0, 0, 1],
      '3d',
    )
    expect(g.isProbeInSpan).toBe(false)
  })

  it('[1,0,0] is in span of [1,0,0],[0,1,0] in 3D → true', () => {
    const g = deriveSpanGeometry(
      [[1, 0, 0], [0, 1, 0]],
      1, 1, 1,
      [1, 0, 0],
      '3d',
    )
    expect(g.isProbeInSpan).toBe(true)
  })

  // -----------------------------------------------------------------------
  // Near-degenerate / EPS handling
  // -----------------------------------------------------------------------

  it('near-degenerate [1,0],[1,1e-10] in 2D → collapses to dimension=1', () => {
    const g = deriveSpanGeometry([[1, 0], [1, 1e-10]], 1, 1, 1, [0, 0], '2d')
    expect(g.dimension).toBe(1)
    expect(g.spanSubspace.kind).toBe('line')
  })

  // -----------------------------------------------------------------------
  // vectors3 output
  // -----------------------------------------------------------------------

  it('vectors3 pads 2D vecs with z=0', () => {
    const g = deriveSpanGeometry([[3, 4]], 1, 0, 0, [0, 0], '2d')
    expect(g.vectors3[0]).toEqual([3, 4, 0])
  })

  it('vectors3 passes 3D vecs through', () => {
    const g = deriveSpanGeometry([[1, 2, 3]], 1, 0, 0, [0, 0, 0], '3d')
    expect(g.vectors3[0]).toEqual([1, 2, 3])
  })

  // -----------------------------------------------------------------------
  // Plane directions are normalized
  // -----------------------------------------------------------------------

  it('plane directions are unit vectors', () => {
    const g = deriveSpanGeometry([[3, 0], [0, 4]], 1, 1, 0, [0, 0], '2d')
    expect(g.spanSubspace.kind).toBe('plane')
    const dirs = g.spanSubspace.directions!
    const len0 = Math.sqrt(dirs[0][0] ** 2 + dirs[0][1] ** 2 + dirs[0][2] ** 2)
    const len1 = Math.sqrt(dirs[1][0] ** 2 + dirs[1][1] ** 2 + dirs[1][2] ** 2)
    expect(len0).toBeCloseTo(1)
    expect(len1).toBeCloseTo(1)
  })
})
