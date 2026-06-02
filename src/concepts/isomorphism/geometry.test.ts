import { describe, it, expect } from 'vitest'
import { computeIsomorphismGeo } from './geometry'

const EPS = 1e-9

function close(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps
}

describe('computeIsomorphismGeo', () => {
  it('zero vector: a=b=c=0 → isZero=true, all graphPoints y=0', () => {
    const geo = computeIsomorphismGeo(0, 0, 0)
    expect(geo.isZero).toBe(true)
    expect(geo.bIsZero).toBe(true)
    expect(geo.aIsZero).toBe(true)
    expect(geo.cIsZero).toBe(true)
    for (const [, y] of geo.graphPoints) {
      expect(Math.abs(y)).toBeLessThan(EPS * 10)
    }
  })

  it('a=1, b=0, c=0 → vec=[1,0,0], polyCoeffs=[1,0,0], graphPoints at x=0 is 1', () => {
    const geo = computeIsomorphismGeo(1, 0, 0)
    expect(geo.vec).toEqual([1, 0, 0])
    expect(geo.polyCoeffs[0]).toBeCloseTo(1, 9)
    expect(geo.polyCoeffs[1]).toBeCloseTo(0, 9)
    expect(geo.polyCoeffs[2]).toBeCloseTo(0, 9)
    expect(geo.aIsZero).toBe(false)
    expect(geo.bIsZero).toBe(true)
    expect(geo.cIsZero).toBe(true)
    // x=0 is at i=100 when xMin=-10, xMax=10, SAMPLES=200 → step = 20/200 = 0.1
    // x[100] = -10 + 100*0.1 = 0
    const atZero = geo.graphPoints[100]
    expect(close(atZero[0], 0)).toBe(true)
    expect(close(atZero[1], 1)).toBe(true)
  })

  it('a=0, b=1, c=0 → polyCoeffs=[0,1,0], graphPoints at x=2 is 2', () => {
    const geo = computeIsomorphismGeo(0, 1, 0)
    expect(geo.polyCoeffs[0]).toBeCloseTo(0, 9)
    expect(geo.polyCoeffs[1]).toBeCloseTo(1, 9)
    expect(geo.polyCoeffs[2]).toBeCloseTo(0, 9)
    // x=2 is at i: (2-(-10))/(20/200) = 12/0.1 = 120
    const pt = geo.graphPoints[120]
    expect(close(pt[0], 2)).toBe(true)
    expect(close(pt[1], 2)).toBe(true)
  })

  it('a=0, b=0, c=1 → polyCoeffs=[0,0,1], graphPoints at x=2 is 4', () => {
    const geo = computeIsomorphismGeo(0, 0, 1)
    expect(geo.polyCoeffs[0]).toBeCloseTo(0, 9)
    expect(geo.polyCoeffs[1]).toBeCloseTo(0, 9)
    expect(geo.polyCoeffs[2]).toBeCloseTo(1, 9)
    expect(geo.cIsZero).toBe(false)
    // x=2 is at index 120 (same as above)
    const pt = geo.graphPoints[120]
    expect(close(pt[0], 2)).toBe(true)
    expect(close(pt[1], 4)).toBe(true)
  })

  it('bIsZero flag: b=0, a=1, c=1 → bIsZero=true', () => {
    const geo = computeIsomorphismGeo(1, 0, 1)
    expect(geo.bIsZero).toBe(true)
    expect(geo.aIsZero).toBe(false)
    expect(geo.cIsZero).toBe(false)
  })

  it('aIsZero flag: a=0, b=2, c=1 → aIsZero=true, all graphPoints have correct y', () => {
    const geo = computeIsomorphismGeo(0, 2, 1)
    expect(geo.aIsZero).toBe(true)
    // at x=0 (index 100): y = 0 + 2*0 + 1*0 = 0
    const atZero = geo.graphPoints[100]
    expect(close(atZero[0], 0)).toBe(true)
    expect(close(atZero[1], 0)).toBe(true)
  })

  it('cIsZero flag: c=0, a=1, b=1 → cIsZero=true', () => {
    const geo = computeIsomorphismGeo(1, 1, 0)
    expect(geo.cIsZero).toBe(true)
    expect(geo.aIsZero).toBe(false)
    expect(geo.bIsZero).toBe(false)
  })

  it('real-time wiring: changing c from 0 to 1 changes curvature of graphPoints', () => {
    const geo1 = computeIsomorphismGeo(0, 0, 0)
    const geo2 = computeIsomorphismGeo(0, 0, 1)
    // f1(x) = 0 (flat), f2(x) = x² → at x=2: y1=0, y2=4
    // x=2 is at index 120
    const pt1 = geo1.graphPoints[120]
    const pt2 = geo2.graphPoints[120]
    expect(close(pt1[0], 2)).toBe(true)
    expect(close(pt2[0], 2)).toBe(true)
    expect(close(pt1[1], 0)).toBe(true)
    expect(close(pt2[1], 4)).toBe(true)
  })

  it('quadratic: a=1, b=2, c=3 → f(x)=1+2x+3x², at x=1 y=6', () => {
    const geo = computeIsomorphismGeo(1, 2, 3)
    // x=1 is at index: (1-(-10))/(20/200) = 11/0.1 = 110
    const pt = geo.graphPoints[110]
    expect(close(pt[0], 1)).toBe(true)
    expect(close(pt[1], 6)).toBe(true)
  })
})
