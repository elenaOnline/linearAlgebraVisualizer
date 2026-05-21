import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function LinearMapsThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* Original basis vectors */}
        <VectorArrow vector={[1, 0, 0]} color="#e74c3c" opacity={0.5} />
        <VectorArrow vector={[0, 1, 0]} color="#2ecc71" opacity={0.5} />
        {/* Transformed basis vectors (shear) */}
        <VectorArrow vector={[1.5, 0.5, 0]} color="#e74c3c" />
        <VectorArrow vector={[0.5, 1.5, 0]} color="#2ecc71" />
      </Scene>
    </div>
  )
}
