import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function SpanThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <SubspaceMesh
          geometry={{ kind: 'plane', directions: [[1, 0, 0], [0, 1, 0]] }}
          color="#1abc9c"
          opacity={0.2}
          dim="2d"
        />
        <VectorArrow vector={[2, 1, 0]} color="#e67e22" />
        <VectorArrow vector={[0, 2, 0]} color="#9b59b6" />
      </Scene>
    </div>
  )
}
