import { describe, it, expect } from 'vitest'
import { deriveDimensionGeometry } from './geometry'
import type { Vec2, Vec3 } from '../../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let idCounter = 0
function mkEntry(vec: Vec2 | Vec3, visible = true) {
  idCounter += 1
  return { id: `t${idCounter}`, vec, visible }
}

function reset() {
  idCounter = 0
}

// ---------------------------------------------------------------------------
// Empty set
// ---------------------------------------------------------------------------
describe('empty vector list', () => {
  it('dimension=0, kind=point', () => {
    reset()
    const g = deriveDimensionGeometry([], '2d')
    expect(g.dimension).toBe(0)
    expect(g.spanSubspace.kind).toBe('point')
    expect(g.numVectors).toBe(0)
    expect(g.vectorStatuses).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Single vector
// ---------------------------------------------------------------------------
describe('single vector [1,0]', () => {
  it('dimension=1, v1 independent', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([1, 0])], '2d')
    expect(g.dimension).toBe(1)
    expect(g.spanSubspace.kind).toBe('line')
    expect(g.vectorStatuses[0].isIndependent).toBe(true)
    expect(g.numVectors).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Parallel vectors
// ---------------------------------------------------------------------------
describe('[1,0] and [2,0] — parallel', () => {
  it('dimension=1, v2 NOT independent', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([1, 0]), mkEntry([2, 0])], '2d')
    expect(g.dimension).toBe(1)
    expect(g.vectorStatuses[0].isIndependent).toBe(true)
    expect(g.vectorStatuses[1].isIndependent).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Independent vectors in R²
// ---------------------------------------------------------------------------
describe('[1,0] and [0,1]', () => {
  it('dimension=2, both independent', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([1, 0]), mkEntry([0, 1])], '2d')
    expect(g.dimension).toBe(2)
    expect(g.spanSubspace.kind).toBe('plane')
    expect(g.vectorStatuses[0].isIndependent).toBe(true)
    expect(g.vectorStatuses[1].isIndependent).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Dependent third vector in R²
// ---------------------------------------------------------------------------
describe('[1,0],[0,1],[1,1] — span already R²', () => {
  it('dimension=2, v3 NOT independent', () => {
    reset()
    const entries = [mkEntry([1, 0] as Vec2), mkEntry([0, 1] as Vec2), mkEntry([1, 1] as Vec2)]
    const g = deriveDimensionGeometry(entries, '2d')
    expect(g.dimension).toBe(2)
    expect(g.vectorStatuses[0].isIndependent).toBe(true)
    expect(g.vectorStatuses[1].isIndependent).toBe(true)
    expect(g.vectorStatuses[2].isIndependent).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// R³ basis
// ---------------------------------------------------------------------------
describe('[1,0,0],[0,1,0],[0,0,1] in 3D', () => {
  it('dimension=3, all independent', () => {
    reset()
    const entries = [
      mkEntry([1, 0, 0] as Vec3),
      mkEntry([0, 1, 0] as Vec3),
      mkEntry([0, 0, 1] as Vec3),
    ]
    const g = deriveDimensionGeometry(entries, '3d')
    expect(g.dimension).toBe(3)
    expect(g.spanSubspace.kind).toBe('space')
    expect(g.vectorStatuses[0].isIndependent).toBe(true)
    expect(g.vectorStatuses[1].isIndependent).toBe(true)
    expect(g.vectorStatuses[2].isIndependent).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Fourth dependent vector in R³
// ---------------------------------------------------------------------------
describe('[1,0,0],[0,1,0],[0,0,1],[1,1,1] — fourth is dependent', () => {
  it('dimension=3, fourth NOT independent', () => {
    reset()
    const entries = [
      mkEntry([1, 0, 0] as Vec3),
      mkEntry([0, 1, 0] as Vec3),
      mkEntry([0, 0, 1] as Vec3),
      mkEntry([1, 1, 1] as Vec3),
    ]
    const g = deriveDimensionGeometry(entries, '3d')
    expect(g.dimension).toBe(3)
    expect(g.vectorStatuses[3].isIndependent).toBe(false)
    expect(g.maxDimension).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Invisible vectors excluded from dimension
// ---------------------------------------------------------------------------
describe('invisible vectors excluded', () => {
  it('[1,0] visible + [0,1] invisible → dimension=1', () => {
    reset()
    const entries = [mkEntry([1, 0] as Vec2, true), mkEntry([0, 1] as Vec2, false)]
    const g = deriveDimensionGeometry(entries, '2d')
    expect(g.dimension).toBe(1)
    expect(g.numVectors).toBe(1)
    // invisible vector has isIndependent=false
    const invisible = g.vectorStatuses.find((s) => s.id === entries[1].id)
    expect(invisible?.isIndependent).toBe(false)
  })

  it('all invisible → dimension=0', () => {
    reset()
    const entries = [mkEntry([1, 0] as Vec2, false), mkEntry([0, 1] as Vec2, false)]
    const g = deriveDimensionGeometry(entries, '2d')
    expect(g.dimension).toBe(0)
    expect(g.numVectors).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// maxDimension cap
// ---------------------------------------------------------------------------
describe('maxDimension', () => {
  it('maxDimension=2 for 2d', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([1, 0] as Vec2)], '2d')
    expect(g.maxDimension).toBe(2)
  })

  it('maxDimension=3 for 3d', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([1, 0, 0] as Vec3)], '3d')
    expect(g.maxDimension).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Zero vector
// ---------------------------------------------------------------------------
describe('zero vector', () => {
  it('[0,0] alone → dimension=0, NOT independent', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([0, 0] as Vec2)], '2d')
    expect(g.dimension).toBe(0)
    expect(g.vectorStatuses[0].isIndependent).toBe(false)
    expect(g.spanSubspace.kind).toBe('point')
  })

  it('[0,0] then [1,0] → dimension=1, first NOT independent, second IS', () => {
    reset()
    const g = deriveDimensionGeometry(
      [mkEntry([0, 0] as Vec2), mkEntry([1, 0] as Vec2)],
      '2d',
    )
    expect(g.dimension).toBe(1)
    expect(g.vectorStatuses[0].isIndependent).toBe(false)
    expect(g.vectorStatuses[1].isIndependent).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Span directions
// ---------------------------------------------------------------------------
describe('span directions', () => {
  it('dimension=1 → one direction', () => {
    reset()
    const g = deriveDimensionGeometry([mkEntry([3, 0] as Vec2)], '2d')
    expect(g.spanDirections).toHaveLength(1)
    // Should be normalized
    const [x, y, z] = g.spanDirections[0]
    const len = Math.sqrt(x * x + y * y + z * z)
    expect(len).toBeCloseTo(1, 9)
  })

  it('dimension=2 → two directions', () => {
    reset()
    const g = deriveDimensionGeometry(
      [mkEntry([1, 0] as Vec2), mkEntry([0, 1] as Vec2)],
      '2d',
    )
    expect(g.spanDirections).toHaveLength(2)
  })
})
