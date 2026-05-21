import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

export function VectorsThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        <VectorArrow vector={[2, 1, 0]} color="#e67e22" label="u" />
        <VectorArrow vector={[1, 2, 0]} color="#9b59b6" label="v" />
      </Scene>
    </div>
  )
}
