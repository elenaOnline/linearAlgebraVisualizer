import { describe, it, expect } from 'vitest'
import { deriveLinearMapsGeometry, SINGULAR_EPS } from './geometry'
import type { Mat2x2, Mat3x3 } from '../../types'

function close(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps
}

function closeVec(a: [number, number, number], b: [number, number, number], eps = 1e-9): boolean {
  return close(a[0], b[0], eps) && close(a[1], b[1], eps) && close(a[2], b[2], eps)
}

describe('deriveLinearMapsGeometry — 2D', () => {
  it('identity matrix: col1=[1,0,0], col2=[0,1,0], det=1', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveLinearMapsGeometry(I, [1, 1], 1, '2d')
    expect(closeVec(g.col1, [1, 0, 0])).toBe(true)
    expect(closeVec(g.col2, [0, 1, 0])).toBe(true)
    expect(g.col3).toBeNull()
    expect(close(g.detA, 1)).toBe(true)
    expect(g.isSingular).toBe(false)
  })

  it('scaling by 2: A=[[2,0],[0,2]] → det=4, col1=[2,0,0], col2=[0,2,0]', () => {
    const A: Mat2x2 = [[2, 0], [0, 2]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 1, '2d')
    expect(closeVec(g.col1, [2, 0, 0])).toBe(true)
    expect(closeVec(g.col2, [0, 2, 0])).toBe(true)
    expect(close(g.detA, 4)).toBe(true)
    expect(g.isSingular).toBe(false)
  })

  it('reflection: A=[[-1,0],[0,1]] → det=-1', () => {
    const A: Mat2x2 = [[-1, 0], [0, 1]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 1, '2d')
    expect(close(g.detA, -1)).toBe(true)
    expect(g.isSingular).toBe(false)
  })

  it('singular: A=[[1,0],[0,0]] → det=0, isSingular=true', () => {
    const A: Mat2x2 = [[1, 0], [0, 0]]
    const g = deriveLinearMapsGeometry(A, [1, 1], 1, '2d')
    expect(close(g.detA, 0)).toBe(true)
    expect(g.isSingular).toBe(true)
  })

  it('rotation 90°: A=[[0,-1],[1,0]] → det=1, col1=[0,1,0], col2=[-1,0,0]', () => {
    const A: Mat2x2 = [[0, -1], [1, 0]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 1, '2d')
    expect(close(g.detA, 1)).toBe(true)
    // col1 = first column of A = [A[0][0], A[1][0], 0] = [0, 1, 0]
    expect(closeVec(g.col1, [0, 1, 0])).toBe(true)
    // col2 = second column of A = [A[0][1], A[1][1], 0] = [-1, 0, 0]
    expect(closeVec(g.col2, [-1, 0, 0])).toBe(true)
  })

  it('interpolation t=0: A_t = identity regardless of A', () => {
    const A: Mat2x2 = [[3, 2], [1, 4]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 0, '2d')
    // At t=0, At should equal identity
    expect(closeVec(g.col1, [1, 0, 0])).toBe(true)
    expect(closeVec(g.col2, [0, 1, 0])).toBe(true)
  })

  it('interpolation t=0.5: A_t = (I + A)/2', () => {
    const A: Mat2x2 = [[3, 0], [0, 3]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 0.5, '2d')
    // At t=0.5: col1 = lerp([1,0,0], [3,0,0], 0.5) = [2, 0, 0]
    expect(closeVec(g.col1, [2, 0, 0])).toBe(true)
    expect(closeVec(g.col2, [0, 2, 0])).toBe(true)
  })

  it('grid transform: [1,0] under identity → [1,0,0]; under [[2,0],[0,1]] → [2,0,0]', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const gI = deriveLinearMapsGeometry(I, [1, 0], 1, '2d')
    // Find a grid line that passes through [1,0]
    // Under identity, a vertical line x=1 has endpoints (1,-5) and (1,5)
    const line = gI.gridLines.find(
      ([start]) => close(start[0], 1, 1e-6) && close(start[1], -5, 1e-6),
    )
    expect(line).toBeDefined()
    if (line) {
      expect(closeVec(line[0], [1, -5, 0])).toBe(true)
      expect(closeVec(line[1], [1, 5, 0])).toBe(true)
    }

    const A: Mat2x2 = [[2, 0], [0, 1]]
    const gA = deriveLinearMapsGeometry(A, [1, 0], 1, '2d')
    // Under [[2,0],[0,1]], the line x=1 (from (1,-5) to (1,5)) maps to (2,-5) to (2,5)
    const lineA = gA.gridLines.find(
      ([start]) => close(start[0], 2, 1e-6) && close(start[1], -5, 1e-6),
    )
    expect(lineA).toBeDefined()
    if (lineA) {
      expect(closeVec(lineA[0], [2, -5, 0])).toBe(true)
      expect(closeVec(lineA[1], [2, 5, 0])).toBe(true)
    }
  })

  it('probe vector and its image', () => {
    const A: Mat2x2 = [[2, 0], [0, 3]]
    const g = deriveLinearMapsGeometry(A, [1, 2], 1, '2d')
    // Av = [2*1 + 0*2, 0*1 + 3*2] = [2, 6]
    expect(closeVec(g.v3, [1, 2, 0])).toBe(true)
    expect(closeVec(g.Av3, [2, 6, 0])).toBe(true)
  })

  it('unit square corners at t=1 match transformation', () => {
    const A: Mat2x2 = [[2, 0], [0, 2]]
    const g = deriveLinearMapsGeometry(A, [1, 0], 1, '2d')
    // [0,0] → [0,0], [1,0] → [2,0], [1,1] → [2,2], [0,1] → [0,2]
    expect(g.unitShapeCorners.length).toBe(4)
    expect(closeVec(g.unitShapeCorners[0], [0, 0, 0])).toBe(true)
    expect(closeVec(g.unitShapeCorners[1], [2, 0, 0])).toBe(true)
    expect(closeVec(g.unitShapeCorners[2], [2, 2, 0])).toBe(true)
    expect(closeVec(g.unitShapeCorners[3], [0, 2, 0])).toBe(true)
  })

  it('gridLines have correct count: 11 vertical + 11 horizontal = 22', () => {
    const I: Mat2x2 = [[1, 0], [0, 1]]
    const g = deriveLinearMapsGeometry(I, [1, 0], 1, '2d')
    expect(g.gridLines.length).toBe(22)
  })
})

