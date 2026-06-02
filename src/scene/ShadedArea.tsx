import * as THREE from 'three'
import { useMemo } from 'react'

interface Props {
  lower: [number, number][]
  upper: [number, number][]
  color: string
  opacity?: number
}

export function ShadedArea({ lower, upper, color, opacity = 0.25 }: Props) {
  const geometry = useMemo(() => {
    const n = Math.min(lower.length, upper.length)
    if (n < 2) return new THREE.BufferGeometry()

    // For each adjacent pair of positions i and i+1, emit 2 triangles:
    //   triangle 1: lower[i], upper[i], upper[i+1]
    //   triangle 2: lower[i], upper[i+1], lower[i+1]
    const positions: number[] = []

    for (let i = 0; i < n - 1; i++) {
      const [x0l, y0l] = lower[i]
      const [x1l, y1l] = lower[i + 1]
      const [x0u, y0u] = upper[i]
      const [x1u, y1u] = upper[i + 1]

      // Triangle 1
      positions.push(x0l, y0l, 0)
      positions.push(x0u, y0u, 0)
      positions.push(x1u, y1u, 0)

      // Triangle 2
      positions.push(x0l, y0l, 0)
      positions.push(x1u, y1u, 0)
      positions.push(x1l, y1l, 0)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [lower, upper])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
