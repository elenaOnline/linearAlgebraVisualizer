import { useEffect, useRef, useState } from 'react'
import { Scene } from '../../scene/Scene'
import { DomainColoringMesh } from '../../scene/DomainColoringMesh'
import type { Complex } from '../../types'
import { evalComplexPoly } from '../../linalg/complex'
import styles from '../thumbnail.module.css'

// Stable fn reference: z² (a2=[1,0], a1=[0,0], a0=[0,0])
const ZERO: Complex = [0, 0]
const ONE: Complex = [1, 0]
const COEFFS: Complex[] = [ZERO, ZERO, ONE]

function zSquaredFn(z: Complex): Complex {
  return evalComplexPoly(COEFFS, z)
}

const BOUNDS = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }

export function ComplexPolyThumbnail() {
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
        <Scene dim="2d" frameloop="demand">
          <DomainColoringMesh
            fn={zSquaredFn}
            bounds={BOUNDS}
            resolution={64}
            mode="2d"
          />
        </Scene>
      )}
    </div>
  )
}
