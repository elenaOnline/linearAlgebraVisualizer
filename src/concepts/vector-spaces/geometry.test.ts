import { describe, it, expect } from 'vitest'
import { deriveVectorSpacesGeometry } from './geometry'
import type { Vec2, Vec3 } from '../../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const v2 = (x: number, y: number): Vec2 => [x, y]
const v3 = (x: number, y: number, z: number): Vec3 => [x, y, z]

// ---------------------------------------------------------------------------
// Zero subspace
// ---------------------------------------------------------------------------
describe('zero subspace', () => {
  it('containsZero = true always', () => {
    const g = deriveVectorSpacesGeometry('zero', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(0, 0), v2(0, 0), 2)
    expect(g.conditions.containsZero).toBe(true)
  })

  it('closed under addition when a=b=[0,0]', () => {
    const g = deriveVectorSpacesGeometry('zero', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(0, 0), v2(0, 0), 2)
    expect(g.conditions.closedUnderAddition).toBe(true)
    expect(g.conditions.isSubspace).toBe(true)
  })

  it('NOT closed when a=[1,0]', () => {
    const g = deriveVectorSpacesGeometry('zero', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(1, 0), v2(0, 0), 2)
    expect(g.conditions.closedUnderScalarMult).toBe(false)
    expect(g.conditions.isSubspace).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Line through origin
// ---------------------------------------------------------------------------
describe('line through origin', () => {
  it('addition closed: a=[2,0], b=[3,0], dir=[1,0]', () => {
    const g = deriveVectorSpacesGeometry('line', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(2, 0), v2(3, 0), 1)
    expect(g.conditions.containsZero).toBe(true)
    expect(g.conditions.closedUnderAddition).toBe(true)
    expect(g.conditions.closedUnderScalarMult).toBe(true)
    expect(g.conditions.isSubspace).toBe(true)
  })

  it('addition NOT closed: a=[1,0], b=[0,1], dir=[1,0]', () => {
    const g = deriveVectorSpacesGeometry('line', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(1, 0), v2(0, 1), 1)
    expect(g.conditions.containsZero).toBe(true)
    expect(g.conditions.closedUnderAddition).toBe(false)
    expect(g.conditions.isSubspace).toBe(false)
  })

  it('scalar mult closed: a=[3,0], c=2, dir=[1,0] → c*a=[6,0] in line', () => {
    const g = deriveVectorSpacesGeometry('line', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(3, 0), v2(0, 0), 2)
    expect(g.conditions.closedUnderScalarMult).toBe(true)
  })

  it('scalar mult NOT closed: a=[1,1], c=1, dir=[1,0] → c*a=[1,1] not in line', () => {
    const g = deriveVectorSpacesGeometry('line', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(1, 1), v2(0, 0), 1)
    expect(g.conditions.closedUnderScalarMult).toBe(false)
  })

  it('a=[0,0], b=[0,0] always in line — trivially closed', () => {
    const g = deriveVectorSpacesGeometry('line', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(0, 0), v2(0, 0), 2)
    expect(g.conditions.isSubspace).toBe(true)
  })

  it('3D line through origin', () => {
    const g = deriveVectorSpacesGeometry('line', v3(1, 0, 0), v3(1, 0, 0), v3(0, 1, 0), 0, v3(2, 0, 0), v3(-1, 0, 0), 3)
    expect(g.conditions.isSubspace).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Plane through origin (3D)
// ---------------------------------------------------------------------------
describe('plane through origin', () => {
  it('a=[1,0,0], b=[0,1,0] both in xy-plane → a+b in xy-plane', () => {
    const g = deriveVectorSpacesGeometry(
      'plane',
      v3(1, 0, 0),
      v3(1, 0, 0),
      v3(0, 1, 0),
      0,
      v3(1, 0, 0),
      v3(0, 1, 0),
      2,
    )
    expect(g.conditions.containsZero).toBe(true)
    expect(g.conditions.closedUnderAddition).toBe(true)
    expect(g.conditions.closedUnderScalarMult).toBe(true)
    expect(g.conditions.isSubspace).toBe(true)
  })

  it('a=[0,0,1] not in xy-plane → closed fails', () => {
    const g = deriveVectorSpacesGeometry(
      'plane',
      v3(1, 0, 0),
      v3(1, 0, 0),
      v3(0, 1, 0),
      0,
      v3(0, 0, 1),
      v3(0, 0, 0),
      1,
    )
    expect(g.conditions.closedUnderScalarMult).toBe(false)
    expect(g.conditions.isSubspace).toBe(false)
  })

  it('containsZero is always true for plane through origin', () => {
    const g = deriveVectorSpacesGeometry(
      'plane',
      v3(1, 0, 0),
      v3(1, 2, 0),
      v3(0, 1, 3),
      0,
      v3(0, 0, 0),
      v3(0, 0, 0),
      1,
    )
    expect(g.conditions.containsZero).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Whole space
// ---------------------------------------------------------------------------
describe('whole space', () => {
  it('always passes all conditions', () => {
    const g = deriveVectorSpacesGeometry('whole-space', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(3, 7), v2(-2, 5), 1.5)
    expect(g.conditions.containsZero).toBe(true)
    expect(g.conditions.closedUnderAddition).toBe(true)
    expect(g.conditions.closedUnderScalarMult).toBe(true)
    expect(g.conditions.isSubspace).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Offset line (non-example)
// ---------------------------------------------------------------------------
describe('offset line (non-example)', () => {
  it('offset=1 → containsZero=false → isSubspace=false', () => {
    const g = deriveVectorSpacesGeometry(
      'offset-line',
      v2(1, 0),
      v2(1, 0),
      v2(0, 1),
      1,
      v2(1, 0),
      v2(0, 0),
      1,
    )
    expect(g.conditions.containsZero).toBe(false)
    expect(g.conditions.isSubspace).toBe(false)
    expect(g.offsetPoint).not.toBeNull()
  })

  it('offset=0 → the "offset line" IS through origin → containsZero=true', () => {
    // When offset=0 the offsetPoint is [0,0,0] and -offsetPoint = [0,0,0] IS in span
    const g = deriveVectorSpacesGeometry(
      'offset-line',
      v2(1, 0),
      v2(1, 0),
      v2(0, 1),
      0,
      v2(1, 0),
      v2(1, 0),
      2,
    )
    // offsetPoint should be zero vector, so containsZero = true
    expect(g.conditions.containsZero).toBe(true)
  })

  it('genuinely fails: a=[0,0] is NOT on the offset line when offset=1', () => {
    // The zero vector is the origin. For an offset line through (0,1) in direction (1,0),
    // the origin does not lie on it.
    const g = deriveVectorSpacesGeometry(
      'offset-line',
      v2(1, 0),
      v2(1, 0),
      v2(0, 1),
      1,
      v2(0, 0),
      v2(0, 0),
      0,
    )
    expect(g.conditions.containsZero).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Offset plane (non-example, 3D)
// ---------------------------------------------------------------------------
describe('offset plane (non-example)', () => {
  it('offset=1 → containsZero=false → isSubspace=false', () => {
    const g = deriveVectorSpacesGeometry(
      'offset-plane',
      v3(1, 0, 0),
      v3(1, 0, 0),
      v3(0, 1, 0),
      1,
      v3(1, 0, 0),
      v3(0, 1, 0),
      1,
    )
    expect(g.conditions.containsZero).toBe(false)
    expect(g.conditions.isSubspace).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Derived geometry values
// ---------------------------------------------------------------------------
describe('derived vectors', () => {
  it('aPlus_b is a+b', () => {
    const g = deriveVectorSpacesGeometry('whole-space', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(1, 2), v2(3, 4), 2)
    expect(g.aPlus_b).toEqual([4, 6, 0])
  })

  it('cTimesA is c*a', () => {
    const g = deriveVectorSpacesGeometry('whole-space', v2(1, 0), v2(1, 0), v2(0, 1), 0, v2(2, 3), v2(0, 0), 3)
    expect(g.cTimesA).toEqual([6, 9, 0])
  })
})
