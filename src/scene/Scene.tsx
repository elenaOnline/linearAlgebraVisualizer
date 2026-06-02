import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import type { ReactNode } from 'react'
import type { Dim } from '../types'
import { Axes } from './Axes'
import { Grid } from './Grid'
import { DragProvider, useDragContext } from './DragContext'
import styles from './Scene.module.css'

interface SceneProps {
  dim: Dim
  children?: ReactNode
  frameloop?: 'always' | 'demand' | 'never'
  className?: string
  axisLabels?: [string, string] | [string, string, string]
  showGrid?: boolean
}

// Reads DragContext to disable OrbitControls while a handle is being dragged.
function SceneCanvas({ dim, children, frameloop = 'always', axisLabels, showGrid = true }: Omit<SceneProps, 'className'>) {
  const { isDragging } = useDragContext()
  return (
    <Canvas frameloop={frameloop} gl={{ antialias: true }}>
      {dim === '2d' ? (
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} near={0.01} far={1000} />
      ) : (
        <PerspectiveCamera makeDefault position={[5, 4, 7]} fov={50} near={0.01} far={1000} />
      )}

      {dim === '3d' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          makeDefault
          enabled={!isDragging}
        />
      )}

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      <Axes dim={dim} axisLabels={axisLabels} />
      {showGrid && <Grid dim={dim} />}

      {children}
    </Canvas>
  )
}

export function Scene({ dim, children, frameloop = 'always', className, axisLabels, showGrid = true }: SceneProps) {
  return (
    <DragProvider>
      <div className={`${styles.sceneContainer} ${className ?? ''}`}>
        <SceneCanvas dim={dim} frameloop={frameloop} axisLabels={axisLabels} showGrid={showGrid}>
          {children}
        </SceneCanvas>
      </div>
    </DragProvider>
  )
}
