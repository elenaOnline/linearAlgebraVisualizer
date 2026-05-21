import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function BasisThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <VectorArrow vector={[2, 0.5, 0]} color="#f39c12" label="b₁" />
        <VectorArrow vector={[0.5, 2, 0]} color="#e94560" label="b₂" />
      </Scene>
    </div>
  )
}
