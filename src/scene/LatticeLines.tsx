import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../types'

interface LatticeLinesProps {
  latticePoints: Vec3[]
  basisVecs: Vec3[]
  color?: string
  opacity?: number
}

/**
 * Renders a parallelogram grid: for each lattice point, draws a line segment
 * to each neighboring lattice point one step in a basis direction. The result
 * is a deformed grid whose cells are the parallelograms spanned by the basis.
 */
export function LatticeLines({
  latticePoints,
  basisVecs,
  color = '#7c7a72',
  opacity = 0.28,
}: LatticeLinesProps) {
  const geometry = useMemo(() => {
    if (latticePoints.length === 0 || basisVecs.length < 2) return null

    const positions: number[] = []

    const SNAP = 1e-4
    const ptMap = new Map<string, true>()
    for (const pt of latticePoints) {
      const key = `${Math.round(pt[0] / SNAP)},${Math.round(pt[1] / SNAP)},${Math.round(pt[2] / SNAP)}`
      ptMap.set(key, true)
    }

    for (const pt of latticePoints) {
      for (const dir of basisVecs) {
        const nx = pt[0] + dir[0]
        const ny = pt[1] + dir[1]
        const nz = pt[2] + dir[2]
        const key = `${Math.round(nx / SNAP)},${Math.round(ny / SNAP)},${Math.round(nz / SNAP)}`
        if (ptMap.has(key)) {
          positions.push(pt[0], pt[1], pt[2], nx, ny, nz)
        }
      }
    }

    if (positions.length === 0) return null

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [latticePoints, basisVecs])

  if (!geometry) return null

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} opacity={opacity} transparent linewidth={1} />
    </lineSegments>
  )
}

interface LatticeDotsProps {
  latticePoints: Vec3[]
  color?: string
  opacity?: number
}

/**
 * Renders a small sphere at each lattice point using an instanced mesh.
 */
export function LatticeDots({
  latticePoints,
  color = '#7c7a72',
  opacity = 0.45,
}: LatticeDotsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    const mesh = meshRef.current
    if (!mesh) return
    latticePoints.forEach((pt, i) => {
      dummy.position.set(pt[0], pt[1], pt[2])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [latticePoints, dummy])

  if (latticePoints.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, latticePoints.length]}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </instancedMesh>
  )
}
