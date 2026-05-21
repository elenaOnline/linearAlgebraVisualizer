import { describe, it, expect } from 'vitest'
import { deriveVectorsGeometry } from './geometry'

const EPS = 1e-9

function close(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps
}

describe('deriveVectorsGeometry', () => {
  it('basic 2D case: u=[1,0], v=[0,1] → sum=[1,1], norms=1', () => {
    const g = deriveVectorsGeometry([1, 0], [0, 1], 1, '2d')
    expect(g.u3).toEqual([1, 0, 0])
    expect(g.v3).toEqual([0, 1, 0])
    expect(g.sum3).toEqual([1, 1, 0])
    expect(close(g.normU, 1, EPS)).toBe(true)
    expect(close(g.normV, 1, EPS)).toBe(true)
  })

  it('basic 3D case: u=[1,0,0], v=[0,1,0] → sum=[1,1,0]', () => {
    const g = deriveVectorsGeometry([1, 0, 0], [0, 1, 0], 2, '3d')
    expect(g.u3).toEqual([1, 0, 0])
    expect(g.v3).toEqual([0, 1, 0])
    expect(g.sum3).toEqual([1, 1, 0])
    expect(close(g.normU, 1, EPS)).toBe(true)
    expect(close(g.normV, 1, EPS)).toBe(true)
  })

  it('scalar mult c=-1 reverses direction', () => {
    const g = deriveVectorsGeometry([1, 0], [3, 4], -1, '2d')
    expect(g.cV3[0]).toBeCloseTo(-3)
    expect(g.cV3[1]).toBeCloseTo(-4)
    expect(g.cV3[2]).toBeCloseTo(0)
  })

  it('scalar mult c=0 yields zero vector', () => {
    const g = deriveVectorsGeometry([1, 0], [3, 4], 0, '2d')
    expect(g.cV3[0]).toBeCloseTo(0)
    expect(g.cV3[1]).toBeCloseTo(0)
    expect(g.cV3[2]).toBeCloseTo(0)
  })

  it('zero vector input: normU=0, no crash', () => {
    const g = deriveVectorsGeometry([0, 0], [1, 1], 1, '2d')
    expect(close(g.normU, 0, EPS)).toBe(true)
    expect(g.u3).toEqual([0, 0, 0])
  })

  it('tip-to-tail offset equals u3', () => {
    const g = deriveVectorsGeometry([2, 3], [1, 1], 1, '2d')
    expect(g.tipToTailOffset3).toEqual([2, 3, 0])
    // The tip of (u + v) should equal tipToTailOffset3 + v3
    const tipOfSum: [number, number, number] = [
      g.tipToTailOffset3[0] + g.v3[0],
      g.tipToTailOffset3[1] + g.v3[1],
      g.tipToTailOffset3[2] + g.v3[2],
    ]
    expect(tipOfSum).toEqual(g.sum3)
  })

  it('3D scalar mult: c=2.5 on [1,2,3]', () => {
    const g = deriveVectorsGeometry([0, 0, 0], [1, 2, 3], 2.5, '3d')
    expect(g.cV3[0]).toBeCloseTo(2.5)
    expect(g.cV3[1]).toBeCloseTo(5)
    expect(g.cV3[2]).toBeCloseTo(7.5)
  })

  it('norm is correct Euclidean length', () => {
    const g = deriveVectorsGeometry([3, 4], [0, 0], 1, '2d')
    expect(close(g.normU, 5, 1e-9)).toBe(true)
    expect(close(g.normV, 0, 1e-9)).toBe(true)
  })
})
