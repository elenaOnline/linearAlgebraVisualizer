import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function DimensionThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [[1, 0.5, 0]] }}
          color="#1abc9c"
          opacity={0.5}
          dim="2d"
        />
        <VectorArrow vector={[2, 1, 0]} color="#f39c12" />
      </Scene>
    </div>
  )
}
