import { describe, it, expect } from 'vitest'
import { computeCoordinatesGeo } from './geometry'

const EPS = 1e-9

function close(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) < eps
}

describe('computeCoordinatesGeo', () => {
  it('standard basis v1=[1,0], v2=[0,1] → customCoords equals vec', () => {
    const vec: [number, number] = [2, 3]
    const geo = computeCoordinatesGeo(vec, [1, 0], [0, 1])
    expect(geo.basisIsValid).toBe(true)
    expect(geo.customCoords).not.toBeNull()
    expect(close(geo.customCoords![0], vec[0])).toBe(true)
    expect(close(geo.customCoords![1], vec[1])).toBe(true)
  })

  it('non-standard basis v1=[2,0], v2=[0,1] → customCoords correctly scaled', () => {
    const vec: [number, number] = [4, 3]
    const geo = computeCoordinatesGeo(vec, [2, 0], [0, 1])
    expect(geo.basisIsValid).toBe(true)
    expect(geo.customCoords).not.toBeNull()
    // [2,0]*x + [0,1]*y = [4,3] → x=2, y=3
    expect(close(geo.customCoords![0], 2)).toBe(true)
    expect(close(geo.customCoords![1], 3)).toBe(true)
  })

  it('singular: v1=v2=[1,0] → basisIsValid=false, customCoords=null', () => {
    const geo = computeCoordinatesGeo([1, 1], [1, 0], [1, 0])
    expect(geo.basisIsValid).toBe(false)
    expect(geo.customCoords).toBeNull()
  })

  it('near-singular: |det| < EPS → basisIsValid=false, customCoords=null', () => {
    // v1=[2,0], v2=[2+EPS/2, 0] — nearly parallel → det ≈ 0
    const halfEps = EPS / 2
    const geo = computeCoordinatesGeo([1, 0], [2, 0], [2 + halfEps, 0])
    expect(geo.basisIsValid).toBe(false)
    expect(geo.customCoords).toBeNull()
  })

  it('real-time wiring: changing v1 changes customCoords while leaving vec unchanged', () => {
    const vec: [number, number] = [1, 1]
    const geo1 = computeCoordinatesGeo(vec, [1, 0.5], [0.5, 1])
    const geo2 = computeCoordinatesGeo(vec, [2, 0], [0, 2])
    // vec is unchanged
    expect(geo1.vec).toEqual(vec)
    expect(geo2.vec).toEqual(vec)
    // customCoords are different
    expect(geo1.customCoords).not.toBeNull()
    expect(geo2.customCoords).not.toBeNull()
    const same =
      close(geo1.customCoords![0], geo2.customCoords![0]) &&
      close(geo1.customCoords![1], geo2.customCoords![1])
    expect(same).toBe(false)
  })
})
