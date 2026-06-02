import { describe, it, expect } from 'vitest'
import { computeComplexPlaneGeo } from './geometry'
import type { Complex } from '../../types'

describe('computeComplexPlaneGeo', () => {
  it('identity c=[1,0]: product=z, rotationAngle≈0, scaleFactor≈1, isPureRotation=true', () => {
    const z: Complex = [1.5, 0]
    const c: Complex = [1, 0]
    const geo = computeComplexPlaneGeo(z, c)
    expect(geo.product[0]).toBeCloseTo(1.5, 9)
    expect(geo.product[1]).toBeCloseTo(0, 9)
    expect(geo.rotationAngle).toBeCloseTo(0, 9)
    expect(geo.scaleFactor).toBeCloseTo(1, 9)
    expect(geo.isPureRotation).toBe(true)
  })

  it('c=[0,1] (i): product=[-z[1],z[0]], cIsI=true', () => {
    const z: Complex = [1.5, 0]
    const c: Complex = [0, 1]
    const geo = computeComplexPlaneGeo(z, c)
    // i * (1.5+0i) = 0+1.5i
    expect(geo.product[0]).toBeCloseTo(-z[1], 9)
    expect(geo.product[1]).toBeCloseTo(z[0], 9)
    expect(geo.cIsI).toBe(true)
  })

  it('c=[2,0]: scaleFactor≈2, rotationAngle≈0, |product|≈2*|z|', () => {
    const z: Complex = [1.5, 0]
    const c: Complex = [2, 0]
    const geo = computeComplexPlaneGeo(z, c)
    expect(geo.scaleFactor).toBeCloseTo(2, 9)
    expect(geo.rotationAngle).toBeCloseTo(0, 9)
    const zMag = Math.sqrt(z[0] * z[0] + z[1] * z[1])
    const productMag = Math.sqrt(geo.product[0] * geo.product[0] + geo.product[1] * geo.product[1])
    expect(productMag).toBeCloseTo(2 * zMag, 9)
  })

  it('c=[0,0]: cMagIsZero=true, product=[0,0]', () => {
    const z: Complex = [1.5, 0.5]
    const c: Complex = [0, 0]
    const geo = computeComplexPlaneGeo(z, c)
    expect(geo.cMagIsZero).toBe(true)
    expect(geo.product[0]).toBeCloseTo(0, 9)
    expect(geo.product[1]).toBeCloseTo(0, 9)
  })

  it('real-time: changing c changes product', () => {
    const z: Complex = [1, 1]
    const c1: Complex = [1, 0]
    const c2: Complex = [0, 1]
    const geo1 = computeComplexPlaneGeo(z, c1)
    const geo2 = computeComplexPlaneGeo(z, c2)
    expect(geo1.product[0]).not.toBeCloseTo(geo2.product[0], 1)
  })
})
