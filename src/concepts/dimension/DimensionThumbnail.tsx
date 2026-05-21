import { Scene } from '../../scene/Scene'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function DimensionThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* Span: the full plane (dim=2) shown as two directions */}
        <SubspaceMesh
          geometry={{ kind: 'plane', directions: [[1, 0, 0], [0, 1, 0]] }}
          color="#1abc9c"
          opacity={0.25}
          dim="2d"
        />
        {/* Two independent vectors — one orange, one purple */}
        <VectorArrow vector={[2, 0, 0]} color="#e67e22" showLabel={false} />
        <VectorArrow vector={[0, 2, 0]} color="#9b59b6" showLabel={false} />
      </Scene>
    </div>
  )
}
