import { useEffect, useRef, useState } from 'react'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { V1 } from '../../styles/colors'
import styles from '../thumbnail.module.css'

export function ComplexVectorsThumbnail() {
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
        <ArgandPlane size="mini" showUnitCircle frameloop="demand">
          <DraggableHandle
            position={[1, 0, 0]}
            onDrag={() => undefined}
            color={V1}
            radius={0.15}
            dim="2d"
          />
        </ArgandPlane>
      )}
    </div>
  )
}
