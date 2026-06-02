import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { V1 } from '../../styles/colors'
import styles from '../thumbnail.module.css'

const POINT: [number, number, number] = [0, 1, 0.5]

export function PolySpaceThumbnail() {
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
      { rootMargin: '100px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={styles.thumbnail}>
      {mounted && (
        <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="demand">
          <DraggableHandle
            position={POINT}
            onDrag={() => undefined}
            color={V1}
            radius={0.15}
            dim="3d"
          />
        </Scene>
      )}
    </div>
  )
}
