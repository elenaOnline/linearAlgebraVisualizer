import { describe, it, expect } from 'vitest'
import { computeComplexScalarMulGeo } from './geometry'
import { complexMul, complexMag } from '../../linalg/complex'
import type { ComplexVec2, Complex } from '../../types'

describe('computeComplexScalarMulGeo', () => {
  it('c=[1,0]: isPureRotation=true, scaled≈vec, rotationAngle≈0', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const c: Complex = [1, 0]
    const geo = computeComplexScalarMulGeo(vec, c)
    expect(geo.isPureRotation).toBe(true)
    expect(geo.rotationAngle).toBeCloseTo(0, 9)
    expect(geo.scaledZ1[0]).toBeCloseTo(vec[0][0], 9)
    expect(geo.scaledZ1[1]).toBeCloseTo(vec[0][1], 9)
    expect(geo.scaledZ2[0]).toBeCloseTo(vec[1][0], 9)
    expect(geo.scaledZ2[1]).toBeCloseTo(vec[1][1], 9)
  })

  it('c=[0,1]: cIsI=true, rotationAngle≈π/2, scaledZ1=complexMul(vec[0],[0,1])', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const c: Complex = [0, 1]
    const geo = computeComplexScalarMulGeo(vec, c)
    expect(geo.cIsI).toBe(true)
    expect(geo.rotationAngle).toBeCloseTo(Math.PI / 2, 9)
    const expected = complexMul(vec[0], [0, 1])
    expect(geo.scaledZ1[0]).toBeCloseTo(expected[0], 9)
    expect(geo.scaledZ1[1]).toBeCloseTo(expected[1], 9)
  })

  it('c=[0,0]: cMagIsZero=true, both scaled components=[0,0]', () => {
    const vec: ComplexVec2 = [[1, 2], [3, 4]]
    const c: Complex = [0, 0]
    const geo = computeComplexScalarMulGeo(vec, c)
    expect(geo.cMagIsZero).toBe(true)
    expect(geo.scaledZ1[0]).toBeCloseTo(0, 9)
    expect(geo.scaledZ1[1]).toBeCloseTo(0, 9)
    expect(geo.scaledZ2[0]).toBeCloseTo(0, 9)
    expect(geo.scaledZ2[1]).toBeCloseTo(0, 9)
  })

  it('c=[2,0]: cIsPositiveReal=true, rotationAngle≈0, |scaledZ1|≈2*|vec[0]|', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const c: Complex = [2, 0]
    const geo = computeComplexScalarMulGeo(vec, c)
    expect(geo.cIsPositiveReal).toBe(true)
    expect(geo.rotationAngle).toBeCloseTo(0, 9)
    expect(complexMag(geo.scaledZ1)).toBeCloseTo(2 * complexMag(vec[0]), 9)
  })

  it('|c|=1: isPureRotation=true, scaledZ2Mag≈inputZ2Mag', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const c: Complex = [Math.cos(1.0), Math.sin(1.0)]
    const geo = computeComplexScalarMulGeo(vec, c)
    expect(geo.isPureRotation).toBe(true)
    expect(geo.scaledZ2Mag).toBeCloseTo(geo.inputZ2Mag, 9)
  })

  it('real-time: changing c changes scaled', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const c1: Complex = [1, 0]
    const c2: Complex = [0, 1]
    const geo1 = computeComplexScalarMulGeo(vec, c1)
    const geo2 = computeComplexScalarMulGeo(vec, c2)
    // scaledZ1 should differ
    expect(geo1.scaledZ1[0]).not.toBeCloseTo(geo2.scaledZ1[0], 1)
  })
})
