import { describe, it, expect } from 'vitest'
import { computePolyScalarMulGeo } from './geometry'
import { EPS } from '../../linalg/vector'

describe('computePolyScalarMulGeo', () => {
  it('c=0 → cIsZero=true, all scaledCoeffs=0', () => {
    const geo = computePolyScalarMulGeo('p2', [1, 2, 3], 0)
    expect(geo.cIsZero).toBe(true)
    for (const c of geo.scaledCoeffs) {
      expect(Math.abs(c)).toBeLessThan(EPS)
    }
  })

  it('c=1 → cIsOne=true, scaledCoeffs equals pCoeffs', () => {
    const p: [number, number, number] = [1, 2, 3]
    const geo = computePolyScalarMulGeo('p2', p, 1)
    expect(geo.cIsOne).toBe(true)
    expect(geo.scaledCoeffs[0]).toBeCloseTo(geo.pCoeffs[0])
    expect(geo.scaledCoeffs[1]).toBeCloseTo(geo.pCoeffs[1])
    expect(geo.scaledCoeffs[2]).toBeCloseTo(geo.pCoeffs[2])
  })

  it('c=-1 → cIsNegative=true, scaledCoeffs negated', () => {
    const p: [number, number, number] = [1, 2, 3]
    const geo = computePolyScalarMulGeo('p2', p, -1)
    expect(geo.cIsNegative).toBe(true)
    expect(geo.scaledCoeffs[0]).toBeCloseTo(-1)
    expect(geo.scaledCoeffs[1]).toBeCloseTo(-2)
    expect(geo.scaledCoeffs[2]).toBeCloseTo(-3)
  })

  it('c=2 → scaledCoeffs doubled', () => {
    const p: [number, number, number] = [1, 0, 0]
    const geo = computePolyScalarMulGeo('p2', p, 2)
    expect(geo.scaledCoeffs[0]).toBeCloseTo(2)
    expect(geo.scaledCoeffs[1]).toBeCloseTo(0)
    expect(geo.scaledCoeffs[2]).toBeCloseTo(0)
  })

  it("P₁ mode: p[2] treated as 0", () => {
    const geo = computePolyScalarMulGeo('p1', [1, 2, 5], 2)
    expect(geo.pCoeffs[2]).toBe(0)
    expect(geo.scaledCoeffs[2]).toBe(0)
  })

  it('changing c from 1 to 3 triples scaledCoeffs', () => {
    const p: [number, number, number] = [1, 2, 3]
    const geo1 = computePolyScalarMulGeo('p2', p, 1)
    const geo3 = computePolyScalarMulGeo('p2', p, 3)
    expect(geo3.scaledCoeffs[0]).toBeCloseTo(3 * geo1.scaledCoeffs[0])
    expect(geo3.scaledCoeffs[1]).toBeCloseTo(3 * geo1.scaledCoeffs[1])
    expect(geo3.scaledCoeffs[2]).toBeCloseTo(3 * geo1.scaledCoeffs[2])
  })

  it('pGraph and scaledGraph each have 200 entries', () => {
    const geo = computePolyScalarMulGeo('p2', [0, 1, 0], 2)
    expect(geo.pGraph).toHaveLength(200)
    expect(geo.scaledGraph).toHaveLength(200)
  })
})
