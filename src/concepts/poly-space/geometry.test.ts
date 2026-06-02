import { describe, it, expect } from 'vitest'
import { computePolySpaceGeo } from './geometry'
import { EPS } from '../../linalg/vector'

describe('computePolySpaceGeo', () => {
  it('zero polynomial: a0=a1=a2=0 → isZero=true, all graphPoints y=0', () => {
    const geo = computePolySpaceGeo('p2', 0, 0, 0)
    expect(geo.isZero).toBe(true)
    for (const [, y] of geo.graphPoints) {
      expect(Math.abs(y)).toBeLessThan(EPS)
    }
  })

  it('constant polynomial: a0=3, a1=0, a2=0 → a2IsZero=true, a1IsZero=true, all y=3', () => {
    const geo = computePolySpaceGeo('p2', 3, 0, 0)
    expect(geo.a2IsZero).toBe(true)
    expect(geo.a1IsZero).toBe(true)
    expect(geo.isZero).toBe(false)
    for (const [, y] of geo.graphPoints) {
      expect(Math.abs(y - 3)).toBeLessThan(EPS)
    }
  })

  it('linear polynomial: a0=0, a1=1, a2=0 → a2IsZero=true, points form a line', () => {
    const geo = computePolySpaceGeo('p2', 0, 1, 0)
    expect(geo.a2IsZero).toBe(true)
    // f(x) = x, check a few points
    for (const [x, y] of geo.graphPoints) {
      // y should be x (clamped to [-8,8])
      const expected = Math.max(-8, Math.min(8, x))
      expect(Math.abs(y - expected)).toBeLessThan(EPS)
    }
  })

  it("P₁ mode: deg='p1', a2=5 → effectiveA2=0", () => {
    const geo = computePolySpaceGeo('p1', 0, 1, 5)
    expect(geo.effectiveA2).toBe(0)
    expect(geo.a2IsZero).toBe(true)
    // graphPoints should be linear (no x² term)
    for (const [x, y] of geo.graphPoints) {
      const expected = Math.max(-8, Math.min(8, x))
      expect(Math.abs(y - expected)).toBeLessThan(EPS)
    }
  })

  it('real-time: changing a1 from 1 to 2 changes slope of graphPoints', () => {
    const geo1 = computePolySpaceGeo('p2', 0, 1, 0)
    const geo2 = computePolySpaceGeo('p2', 0, 2, 0)
    // At x=1 (within range), geo1 y=1, geo2 y=2
    const pt1 = geo1.graphPoints.find(([x]) => Math.abs(x - 1) < 0.05)
    const pt2 = geo2.graphPoints.find(([x]) => Math.abs(x - 1) < 0.05)
    expect(pt1).toBeDefined()
    expect(pt2).toBeDefined()
    if (pt1 && pt2) {
      expect(pt2[1]).toBeGreaterThan(pt1[1])
      expect(Math.abs(pt2[1] / pt1[1] - 2)).toBeLessThan(0.05)
    }
  })

  it('graphPoints has 200 entries', () => {
    const geo = computePolySpaceGeo('p2', 1, 1, 1)
    expect(geo.graphPoints).toHaveLength(200)
  })

  it('y values are clamped to [-8, 8]', () => {
    const geo = computePolySpaceGeo('p2', 0, 0, 100)
    for (const [, y] of geo.graphPoints) {
      expect(y).toBeGreaterThanOrEqual(-8)
      expect(y).toBeLessThanOrEqual(8)
    }
  })
})
