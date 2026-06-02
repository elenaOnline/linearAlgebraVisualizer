import { describe, it, expect } from 'vitest'
import { computePolyAdditionGeo } from './geometry'
import { EPS } from '../../linalg/vector'

describe('computePolyAdditionGeo', () => {
  it('sum is zero: p=[1,2,3], q=[-1,-2,-3] → sumIsZero=true', () => {
    const geo = computePolyAdditionGeo('p2', [1, 2, 3], [-1, -2, -3])
    expect(geo.sumIsZero).toBe(true)
    for (const c of geo.sumCoeffs) {
      expect(Math.abs(c)).toBeLessThan(EPS)
    }
  })

  it('both zero → sumIsZero=true', () => {
    const geo = computePolyAdditionGeo('p2', [0, 0, 0], [0, 0, 0])
    expect(geo.sumIsZero).toBe(true)
  })

  it("P₁ mode: deg='p1', p[2]=5 → pCoeffs[2]=0", () => {
    const geo = computePolyAdditionGeo('p1', [1, 2, 5], [0, 0, 0])
    expect(geo.pCoeffs[2]).toBe(0)
    expect(geo.qCoeffs[2]).toBe(0)
    expect(geo.sumCoeffs[2]).toBe(0)
  })

  it('changing q[0] changes sumCoeffs[0] by same amount', () => {
    const p: [number, number, number] = [1, 1, 1]
    const geo1 = computePolyAdditionGeo('p2', p, [0, 0, 0])
    const geo2 = computePolyAdditionGeo('p2', p, [3, 0, 0])
    expect(Math.abs(geo2.sumCoeffs[0] - geo1.sumCoeffs[0] - 3)).toBeLessThan(EPS)
  })

  it('sumCoeffs is element-wise sum of pCoeffs and qCoeffs', () => {
    const p: [number, number, number] = [1, 2, 3]
    const q: [number, number, number] = [4, 5, 6]
    const geo = computePolyAdditionGeo('p2', p, q)
    expect(geo.sumCoeffs[0]).toBeCloseTo(5)
    expect(geo.sumCoeffs[1]).toBeCloseTo(7)
    expect(geo.sumCoeffs[2]).toBeCloseTo(9)
  })

  it('pGraph, qGraph, and sumGraph each have 200 entries', () => {
    const geo = computePolyAdditionGeo('p2', [1, 0, 0], [0, 1, 0])
    expect(geo.pGraph).toHaveLength(200)
    expect(geo.qGraph).toHaveLength(200)
    expect(geo.sumGraph).toHaveLength(200)
  })
})
