import { Line, Html } from '@react-three/drei'
import type { Dim } from '../types'

interface AxesProps {
  dim: Dim
  axisLabels?: [string, string] | [string, string, string]
}

const AXIS_LENGTH = 20
const LABEL_POS = 4.5

const LABEL_STYLE: React.CSSProperties = {
  color: 'var(--ink)',
  fontFamily: 'var(--font-math)',
  fontStyle: 'italic',
  fontSize: '13px',
  userSelect: 'none',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  background: 'rgba(242, 241, 239, 0.88)',
  padding: '2px 6px',
  borderRadius: '3px',
}

export function Axes({ dim, axisLabels }: AxesProps) {
  const labelX = axisLabels?.[0]
  const labelY = axisLabels?.[1]
  const labelZ = axisLabels?.[2]

  return (
    <group>
      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#1f1f1c" />
      </mesh>

      {/* X axis — vermilion (v1) */}
      <Line
        points={[
          [-AXIS_LENGTH, 0, 0],
          [AXIS_LENGTH, 0, 0],
        ]}
        color="#b14233"
        lineWidth={1.5}
      />

      {/* Y axis — prussian (v2) */}
      <Line
        points={[
          [0, -AXIS_LENGTH, 0],
          [0, AXIS_LENGTH, 0],
        ]}
        color="#1f4a73"
        lineWidth={1.5}
      />

      {/* Z axis — ochre (v3) — 3D only */}
      {dim === '3d' && (
        <Line
          points={[
            [0, 0, -AXIS_LENGTH],
            [0, 0, AXIS_LENGTH],
          ]}
          color="#a07321"
          lineWidth={1.5}
        />
      )}

      {/* Optional axis labels */}
      {labelX && (
        <Html position={[LABEL_POS, 0.2, 0]} style={LABEL_STYLE}>{labelX}</Html>
      )}
      {labelY && (
        <Html position={[0.2, LABEL_POS, 0]} style={LABEL_STYLE}>{labelY}</Html>
      )}
      {dim === '3d' && labelZ && (
        <Html position={[0.2, 0.2, LABEL_POS]} style={LABEL_STYLE}>{labelZ}</Html>
      )}
    </group>
  )
}
