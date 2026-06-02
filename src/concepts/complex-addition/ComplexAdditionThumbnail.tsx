import { useEffect, useRef, useState } from 'react'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { V1, V2 } from '../../styles/colors'
import styles from '../thumbnail.module.css'

export function ComplexAdditionThumbnail() {
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
            radius={0.14}
            dim="2d"
          />
          <DraggableHandle
            position={[-0.5, 0.5, 0]}
            onDrag={() => undefined}
            color={V2}
            radius={0.14}
            dim="2d"
          />
        </ArgandPlane>
      )}
    </div>
  )
}
