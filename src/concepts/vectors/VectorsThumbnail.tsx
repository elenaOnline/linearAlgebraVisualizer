import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import styles from '../thumbnail.module.css'

// Pre-set vectors for the thumbnail: u=[2,1], v=[0,2]
const U: [number, number, number] = [2, 1, 0]
const V: [number, number, number] = [0, 2, 0]
// sum = [2, 3, 0]
const SUM: [number, number, number] = [2, 3, 0]

export function VectorsThumbnail() {
  return (
    <div className={styles.thumbnail}>
      <Scene dim="2d" frameloop="demand">
        {/* u — orange */}
        <VectorArrow vector={U} color="#e67e22" label="u" showLabel />

        {/* v — purple */}
        <VectorArrow vector={V} color="#9b59b6" label="v" showLabel />

        {/* sum — green */}
        <VectorArrow vector={SUM} color="#2ecc71" label="u+v" showLabel />

        {/* tip-to-tail ghost: v translated to tip of u */}
        <group position={U}>
          <VectorArrow vector={V} color="#9b59b6" opacity={0.35} showLabel={false} />
        </group>
      </Scene>
    </div>
  )
}
