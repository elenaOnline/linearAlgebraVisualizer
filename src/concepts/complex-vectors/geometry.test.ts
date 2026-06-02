import { describe, it, expect } from 'vitest'
import { computeComplexVectorsGeo } from './geometry'
import type { ComplexVec2 } from '../../types'

describe('computeComplexVectorsGeo', () => {
  it('z2=[0,0]: z2IsZero=true, z2Arg=0, z2Mag=0', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 0]]
    const geo = computeComplexVectorsGeo(vec)
    expect(geo.z2IsZero).toBe(true)
    expect(geo.z2Arg).toBeCloseTo(0, 9)
    expect(geo.z2Mag).toBeCloseTo(0, 9)
  })

  it('both zero: vecIsZero=true', () => {
    const vec: ComplexVec2 = [[0, 0], [0, 0]]
    const geo = computeComplexVectorsGeo(vec)
    expect(geo.vecIsZero).toBe(true)
  })

  it('z1=[3,4]: combinedPos=[3,4]', () => {
    const vec: ComplexVec2 = [[3, 4], [1, 0]]
    const geo = computeComplexVectorsGeo(vec)
    expect(geo.combinedPos[0]).toBeCloseTo(3, 9)
    expect(geo.combinedPos[1]).toBeCloseTo(4, 9)
  })

  it('z2=[0,1]: z2Arg≈π/2, z2Mag≈1', () => {
    const vec: ComplexVec2 = [[1, 0], [0, 1]]
    const geo = computeComplexVectorsGeo(vec)
    expect(geo.z2Arg).toBeCloseTo(Math.PI / 2, 9)
    expect(geo.z2Mag).toBeCloseTo(1, 9)
  })

  it('real-time: changing z2 changes z2Arg without changing combinedPos', () => {
    const vec1: ComplexVec2 = [[1, 0], [1, 0]]
    const vec2: ComplexVec2 = [[1, 0], [0, 1]]
    const geo1 = computeComplexVectorsGeo(vec1)
    const geo2 = computeComplexVectorsGeo(vec2)
    // z2Arg should differ
    expect(geo1.z2Arg).not.toBeCloseTo(geo2.z2Arg, 1)
    // combinedPos should be identical
    expect(geo1.combinedPos[0]).toBeCloseTo(geo2.combinedPos[0], 9)
    expect(geo1.combinedPos[1]).toBeCloseTo(geo2.combinedPos[1], 9)
  })
})
