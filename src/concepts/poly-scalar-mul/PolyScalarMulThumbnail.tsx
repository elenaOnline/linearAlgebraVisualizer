import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { V1, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

const P_POS: [number, number, number] = [0, 1, 0.5]
const SCALED_POS: [number, number, number] = [0, 2, 1]

export function PolyScalarMulThumbnail() {
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
            position={P_POS}
            onDrag={() => undefined}
            color={V1}
            radius={0.15}
            dim="3d"
          />
          <mesh position={SCALED_POS}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color={VP} />
          </mesh>
        </Scene>
      )}
    </div>
  )
}
