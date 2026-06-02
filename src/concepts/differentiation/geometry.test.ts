import { describe, it, expect } from 'vitest'
import { computeDifferentiationGeo } from './geometry'

const EPS = 1e-9

describe('computeDifferentiationGeo', () => {
  it('kernel input: a0=3, a1=0, a2=0 → onKernel=true, image=[0,0]', () => {
    const geo = computeDifferentiationGeo(3, 0, 0)
    expect(geo.onKernel).toBe(true)
    expect(geo.image[0]).toBeCloseTo(0, 9)
    expect(geo.image[1]).toBeCloseTo(0, 9)
  })

  it('non-kernel: a0=1, a1=2, a2=3 → image=[2,6], onKernel=false', () => {
    const geo = computeDifferentiationGeo(1, 2, 3)
    expect(geo.onKernel).toBe(false)
    expect(geo.image[0]).toBeCloseTo(2, 9)
    expect(geo.image[1]).toBeCloseTo(6, 9)
  })

  it('zero input: a0=a1=a2=0 → onKernel=true, image=[0,0]', () => {
    const geo = computeDifferentiationGeo(0, 0, 0)
    expect(geo.onKernel).toBe(true)
    expect(geo.image[0]).toBeCloseTo(0, 9)
    expect(geo.image[1]).toBeCloseTo(0, 9)
  })

  it('a0 independence: changing a0 does not change image', () => {
    const geo1 = computeDifferentiationGeo(0, 2, 1)
    const geo2 = computeDifferentiationGeo(99, 2, 1)
    expect(geo1.image[0]).toBeCloseTo(geo2.image[0], 9)
    expect(geo1.image[1]).toBeCloseTo(geo2.image[1], 9)
  })

  it('real-time wiring: changing a2 from 1 to 2 changes image[1] from 2 to 4', () => {
    const geo1 = computeDifferentiationGeo(0, 0, 1)
    const geo2 = computeDifferentiationGeo(0, 0, 2)
    expect(geo1.image[1]).toBeCloseTo(2, 9)
    expect(geo2.image[1]).toBeCloseTo(4, 9)
    // a1=0, a2=1 → onKernel is false because |a2| >= EPS
    expect(geo1.onKernel).toBe(false)
    expect(geo2.onKernel).toBe(false)
    // Sanity: a2 must be >= EPS for onKernel to be false
    expect(Math.abs(0) < EPS && Math.abs(1) < EPS).toBe(false)
  })

  // ---- fPoints and dfPoints ---------------------------------------------------

  it('fPoints: linear polynomial a0=1, a1=2, a2=0 → f(0)=1', () => {
    const geo = computeDifferentiationGeo(1, 2, 0)
    expect(geo.fPoints).toBeDefined()
    expect(geo.fPoints.length).toBe(201) // 0..200 inclusive
    // x=0 is at the midpoint (index 100 of 200 samples, x in [-10,10])
    const midPt = geo.fPoints[100]
    expect(midPt[0]).toBeCloseTo(0, 9)
    expect(midPt[1]).toBeCloseTo(1, 9) // f(0) = 1 + 2*0 + 0 = 1
  })

  it('fPoints: quadratic a0=0, a1=0, a2=1 → f(2)=4', () => {
    const geo = computeDifferentiationGeo(0, 0, 1)
    // x=2 falls at i where -10 + (i/200)*20 = 2 → i = 120
    const pt = geo.fPoints[120]
    expect(pt[0]).toBeCloseTo(2, 9)
    expect(pt[1]).toBeCloseTo(4, 9) // f(2) = 0 + 0 + 1*4 = 4
  })

  it('dfPoints: linear a0=1, a1=2, a2=0 → f′(0)=2', () => {
    const geo = computeDifferentiationGeo(1, 2, 0)
    expect(geo.dfPoints).toBeDefined()
    expect(geo.dfPoints.length).toBe(201)
    const midPt = geo.dfPoints[100] // x=0
    expect(midPt[0]).toBeCloseTo(0, 9)
    expect(midPt[1]).toBeCloseTo(2, 9) // f′(0) = 2 + 2*0*0 = 2
  })

  it('dfPoints: quadratic a0=0, a1=0, a2=1 → f′(2)=4', () => {
    const geo = computeDifferentiationGeo(0, 0, 1)
    // x=2 at index 120
    const pt = geo.dfPoints[120]
    expect(pt[0]).toBeCloseTo(2, 9)
    expect(pt[1]).toBeCloseTo(4, 9) // f′(2) = 0 + 2*1*2 = 4
  })

  it('dfPoints: a0 does not affect derivative', () => {
    const geo1 = computeDifferentiationGeo(0, 3, 1)
    const geo2 = computeDifferentiationGeo(99, 3, 1)
    // All dfPoints should be identical
    for (let i = 0; i < geo1.dfPoints.length; i++) {
      expect(geo1.dfPoints[i][1]).toBeCloseTo(geo2.dfPoints[i][1], 9)
    }
  })

  it('fPoints: changing coefficients updates sampled values', () => {
    const geo1 = computeDifferentiationGeo(0, 1, 0) // f(x) = x
    const geo2 = computeDifferentiationGeo(0, 2, 0) // f(x) = 2x
    // At x=5 (index 150): geo1 should be 5, geo2 should be 10
    const pt1 = geo1.fPoints[150]
    const pt2 = geo2.fPoints[150]
    expect(pt1[0]).toBeCloseTo(5, 9)
    expect(pt1[1]).toBeCloseTo(5, 9)
    expect(pt2[0]).toBeCloseTo(5, 9)
    expect(pt2[1]).toBeCloseTo(10, 9)
  })
})
