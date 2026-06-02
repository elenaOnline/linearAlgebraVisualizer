import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { V1, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// Pre-set point in P₂ for the thumbnail: (0, 2, 1)
const INPUT_POINT: [number, number, number] = [0, 2, 1]
const KERNEL_DIR: [number, number, number] = [1, 0, 0]

export function DifferentiationThumbnail() {
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
        <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="demand">
          {/* Kernel line along the "1" axis */}
          <SubspaceMesh
            geometry={{ kind: 'line', directions: [KERNEL_DIR] }}
            color={VP}
            opacity={0.5}
            dim="3d"
          />
          {/* Input polynomial as a point */}
          <DraggableHandle
            position={INPUT_POINT}
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
