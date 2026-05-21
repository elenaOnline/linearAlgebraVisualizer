import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import styles from '../thumbnail.module.css'

export function VectorSpacesThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [[1, 1, 0]] }}
          color="#1abc9c"
          opacity={0.6}
          dim="2d"
        />
      </Scene>
    </div>
  )
}
