import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { ReactNode } from 'react'
import { Scene } from './Scene'
import styles from './ArgandPlane.module.css'

interface ArgandPlaneProps {
  size?: 'full' | 'mini'
  showUnitCircle?: boolean
  frameloop?: 'always' | 'demand' | 'never'
  children?: ReactNode
}

function UnitCircle() {
  const points = useMemo<[number, number, number][]>(() => {
    const N = 64
    const pts: [number, number, number][] = []
    for (let i = 0; i <= N; i++) {
      const angle = (i / N) * 2 * Math.PI
      pts.push([Math.cos(angle), Math.sin(angle), 0])
    }
    return pts
  }, [])

  return <Line points={points} color="#c8c7c2" lineWidth={1} />
}

export function ArgandPlane({
  size = 'full',
  showUnitCircle = true,
  frameloop = 'always',
  children,
}: ArgandPlaneProps) {
  return (
    <Scene
      dim="2d"
      frameloop={frameloop}
      axisLabels={['Re', 'Im']}
      className={size === 'mini' ? styles.mini : undefined}
    >
      {showUnitCircle && <UnitCircle />}
      {children}
    </Scene>
  )
}
