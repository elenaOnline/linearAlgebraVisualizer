import { useMemo } from 'react'
import * as THREE from 'three'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

// Thumbnail: show a non-standard basis with its induced lattice

// Basis vectors for the thumbnail
const B1: [number, number, number] = [2, 0, 0]
const B2: [number, number, number] = [0.5, 1.5, 0]

// Pre-compute lattice: i*B1 + j*B2 for i,j in [-4..4]
function makeLattice(): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      pts.push([i * B1[0] + j * B2[0], i * B1[1] + j * B2[1], 0])
    }
  }
  return pts
}

const LATTICE_PTS = makeLattice()

function ThumbnailLattice() {
  const geometry = useMemo(() => {
    const positions: number[] = []

    const SNAP = 1e-4
    const ptMap = new Map<string, [number, number, number]>()
    for (const pt of LATTICE_PTS) {
      const key = `${Math.round(pt[0] / SNAP)},${Math.round(pt[1] / SNAP)}`
      ptMap.set(key, pt)
    }

    const dirs = [B1, B2]
    for (const pt of LATTICE_PTS) {
      for (const dir of dirs) {
        const nx = pt[0] + dir[0]
        const ny = pt[1] + dir[1]
        const key = `${Math.round(nx / SNAP)},${Math.round(ny / SNAP)}`
        if (ptMap.has(key)) {
          positions.push(pt[0], pt[1], 0)
          positions.push(nx, ny, 0)
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#f39c12" opacity={0.5} transparent />
    </lineSegments>
  )
}

export function BasisThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <ThumbnailLattice />
        <VectorArrow vector={B1} color="#f39c12" label="b₁" showLabel={false} />
        <VectorArrow vector={B2} color="#e94560" label="b₂" showLabel={false} />
      </Scene>
    </div>
  )
}
