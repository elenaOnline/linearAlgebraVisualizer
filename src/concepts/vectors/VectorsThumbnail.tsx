import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { V1, V2, VP } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// Pre-set vectors for the thumbnail: u=[2,1], v=[0,2]
const U: [number, number, number] = [2, 1, 0]
const V: [number, number, number] = [0, 2, 0]
// sum = [2, 3, 0]
const SUM: [number, number, number] = [2, 3, 0]

export function VectorsThumbnail() {
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
          {/* u — vermilion (v1) */}
          <VectorArrow vector={U} color={V1} label="u" showLabel />

          {/* v — prussian (v2) */}
          <VectorArrow vector={V} color={V2} label="v" showLabel />

          {/* sum — forest (vp, derived) */}
          <VectorArrow vector={SUM} color={VP} label="u+v" showLabel />

          {/* tip-to-tail ghost: v translated to tip of u */}
          <group position={U}>
            <VectorArrow vector={V} color={V2} opacity={0.35} showLabel={false} />
          </group>
        </Scene>
      )}
    </div>
  )
}
