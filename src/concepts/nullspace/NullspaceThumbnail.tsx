import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import styles from '../thumbnail.module.css'

export function NullspaceThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [[1, -1, 0]] }}
          color="#e74c3c"
          opacity={0.7}
          dim="2d"
        />
      </Scene>
    </div>
  )
}
