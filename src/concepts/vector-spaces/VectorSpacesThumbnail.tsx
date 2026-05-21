import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

/** Live thumbnail: line through origin with a zero-vector marker at the origin. */
export function VectorSpacesThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* A line through the origin — a valid subspace */}
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [[1, 1, 0]] }}
          color="#1abc9c"
          opacity={0.6}
          dim="2d"
        />
        {/* A sample vector lying in the line */}
        <VectorArrow
          vector={[1.2, 1.2, 0]}
          color="#e67e22"
          opacity={0.9}
          showLabel={false}
        />
        {/* Zero vector marker */}
        <VectorArrow
          vector={[0, 0, 0]}
          color="#ffffff"
          opacity={0.7}
          showLabel={false}
        />
      </Scene>
    </div>
  )
}
