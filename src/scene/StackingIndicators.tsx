import { Line } from '@react-three/drei'

interface StackingSample {
  x: number
  /** Top of bottom segment / bottom of top segment */
  baseY: number
  /** Top of top segment */
  topY: number
}

interface StackingIndicatorsProps {
  samples: StackingSample[]
  colorBottom: string
  colorTop: string
  lineWidth?: number
}

export function StackingIndicators({
  samples,
  colorBottom,
  colorTop,
  lineWidth = 2,
}: StackingIndicatorsProps) {
  return (
    <>
      {samples.map((s, i) => (
        <Line
          key={`b${i}`}
          points={[
            [s.x, 0, 0],
            [s.x, s.baseY, 0],
          ]}
          color={colorBottom}
          lineWidth={lineWidth}
        />
      ))}
      {samples.map((s, i) => (
        <Line
          key={`t${i}`}
          points={[
            [s.x, s.baseY, 0],
            [s.x, s.topY, 0],
          ]}
          color={colorTop}
          lineWidth={lineWidth}
        />
      ))}
    </>
  )
}
