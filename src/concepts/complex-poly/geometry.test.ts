import { describe, it, expect } from 'vitest'
import { computeComplexPolyGeo } from './geometry'
import type { Complex } from '../../types'

const ZERO: Complex = [0, 0]
const ONE: Complex = [1, 0]
const NEG_ONE: Complex = [-1, 0]
const I: Complex = [0, 1]
const NEG_I: Complex = [0, -1]

describe('computeComplexPolyGeo', () => {
  it('zero polynomial: a0=a1=a2=[0,0] → isZero=true, zeros=[]', () => {
    const geo = computeComplexPolyGeo(ZERO, ZERO, ZERO)
    expect(geo.isZero).toBe(true)
    expect(geo.zeros).toHaveLength(0)
  })

  it('z²-1: a2=[1,0], a1=[0,0], a0=[-1,0] → zeros near [1,0] and [-1,0]', () => {
    const geo = computeComplexPolyGeo(NEG_ONE, ZERO, ONE)
    expect(geo.zeros).toHaveLength(2)
    // Find zero near [1,0]
    const hasOne = geo.zeros.some(
      (z) => Math.abs(z[0] - 1) < 1e-6 && Math.abs(z[1]) < 1e-6,
    )
    const hasNegOne = geo.zeros.some(
      (z) => Math.abs(z[0] + 1) < 1e-6 && Math.abs(z[1]) < 1e-6,
    )
    expect(hasOne).toBe(true)
    expect(hasNegOne).toBe(true)
  })

  it('z²: a2=[1,0], a1=[0,0], a0=[0,0] → isDoubleZero=true, one zero near [0,0]', () => {
    const geo = computeComplexPolyGeo(ZERO, ZERO, ONE)
    expect(geo.isDoubleZero).toBe(true)
    // Both zeros should be near origin (double root at 0)
    expect(geo.zeros).toHaveLength(2)
    const hasOrigin = geo.zeros.some(
      (z) => Math.abs(z[0]) < 1e-6 && Math.abs(z[1]) < 1e-6,
    )
    expect(hasOrigin).toBe(true)
  })

  it('z²+1: a2=[1,0], a1=[0,0], a0=[1,0] → zeros near [0,1] and [0,-1]', () => {
    const geo = computeComplexPolyGeo(ONE, ZERO, ONE)
    expect(geo.zeros).toHaveLength(2)
    const hasI = geo.zeros.some(
      (z) => Math.abs(z[0]) < 1e-6 && Math.abs(z[1] - 1) < 1e-6,
    )
    const hasNegI = geo.zeros.some(
      (z) => Math.abs(z[0]) < 1e-6 && Math.abs(z[1] + 1) < 1e-6,
    )
    expect(hasI).toBe(true)
    expect(hasNegI).toBe(true)
    // Ensure the purely imaginary zeros are found
    expect([I, NEG_I].length).toBe(2)
  })

  it('sampleGrid center: gridResolution=5, center entry [2][2] equals a0 when z=0', () => {
    // With gridResolution=5 and bounds xMin=-2,xMax=2,yMin=-2,yMax=2,
    // center index is [2][2] → x=(−2+2·(2/4))=0, y=(−2+2·(2/4))=0 → z=0
    // p(0) = a0*1 + a1*0 + a2*0 = a0
    const a0: Complex = [3, -2]
    const a1: Complex = [1, 1]
    const a2: Complex = [2, 0]
    const geo = computeComplexPolyGeo(a0, a1, a2, 5)
    const center = geo.sampleGrid[2][2]
    expect(center[0]).toBeCloseTo(a0[0], 9)
    expect(center[1]).toBeCloseTo(a0[1], 9)
  })
})
