import { Line } from '@react-three/drei'
import type { Vec3, Complex } from '../../types'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useComplexAdditionStore } from './store'
import { computeComplexAdditionGeo } from './geometry'
import { complexArg, complexMag } from '../../linalg/complex'
import { V1, V2, VP } from '../../styles/colors'
import { ComplexColorKey } from '../../ui/ComplexColorKey'
import styles from './ComplexAddition.module.css'

function complexToColor(z: Complex): string {
  const arg = complexArg(z)
  const mag = complexMag(z)
  const h = ((arg / (2 * Math.PI)) + 1) % 1
  const l = 0.1 + 0.8 * (mag / (1 + mag))
  const s = 0.85
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

interface ComponentPlaneProps {
  uComp: Complex
  vComp: Complex
  sumComp: Complex
  onDragU: (pos: Vec3) => void
  onDragV: (pos: Vec3) => void
}

function ComponentPlane({ uComp, vComp, sumComp, onDragU, onDragV }: ComponentPlaneProps) {
  // Tip-to-tail displacement: v displaced from u tip to sum
  const vDisplaced: [number, number, number][] = [
    [uComp[0], uComp[1], 0],
    [sumComp[0], sumComp[1], 0],
  ]

  return (
    <>
      {/* Vectors from origin */}
      <VectorArrow vector={[uComp[0], uComp[1], 0]} color={V1} />
      <VectorArrow vector={[vComp[0], vComp[1], 0]} color={V2} />
      <VectorArrow vector={[sumComp[0], sumComp[1], 0]} color={VP} />
      {/* Tip-to-tail construction: displaced v from u tip */}
      <Line points={vDisplaced} color={V2} lineWidth={1.5} />
      {/* Handles */}
      <DraggableHandle
        position={[uComp[0], uComp[1], 0]}
        onDrag={onDragU}
        color={V1}
        radius={0.14}
        dim="2d"
      />
      <DraggableHandle
        position={[vComp[0], vComp[1], 0]}
        onDrag={onDragV}
        color={V2}
        radius={0.14}
        dim="2d"
      />
    </>
  )
}

export function ComplexAddition() {
  const { u, v, setU, setV } = useComplexAdditionStore()
  const geo = computeComplexAdditionGeo(u, v)
  const { sumZ1, sumZ2, sumIsZero, uEqualsV } = geo

  return (
    <div className={styles.body}>
      {/* Left: two stacked mini planes */}
      <div className={styles.leftCol}>
        {/* z₁ component plane */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₁ components — u[0], v[0], sum[0]</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <ComponentPlane
                uComp={u[0]}
                vComp={v[0]}
                sumComp={sumZ1}
                onDragU={(pos) => setU([[pos[0], pos[1]], u[1]])}
                onDragV={(pos) => setV([[pos[0], pos[1]], v[1]])}
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(u₁)</div>
              <NumberInput value={u[0][0]} onChange={(val) => setU([[val, u[0][1]], u[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(u₁)</div>
              <NumberInput value={u[0][1]} onChange={(val) => setU([[u[0][0], val], u[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(v₁)</div>
              <NumberInput value={v[0][0]} onChange={(val) => setV([[val, v[0][1]], v[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(v₁)</div>
              <NumberInput value={v[0][1]} onChange={(val) => setV([[v[0][0], val], v[1]])} step={0.1} />
            </div>
          </div>
        </div>

        {/* z₂ component plane */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₂ components — u[1], v[1], sum[1]</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <ComponentPlane
                uComp={u[1]}
                vComp={v[1]}
                sumComp={sumZ2}
                onDragU={(pos) => setU([u[0], [pos[0], pos[1]]])}
                onDragV={(pos) => setV([v[0], [pos[0], pos[1]]])}
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(u₂)</div>
              <NumberInput value={u[1][0]} onChange={(val) => setU([u[0], [val, u[1][1]]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(u₂)</div>
              <NumberInput value={u[1][1]} onChange={(val) => setU([u[0], [u[1][0], val]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(v₂)</div>
              <NumberInput value={v[1][0]} onChange={(val) => setV([v[0], [val, v[1][1]]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(v₂)</div>
              <NumberInput value={v[1][1]} onChange={(val) => setV([v[0], [v[1][0], val]])} step={0.1} />
            </div>
          </div>
        </div>

        <div className={styles.calloutsArea}>
          {sumIsZero && (
            <Callout variant="info">
              The sum is the zero vector in ℂ².
            </Callout>
          )}
          {uEqualsV && (
            <Callout variant="info">
              u = v, so u + v = 2u.
            </Callout>
          )}
        </div>
      </div>

      {/* Center: combined view */}
      <div className={styles.centerCol}>
        <div className={styles.combinedCard}>
          <div className={styles.combinedLabel}>Combined view — position = z₁, color = z₂ component</div>
          <div className={styles.combinedCanvas}>
            <Scene dim="2d" frameloop="always">
              {/* u circle */}
              <mesh position={[u[0][0], u[0][1], 0]}>
                <circleGeometry args={[0.22, 32]} />
                <meshBasicMaterial color={complexToColor(u[1])} />
              </mesh>
              {/* v circle */}
              <mesh position={[v[0][0], v[0][1], 0]}>
                <circleGeometry args={[0.22, 32]} />
                <meshBasicMaterial color={complexToColor(v[1])} />
              </mesh>
              {/* sum circle */}
              <mesh position={[sumZ1[0], sumZ1[1], 0]}>
                <circleGeometry args={[0.22, 32]} />
                <meshBasicMaterial color={complexToColor(sumZ2)} />
              </mesh>
            </Scene>
            <ComplexColorKey />
          </div>
        </div>

        <Callout variant="warning">
          The combined view is less readable for addition — hue does not add the way position does.
        </Callout>
      </div>

      {/* Right: explanation */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Addition in ℂ²">
          <div className={styles.explainInner}>
            <p>
              Addition in ℂ² works component-by-component, and each component addition
              is complex addition in ℂ:
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\begin{pmatrix} u_1 \\ u_2 \end{pmatrix} + \begin{pmatrix} v_1 \\ v_2 \end{pmatrix} = \begin{pmatrix} u_1 + v_1 \\ u_2 + v_2 \end{pmatrix}"
                display
              />
            </div>

            <p>
              Each component addition is a tip-to-tail vector construction in its own
              complex plane (shown left). The two planes are <em>independent</em> —
              adding z₁ components never affects z₂ components and vice versa.
            </p>

            <p>
              In the left panels: red is u's component, blue is v's component
              displaced from the red tip (tip-to-tail), green dot is the sum.
            </p>

            <ul className={styles.tryList}>
              <li>Drag u or v handles — both planes update simultaneously</li>
              <li>Make u = −v to collapse both sums to the origin</li>
              <li>Set u = v — the sum doubles each component</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
