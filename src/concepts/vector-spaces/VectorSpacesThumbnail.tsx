import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import { V1, VP, INK } from '../../styles/colors'
import styles from '../thumbnail.module.css'

/** Live thumbnail: line through origin with a zero-vector marker at the origin. */
export function VectorSpacesThumbnail() {
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
          {/* A line through the origin — a valid subspace */}
          <SubspaceMesh
            geometry={{ kind: 'line', directions: [[1, 1, 0]] }}
            color={VP}
            opacity={0.5}
            dim="2d"
          />
          {/* A sample vector lying in the line */}
          <VectorArrow
            vector={[1.2, 1.2, 0]}
            color={V1}
            opacity={0.9}
            showLabel={false}
          />
          {/* Zero vector marker */}
          <VectorArrow
            vector={[0, 0, 0]}
            color={INK}
            opacity={0.7}
            showLabel={false}
          />
        </Scene>
      )}
    </div>
  )
}
