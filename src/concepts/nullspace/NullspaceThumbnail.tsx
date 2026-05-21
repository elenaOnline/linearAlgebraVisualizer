import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

// A = [[1,2],[2,4]] — rank 1, nullspace = span([-2,1])
// Normalised direction: [-2,1,0] / sqrt(5)
const NULL_DIR: [number, number, number] = [
  -2 / Math.sqrt(5),
  1 / Math.sqrt(5),
  0,
]

export function NullspaceThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* Nullspace line in red */}
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [NULL_DIR] }}
          color="#e74c3c"
          opacity={0.8}
          dim="2d"
        />
        {/* A null vector example: [-2,1] → Ax = 0 */}
        <VectorArrow vector={[-2, 1, 0]} color="#e74c3c" opacity={0.9} />
      </Scene>
    </div>
  )
}
