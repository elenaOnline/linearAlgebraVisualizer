import { useMemo } from 'react'
import { Line } from '@react-three/drei'

interface FunctionGraphProps {
  fn: (x: number) => number
  xMin: number
  xMax: number
  color?: string
  samples?: number
  lineWidth?: number
}

const Y_CLAMP = 20

export function FunctionGraph({
  fn,
  xMin,
  xMax,
  color = '#b14233',
  samples = 300,
  lineWidth = 2,
}: FunctionGraphProps) {
  const points = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= samples; i++) {
      const x = xMin + (i / samples) * (xMax - xMin)
      const raw = fn(x)
      const y = isFinite(raw) ? Math.max(-Y_CLAMP, Math.min(Y_CLAMP, raw)) : 0
      pts.push([x, y, 0])
    }
    return pts
  }, [fn, xMin, xMax, samples])

  return <Line points={points} color={color} lineWidth={lineWidth} />
}
