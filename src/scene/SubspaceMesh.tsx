import { useMemo } from 'react'
import * as THREE from 'three'
import type { SubspaceGeometry, Dim } from '../types'
import { normalize } from '../linalg/vector'

interface SubspaceMeshProps {
  geometry: SubspaceGeometry
  color?: string
  opacity?: number
  dim: Dim
}

const LINE_EXTENT = 25
const PLANE_EXTENT = 25

export function SubspaceMesh({
  geometry,
  color = '#1abc9c',
  opacity = 0.35,
  dim: _dim,
}: SubspaceMeshProps) {
  const { kind, directions = [] } = geometry

  const lineGeom = useMemo(() => {
    if (kind !== 'line' || directions.length === 0) return null
    const dir = normalize(directions[0])
    const start = new THREE.Vector3(
      -dir[0] * LINE_EXTENT,
      -dir[1] * LINE_EXTENT,
      -dir[2] * LINE_EXTENT,
    )
    const end = new THREE.Vector3(
      dir[0] * LINE_EXTENT,
      dir[1] * LINE_EXTENT,
      dir[2] * LINE_EXTENT,
    )
    const geom = new THREE.BufferGeometry().setFromPoints([start, end])
    return geom
  }, [kind, directions])

  const planeGeom = useMemo(() => {
    if (kind !== 'plane' || directions.length < 2) return null
    const u = normalize(directions[0])
    const v = normalize(directions[1])

    const vertices: number[] = []
    const indices: number[] = []

    // Build a large quad in the plane spanned by u and v
    // Four corners: ±PLANE_EXTENT * u ± PLANE_EXTENT * v
    const corners = [
      [
        u[0] * PLANE_EXTENT + v[0] * PLANE_EXTENT,
        u[1] * PLANE_EXTENT + v[1] * PLANE_EXTENT,
        u[2] * PLANE_EXTENT + v[2] * PLANE_EXTENT,
      ],
      [
        u[0] * PLANE_EXTENT - v[0] * PLANE_EXTENT,
        u[1] * PLANE_EXTENT - v[1] * PLANE_EXTENT,
        u[2] * PLANE_EXTENT - v[2] * PLANE_EXTENT,
      ],
      [
        -u[0] * PLANE_EXTENT - v[0] * PLANE_EXTENT,
        -u[1] * PLANE_EXTENT - v[1] * PLANE_EXTENT,
        -u[2] * PLANE_EXTENT - v[2] * PLANE_EXTENT,
      ],
      [
        -u[0] * PLANE_EXTENT + v[0] * PLANE_EXTENT,
        -u[1] * PLANE_EXTENT + v[1] * PLANE_EXTENT,
        -u[2] * PLANE_EXTENT + v[2] * PLANE_EXTENT,
      ],
    ]

    for (const c of corners) {
      vertices.push(...c)
    }
    indices.push(0, 1, 2, 0, 2, 3)

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [kind, directions])

  if (kind === 'point') {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent />
      </mesh>
    )
  }

  if (kind === 'line' && lineGeom) {
    return (
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial color={color} opacity={opacity} transparent linewidth={2} />
      </lineSegments>
    )
  }

  if (kind === 'plane' && planeGeom) {
    return (
      <mesh geometry={planeGeom}>
        <meshBasicMaterial
          color={color}
          opacity={opacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    )
  }

  if (kind === 'space') {
    // Whole space: render a large transparent box to indicate full volume
    return (
      <mesh>
        <boxGeometry args={[PLANE_EXTENT, PLANE_EXTENT, PLANE_EXTENT]} />
        <meshBasicMaterial
          color={color}
          opacity={0.05}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    )
  }

  return null
}
