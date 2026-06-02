import { describe, it, expect } from 'vitest'
import { computeComplexAdditionGeo } from './geometry'
import type { ComplexVec2 } from '../../types'

describe('computeComplexAdditionGeo', () => {
  it('u+v=zero vector: sumIsZero=true', () => {
    const u: ComplexVec2 = [[1, 0], [0, 1]]
    const v: ComplexVec2 = [[-1, 0], [0, -1]]
    const geo = computeComplexAdditionGeo(u, v)
    expect(geo.sumIsZero).toBe(true)
    expect(geo.sumZ1[0]).toBeCloseTo(0, 9)
    expect(geo.sumZ1[1]).toBeCloseTo(0, 9)
    expect(geo.sumZ2[0]).toBeCloseTo(0, 9)
    expect(geo.sumZ2[1]).toBeCloseTo(0, 9)
  })

  it('u=v: uEqualsV=true, sum=2u', () => {
    const u: ComplexVec2 = [[1, 0], [0, 1]]
    const v: ComplexVec2 = [[1, 0], [0, 1]]
    const geo = computeComplexAdditionGeo(u, v)
    expect(geo.uEqualsV).toBe(true)
    expect(geo.sumZ1[0]).toBeCloseTo(2, 9)
    expect(geo.sumZ1[1]).toBeCloseTo(0, 9)
    expect(geo.sumZ2[0]).toBeCloseTo(0, 9)
    expect(geo.sumZ2[1]).toBeCloseTo(2, 9)
  })

  it('component correctness: sum[0] = complexAdd(u[0], v[0])', () => {
    const u: ComplexVec2 = [[1, 2], [3, 4]]
    const v: ComplexVec2 = [[5, 6], [7, 8]]
    const geo = computeComplexAdditionGeo(u, v)
    expect(geo.sumZ1[0]).toBeCloseTo(6, 9)   // 1+5
    expect(geo.sumZ1[1]).toBeCloseTo(8, 9)   // 2+6
    expect(geo.sumZ2[0]).toBeCloseTo(10, 9)  // 3+7
    expect(geo.sumZ2[1]).toBeCloseTo(12, 9)  // 4+8
  })

  it('real-time: changing u[0] changes sumZ1', () => {
    const v: ComplexVec2 = [[1, 0], [0, 0]]
    const u1: ComplexVec2 = [[0, 0], [0, 0]]
    const u2: ComplexVec2 = [[2, 0], [0, 0]]
    const geo1 = computeComplexAdditionGeo(u1, v)
    const geo2 = computeComplexAdditionGeo(u2, v)
    expect(geo1.sumZ1[0]).not.toBeCloseTo(geo2.sumZ1[0], 1)
  })
})
