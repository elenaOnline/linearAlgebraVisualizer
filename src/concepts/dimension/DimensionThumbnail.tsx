import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import { V1, V2, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

export function DimensionThumbnail() {
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
          {/* Span: the full plane (dim=2) shown as two directions */}
          <SubspaceMesh
            geometry={{ kind: 'plane', directions: [[1, 0, 0], [0, 1, 0]] }}
            color={VP}
            opacity={0.18}
            dim="2d"
          />
          {/* Two independent vectors — vermilion and prussian */}
          <VectorArrow vector={[2, 0, 0]} color={V1} showLabel={false} />
          <VectorArrow vector={[0, 2, 0]} color={V2} showLabel={false} />
        </Scene>
      )}
    </div>
  )
}
