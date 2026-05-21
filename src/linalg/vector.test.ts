import { describe, it, expect } from 'vitest'
import {
  add,
  sub,
  scale,
  dot,
  cross,
  norm,
  normalize,
  lerp,
  isZero,
  toVec3,
  EPS,
} from './vector'
import type { Vec2, Vec3 } from '../types'

const v: Vec3 = [1, 2, 3]
const w: Vec3 = [4, 5, 6]
const zero3: Vec3 = [0, 0, 0]

describe('add', () => {
  it('adds two vectors', () => {
    expect(add(v, w)).toEqual([5, 7, 9])
  })
  it('adding zero yields same vector', () => {
    expect(add(v, zero3)).toEqual(v)
  })
  it('is commutative', () => {
    expect(add(v, w)).toEqual(add(w, v))
  })
})

describe('sub', () => {
  it('subtracts two vectors', () => {
    expect(sub(w, v)).toEqual([3, 3, 3])
  })
  it('v - v = 0', () => {
    expect(sub(v, v)).toEqual(zero3)
  })
})

describe('scale', () => {
  it('scales a vector', () => {
    expect(scale(v, 2)).toEqual([2, 4, 6])
  })
  it('scale by 0 gives zero vector', () => {
    expect(scale(v, 0)).toEqual(zero3)
  })
  it('scale by -1 negates', () => {
    expect(scale([1, -2, 3], -1)).toEqual([-1, 2, -3])
  })
})

describe('dot', () => {
  it('computes dot product', () => {
    expect(dot(v, w)).toBe(1 * 4 + 2 * 5 + 3 * 6) // 32
  })
  it('dot with zero is 0', () => {
    expect(dot(v, zero3)).toBe(0)
  })
  it('dot is commutative', () => {
    expect(dot(v, w)).toBe(dot(w, v))
  })
  it('orthogonal vectors have dot 0', () => {
    expect(dot([1, 0, 0], [0, 1, 0])).toBe(0)
  })
})

describe('cross', () => {
  it('e1 × e2 = e3', () => {
    const e1: Vec3 = [1, 0, 0]
    const e2: Vec3 = [0, 1, 0]
    expect(cross(e1, e2)).toEqual([0, 0, 1])
  })
  it('e2 × e1 = -e3', () => {
    const e1: Vec3 = [1, 0, 0]
    const e2: Vec3 = [0, 1, 0]
    expect(cross(e2, e1)).toEqual([0, 0, -1])
  })
  it('cross of parallel vectors is zero', () => {
    const a: Vec3 = [1, 2, 3]
    const b: Vec3 = [2, 4, 6]
    const c = cross(a, b)
    expect(Math.abs(c[0])).toBeLessThan(1e-12)
    expect(Math.abs(c[1])).toBeLessThan(1e-12)
    expect(Math.abs(c[2])).toBeLessThan(1e-12)
  })
  it('cross with zero is zero', () => {
    expect(cross(v, zero3)).toEqual(zero3)
  })
  it('cross product is perpendicular to both inputs', () => {
    const c = cross(v, w)
    expect(Math.abs(dot(c, v))).toBeLessThan(1e-10)
    expect(Math.abs(dot(c, w))).toBeLessThan(1e-10)
  })
})

describe('norm', () => {
  it('norm of standard basis vector is 1', () => {
    expect(norm([1, 0, 0])).toBe(1)
  })
  it('norm of zero is 0', () => {
    expect(norm(zero3)).toBe(0)
  })
  it('norm of [3,4,0] is 5', () => {
    expect(norm([3, 4, 0])).toBeCloseTo(5)
  })
  it('norm satisfies pythagorean triple [1,1,1]', () => {
    expect(norm([1, 1, 1])).toBeCloseTo(Math.sqrt(3))
  })
})

describe('normalize', () => {
  it('unit vector stays unit', () => {
    expect(normalize([1, 0, 0])).toEqual([1, 0, 0])
  })
  it('norm of normalized is 1 (non-zero input)', () => {
    expect(norm(normalize(v))).toBeCloseTo(1)
  })
  it('normalize of zero returns zero (safe)', () => {
    expect(normalize(zero3)).toEqual(zero3)
  })
  it('direction is preserved', () => {
    const n = normalize([3, 0, 0])
    expect(n).toEqual([1, 0, 0])
  })
})

describe('lerp', () => {
  it('t=0 returns a', () => {
    expect(lerp(v, w, 0)).toEqual(v)
  })
  it('t=1 returns b', () => {
    expect(lerp(v, w, 1)).toEqual(w)
  })
  it('t=0.5 is midpoint', () => {
    const mid = lerp([0, 0, 0], [2, 4, 6], 0.5)
    expect(mid).toEqual([1, 2, 3])
  })
})

describe('isZero', () => {
  it('zero vector is zero', () => {
    expect(isZero(zero3)).toBe(true)
  })
  it('non-zero vector is not zero', () => {
    expect(isZero(v)).toBe(false)
  })
  it('near-zero vector is zero within EPS', () => {
    const tiny: Vec3 = [EPS * 0.5, 0, 0]
    expect(isZero(tiny)).toBe(true)
  })
  it('near-zero vector is not zero just above EPS', () => {
    const tiny: Vec3 = [EPS * 2, 0, 0]
    expect(isZero(tiny)).toBe(false)
  })
  it('works for Vec2', () => {
    const u: Vec2 = [0, 0]
    expect(isZero(u)).toBe(true)
  })
})

describe('toVec3', () => {
  it('pads Vec2 with z=0', () => {
    const u: Vec2 = [1, 2]
    expect(toVec3(u)).toEqual([1, 2, 0])
  })
  it('Vec3 passes through', () => {
    expect(toVec3(v)).toBe(v)
  })
})
