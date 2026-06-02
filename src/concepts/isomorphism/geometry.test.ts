import { describe, it, expect } from 'vitest'
import { computeIsomorphismGeo } from './geometry'

const EPS = 1e-9

function close(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps
}

describe('computeIsomorphismGeo', () => {
  it('zero vector: a=b=0 → isZero=true, all graphPoints y=0', () => {
    const geo = computeIsomorphismGeo(0, 0)
    expect(geo.isZero).toBe(true)
    expect(geo.bIsZero).toBe(true)
    expect(geo.aIsZero).toBe(true)
    for (const [, y] of geo.graphPoints) {
      expect(Math.abs(y)).toBeLessThan(EPS * 10)
    }
  })

  it('b=0, a=1 → bIsZero=true, graph passes through origin (f(0)=0)', () => {
    const geo = computeIsomorphismGeo(1, 0)
    expect(geo.bIsZero).toBe(true)
    expect(geo.aIsZero).toBe(false)
    // Find the point at x=0
    const atZero = geo.graphPoints.find(([x]) => Math.abs(x) < 1e-10)
    expect(atZero).toBeDefined()
    expect(Math.abs(atZero![1])).toBeLessThan(1e-9)
  })

  it('a=0, b=2 → aIsZero=true, all graphPoints have y=2', () => {
    const geo = computeIsomorphismGeo(0, 2)
    expect(geo.aIsZero).toBe(true)
    expect(geo.bIsZero).toBe(false)
    for (const [, y] of geo.graphPoints) {
      expect(close(y, 2)).toBe(true)
    }
  })

  it('a=2, b=1 → polyCoeffs=[1,2], graphPoints at x=0 have y=1', () => {
    const geo = computeIsomorphismGeo(2, 1)
    expect(geo.polyCoeffs[0]).toBeCloseTo(1, 9)
    expect(geo.polyCoeffs[1]).toBeCloseTo(2, 9)
    // x=0 is included when xMin=-4, xMax=4, SAMPLES=200 → step = 8/200 = 0.04
    // x[50] = -4 + 50*0.04 = -4 + 2 = -2; x[100] = 0
    const atZero = geo.graphPoints[100]
    expect(atZero).toBeDefined()
    expect(close(atZero[0], 0)).toBe(true)
    expect(close(atZero[1], 1)).toBe(true)
  })

  it('real-time wiring: changing a from 1 to 3 changes slope of graphPoints', () => {
    const geo1 = computeIsomorphismGeo(1, 0)
    const geo2 = computeIsomorphismGeo(3, 0)
    // f1(x) = x, f2(x) = 3x → at x=2: y1=2, y2=6
    // x=2 is at index: (2-(-4))/(8/200) = 6/0.04 = 150
    const pt1 = geo1.graphPoints[150]
    const pt2 = geo2.graphPoints[150]
    expect(close(pt1[0], 2)).toBe(true)
    expect(close(pt2[0], 2)).toBe(true)
    expect(close(pt1[1], 2)).toBe(true)
    expect(close(pt2[1], 6)).toBe(true)
  })
})
