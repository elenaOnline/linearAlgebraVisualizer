import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import { VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// A = [[1,2],[2,4]] — rank 1, nullspace = span([-2,1])
// Normalised direction: [-2,1,0] / sqrt(5)
const NULL_DIR: [number, number, number] = [
  -2 / Math.sqrt(5),
  1 / Math.sqrt(5),
  0,
]

export function NullspaceThumbnail() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={styles.thumbnail}>
      {mounted && (
        <Scene dim="2d" frameloop="demand">
          {/* Nullspace line — forest (vp, derived subspace) */}
          <SubspaceMesh
            geometry={{ kind: 'line', directions: [NULL_DIR] }}
            color={VP}
            opacity={0.7}
            dim="2d"
          />
          {/* A null vector example: [-2,1] → Ax = 0 */}
          <VectorArrow vector={[-2, 1, 0]} color={VP} opacity={0.9} />
        </Scene>
      )}
    </div>
  )
}
