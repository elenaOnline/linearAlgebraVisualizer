import { useEffect, useRef, useState } from 'react'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { computeComplexPlaneGeo } from './geometry'
import { V1, V2, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

const INIT_Z: [number, number] = [1.5, 0]
const INIT_C: [number, number] = [0.7, 0.7]
const GEO = computeComplexPlaneGeo(INIT_Z, INIT_C)

export function ComplexPlaneThumbnail() {
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
        <ArgandPlane size="full" showUnitCircle frameloop="demand">
          <DraggableHandle
            position={[INIT_Z[0], INIT_Z[1], 0]}
            onDrag={() => undefined}
            color={V1}
            radius={0.15}
            dim="2d"
          />
          <DraggableHandle
            position={[INIT_C[0], INIT_C[1], 0]}
            onDrag={() => undefined}
            color={V2}
            radius={0.15}
            dim="2d"
          />
          <mesh position={[GEO.product[0], GEO.product[1], 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={VP} />
          </mesh>
        </ArgandPlane>
      )}
    </div>
  )
}
