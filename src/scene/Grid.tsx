import type { Dim } from '../types'

interface GridProps {
  dim: Dim
}

const GRID_SIZE = 40
const GRID_DIVISIONS = 40

export function Grid({ dim }: GridProps) {
  if (dim === '2d') {
    // 2D: grid in XY plane (rotate gridHelper from XZ to XY)
    return (
      <gridHelper
        args={[GRID_SIZE, GRID_DIVISIONS, '#3a3a5c', '#2a2a4a']}
        rotation={[Math.PI / 2, 0, 0]}
      />
    )
  }
  // 3D: standard XZ grid
  return <gridHelper args={[GRID_SIZE, GRID_DIVISIONS, '#3a3a5c', '#2a2a4a']} />
}
