import { Line } from '@react-three/drei'
import type { Dim } from '../types'

interface AxesProps {
  dim: Dim
}

const AXIS_LENGTH = 20

export function Axes({ dim }: AxesProps) {
  return (
    <group>
      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* X axis — red */}
      <Line
        points={[
          [-AXIS_LENGTH, 0, 0],
          [AXIS_LENGTH, 0, 0],
        ]}
        color="#e74c3c"
        lineWidth={1.5}
      />

      {/* Y axis — green */}
      <Line
        points={[
          [0, -AXIS_LENGTH, 0],
          [0, AXIS_LENGTH, 0],
        ]}
        color="#2ecc71"
        lineWidth={1.5}
      />

      {/* Z axis — blue (3D only) */}
      {dim === '3d' && (
        <Line
          points={[
            [0, 0, -AXIS_LENGTH],
            [0, 0, AXIS_LENGTH],
          ]}
          color="#3498db"
          lineWidth={1.5}
        />
      )}
    </group>
  )
}
