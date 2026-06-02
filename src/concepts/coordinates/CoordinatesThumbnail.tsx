import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { V1, V2, V3 } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// Pre-set thumbnail state
const VEC: [number, number, number] = [1, 1, 0]
const V1_VEC: [number, number, number] = [1, 0.5, 0]
const V2_VEC: [number, number, number] = [0.5, 1, 0]

export function CoordinatesThumbnail() {
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
          {/* Custom basis vectors */}
          <VectorArrow vector={V1_VEC} color={V2} label="v₁" showLabel />
          <VectorArrow vector={V2_VEC} color={V3} label="v₂" showLabel />
          {/* The abstract vector */}
          <VectorArrow vector={VEC} color={V1} label="v" showLabel />
        </Scene>
      )}
    </div>
  )
}
