import { useEffect, useRef, useState } from 'react'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { computeComplexScalarMulGeo } from './geometry'
import { V1, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// Initial state: vec=[[1,0],[0,1]], c=[0.7,0.7]
const INIT_VEC: [[number, number], [number, number]] = [[1, 0], [0, 1]]
const INIT_C: [number, number] = [0.7, 0.7]
const GEO = computeComplexScalarMulGeo(INIT_VEC, INIT_C)

export function ComplexScalarMulThumbnail() {
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
          {/* Input z₁ */}
          <DraggableHandle
            position={[INIT_VEC[0][0], INIT_VEC[0][1], 0]}
            onDrag={() => undefined}
            color={V1}
            radius={0.15}
            dim="2d"
          />
          {/* Scaled z₁ result */}
          <mesh position={[GEO.scaledZ1[0], GEO.scaledZ1[1], 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color={VP} />
          </mesh>
        </ArgandPlane>
      )}
    </div>
  )
}
