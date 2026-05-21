import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { deriveLinearMapsGeometry } from './geometry'
import type { Mat2x2 } from '../../types'
import styles from '../thumbnail.module.css'

// Approx 30° rotation-ish matrix, slightly scaled
const THUMB_A: Mat2x2 = [[0.87, -0.5], [0.5, 0.87]]

interface ThumbnailGridProps {
  gridLines: Array<[Vec3, Vec3]>
}

function ThumbnailGrid({ gridLines }: ThumbnailGridProps) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const [start, end] of gridLines) {
      positions.push(start[0], start[1], start[2])
      positions.push(end[0], end[1], end[2])
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [gridLines])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#e94560" opacity={0.5} transparent linewidth={1} />
    </lineSegments>
  )
}

export function LinearMapsThumbnail() {
  const geo = deriveLinearMapsGeometry(THUMB_A, [1, 1], 1, '2d')

  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* Transformed grid */}
        <ThumbnailGrid gridLines={geo.gridLines} />

        {/* Standard basis vectors (faint) */}
        <VectorArrow vector={[1, 0, 0]} color="#e74c3c" opacity={0.3} showLabel={false} />
        <VectorArrow vector={[0, 1, 0]} color="#2ecc71" opacity={0.3} showLabel={false} />

        {/* Transformed basis vectors */}
        <VectorArrow vector={geo.col1} color="#e74c3c" showLabel={false} />
        <VectorArrow vector={geo.col2} color="#2ecc71" showLabel={false} />
      </Scene>
    </div>
  )
}
