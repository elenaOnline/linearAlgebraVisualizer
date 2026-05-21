import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Vec3 } from '../types'
import { norm } from '../linalg/vector'

interface VectorArrowProps {
  vector: Vec3
  color?: string
  opacity?: number
  label?: string
  showLabel?: boolean
}

const MIN_DRAW_LENGTH = 1e-6

function setMaterialProps(
  mat: THREE.Material | THREE.Material[],
  opacity: number,
  color: THREE.ColorRepresentation,
) {
  const mats = Array.isArray(mat) ? mat : [mat]
  for (const m of mats) {
    if (m instanceof THREE.LineBasicMaterial || m instanceof THREE.MeshBasicMaterial) {
      m.opacity = opacity
      m.transparent = opacity < 1
      m.color.set(color)
    } else if ('opacity' in m && 'transparent' in m && 'color' in m) {
      // generic fallback
      ;(m as THREE.MeshBasicMaterial).opacity = opacity
      ;(m as THREE.MeshBasicMaterial).transparent = opacity < 1
    }
  }
}

export function VectorArrow({
  vector,
  color = '#e67e22',
  opacity = 1,
  label,
  showLabel = true,
}: VectorArrowProps) {
  const arrowRef = useRef<THREE.ArrowHelper>(null)
  const { scene } = useThree()
  const length = norm(vector)

  useEffect(() => {
    if (arrowRef.current) {
      setMaterialProps(arrowRef.current.line.material, opacity, color)
      setMaterialProps(arrowRef.current.cone.material, opacity, color)
      arrowRef.current.setColor(new THREE.Color(color))
    }
  }, [color, opacity, scene])

  if (length < MIN_DRAW_LENGTH) {
    // Zero vector: render as a small sphere at origin
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent={opacity < 1} />
      </mesh>
    )
  }

  const dir = new THREE.Vector3(vector[0], vector[1], vector[2]).normalize()
  const headLength = Math.min(0.3, length * 0.25)
  const headWidth = headLength * 0.5

  return (
    <>
      <arrowHelper
        ref={arrowRef}
        args={[dir, new THREE.Vector3(0, 0, 0), length, color, headLength, headWidth]}
      />
      {showLabel && label && (
        <Html
          position={[
            vector[0] * 1.1 + 0.1,
            vector[1] * 1.1 + 0.1,
            vector[2] * 1.1 + 0.1,
          ]}
          style={{ color, fontFamily: 'var(--font-mono)', fontSize: '13px', userSelect: 'none' }}
        >
          {label}
        </Html>
      )}
    </>
  )
}