describe('deriveLinearMapsGeometry — 3D', () => {
  it('3D identity → det=1, col3 non-null', () => {
    const I: Mat3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const g = deriveLinearMapsGeometry(I, [1, 0, 0], 1, '3d')
    expect(close(g.detA, 1)).toBe(true)
    expect(g.isSingular).toBe(false)
    expect(g.col3).not.toBeNull()
    expect(closeVec(g.col1, [1, 0, 0])).toBe(true)
    expect(closeVec(g.col2, [0, 1, 0])).toBe(true)
    if (g.col3) {
      expect(closeVec(g.col3, [0, 0, 1])).toBe(true)
    }
  })

  it('3D scaling diagonal A=diag(2,3,4) → det=24', () => {
    const A: Mat3x3 = [[2, 0, 0], [0, 3, 0], [0, 0, 4]]
    const g = deriveLinearMapsGeometry(A, [1, 1, 1], 1, '3d')
    expect(close(g.detA, 24)).toBe(true)
    expect(g.isSingular).toBe(false)
  })

  it('3D singular: last row zero → det=0', () => {
    const A: Mat3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 0]]
    const g = deriveLinearMapsGeometry(A, [1, 1, 1], 1, '3d')
    expect(close(g.detA, 0)).toBe(true)
    expect(g.isSingular).toBe(true)
  })

  it('3D unit cube has 8 corners', () => {
    const I: Mat3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const g = deriveLinearMapsGeometry(I, [1, 0, 0], 1, '3d')
    expect(g.unitShapeCorners.length).toBe(8)
  })

  it('3D grid lines: 7 x-dir + 7 z-dir = 14 lines', () => {
    const I: Mat3x3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    const g = deriveLinearMapsGeometry(I, [1, 0, 0], 1, '3d')
    expect(g.gridLines.length).toBe(14)
  })

  it('SINGULAR_EPS is exported and equals 1e-6', () => {
    expect(SINGULAR_EPS).toBe(1e-6)
  })
})
