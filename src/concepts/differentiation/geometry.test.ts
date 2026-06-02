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
})
