import type { Vec3 } from '../../types'
import type { Complex } from '../../types'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useComplexVectorsStore } from './store'
import { computeComplexVectorsGeo } from './geometry'
import { complexArg, complexMag } from '../../linalg/complex'
import { V1, V2 } from '../../styles/colors'
import styles from './ComplexVectors.module.css'

function complexToColor(z: Complex): string {
  const arg = complexArg(z)
  const mag = complexMag(z)
  const h = ((arg / (2 * Math.PI)) + 1) % 1
  const l = 0.1 + 0.8 * (mag / (1 + mag))
  const s = 0.85
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

export function ComplexVectors() {
  const { vec, setVec } = useComplexVectorsStore()
  const geo = computeComplexVectorsGeo(vec)
  const { z1, z2, z2IsZero, vecIsZero, combinedPos } = geo

  const handleDragZ1 = (pos: Vec3) => setVec([[pos[0], pos[1]], vec[1]])
  const handleDragZ2 = (pos: Vec3) => setVec([vec[0], [pos[0], pos[1]]])
  const handleDragCombined = (pos: Vec3) => setVec([[pos[0], pos[1]], vec[1]])

  const dotColor = complexToColor(z2)

  return (
    <div className={styles.body}>
      {/* Left: two stacked mini planes */}
      <div className={styles.leftCol}>
        {/* z₁ plane */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₁ — first component</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <VectorArrow vector={[z1[0], z1[1], 0]} color={V1} />
              <DraggableHandle
                position={[z1[0], z1[1], 0]}
                onDrag={handleDragZ1}
                color={V1}
                radius={0.15}
                dim="2d"
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(z₁)</div>
              <NumberInput value={z1[0]} onChange={(v) => setVec([[v, z1[1]], vec[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(z₁)</div>
              <NumberInput value={z1[1]} onChange={(v) => setVec([[z1[0], v], vec[1]])} step={0.1} />
            </div>
          </div>
        </div>

        {/* z₂ plane */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₂ — second component</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <VectorArrow vector={[z2[0], z2[1], 0]} color={V2} />
              <DraggableHandle
                position={[z2[0], z2[1], 0]}
                onDrag={handleDragZ2}
                color={V2}
                radius={0.15}
                dim="2d"
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(z₂)</div>
              <NumberInput value={z2[0]} onChange={(v) => setVec([vec[0], [v, z2[1]]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(z₂)</div>
              <NumberInput value={z2[1]} onChange={(v) => setVec([vec[0], [z2[0], v]])} step={0.1} />
            </div>
          </div>
        </div>

        <div className={styles.calloutsArea}>
          {z2IsZero && (
            <Callout variant="warning">
              z₂ = 0: the color is black — the second component is zero.
            </Callout>
          )}
          {vecIsZero && (
            <Callout variant="warning">
              Zero vector in ℂ²: both components vanish.
            </Callout>
          )}
        </div>
      </div>

      {/* Center: combined view */}
      <div className={styles.centerCol}>
        <div className={styles.combinedCard}>
          <div className={styles.combinedLabel}>Combined view — position encodes z₁, color encodes z₂</div>
          <div className={styles.combinedCanvas}>
            <Scene dim="2d" frameloop="always">
              {/* Color-encoded circle at position z₁ */}
              <mesh position={[combinedPos[0], combinedPos[1], 0]}>
                <circleGeometry args={[0.25, 32]} />
                <meshBasicMaterial color={dotColor} />
              </mesh>
              {/* Draggable handle — updates z₁ */}
              <DraggableHandle
                position={[combinedPos[0], combinedPos[1], 0]}
                onDrag={handleDragCombined}
                color={dotColor}
                radius={0.18}
                dim="2d"
              />
            </Scene>
            <div className={styles.colorLegend}>
              Hue = arg(z₂)<br />
              Brightness = |z₂|
            </div>
          </div>
        </div>
      </div>

      {/* Right: explanation */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Vectors in ℂ²">
          <div className={styles.explainInner}>
            <p>
              A vector in ℂ² is an ordered pair of complex numbers:
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="\mathbf{v} = \begin{pmatrix} z_1 \\ z_2 \end{pmatrix}, \quad z_1, z_2 \in \mathbb{C}" display />
            </div>

            <p>
              Since each complex number has two real coordinates, a vector in ℂ²
              has <strong>four real degrees of freedom</strong>. You cannot fully
              visualize it in two dimensions simultaneously.
            </p>

            <p>
              The left panels each show one complex component in its own plane.
              The right panel encodes both simultaneously: <em>position</em> represents
              z₁ and <em>color</em> (hue + brightness) represents z₂.
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="\dim_{\mathbb{R}}(\mathbb{C}^2) = 4" display />
            </div>

            <p>
              The color encoding is an honest compression, not a simplification:
              every distinct z₂ produces a unique hue/brightness combination.
              Black means z₂ = 0.
            </p>

            <ul className={styles.tryList}>
              <li>Drag in the z₁ panel — the dot in the combined view moves</li>
              <li>Drag in the z₂ panel — the dot changes color, not position</li>
              <li>Set z₂ = 0 — the dot turns black</li>
              <li>Drag in the combined view — it updates z₁ (position only)</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
