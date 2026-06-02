import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { V1, V2 } from '../../styles/colors'
import styles from '../thumbnail.module.css'

// Pre-set values for the thumbnail: a=1.5, b=1
const A = 1.5
const B = 1
const VEC: [number, number, number] = [A, B, 0]

function ThumbnailGraph() {
  const fn = useMemo(() => (x: number) => B + A * x, [])
  return <FunctionGraph fn={fn} xMin={-4} xMax={4} color={V2} lineWidth={2} />
}

export function IsomorphismThumbnail() {
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
          {/* Show the R² vector */}
          <VectorArrow vector={VEC} color={V1} showLabel={false} />
          {/* Show the function graph overlay */}
          <ThumbnailGraph />
        </Scene>
      )}
    </div>
  )
}
