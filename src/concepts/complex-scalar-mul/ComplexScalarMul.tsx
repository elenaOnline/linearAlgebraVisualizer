import { useMemo } from 'react'
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
import { useComplexScalarMulStore } from './store'
import { computeComplexScalarMulGeo } from './geometry'
import { complexArg, complexMag, complexPolar } from '../../linalg/complex'
import { V1, VP } from '../../styles/colors'
import { ComplexColorKey } from '../../ui/ComplexColorKey'
import styles from './ComplexScalarMul.module.css'

function complexToColor(z: Complex): string {
  const arg = complexArg(z)
  const mag = complexMag(z)
  const h = ((arg / (2 * Math.PI)) + 1) % 1
  const l = 0.1 + 0.8 * (mag / (1 + mag))
  const s = 0.85
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

interface RotationArcProps {
  fromAngle: number
  toAngle: number
  radius: number
  color: string
}

function RotationArc({ fromAngle, toAngle, radius, color }: RotationArcProps) {
  const points = useMemo<[number, number, number][]>(() => {
    const N = 32
    const pts: [number, number, number][] = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const a = fromAngle + t * (toAngle - fromAngle)
      pts.push([radius * Math.cos(a), radius * Math.sin(a), 0])
    }
    return pts
  }, [fromAngle, toAngle, radius])
  return <Line points={points} color={color} lineWidth={2} />
}

interface ComponentPairProps {
  input: Complex
  scaled: Complex
  onDragInput: (pos: Vec3) => void
}

function ComponentPair({ input, scaled, onDragInput }: ComponentPairProps) {
  const inputMag = complexMag(input)
  const inputArg = complexArg(input)
  const scaledArg = complexArg(scaled)

  return (
    <>
      {/* Vector arrows from origin */}
      <VectorArrow vector={[input[0], input[1], 0]} color={V1} />
      <VectorArrow vector={[scaled[0], scaled[1], 0]} color={VP} />
      {/* Rotation arc */}
      {inputMag > 0.01 && (
        <RotationArc
          fromAngle={inputArg}
          toAngle={scaledArg}
          radius={inputMag}
          color={VP}
        />
      )}
      {/* Input handle (draggable) */}
      <DraggableHandle
        position={[input[0], input[1], 0]}
        onDrag={onDragInput}
        color={V1}
        radius={0.15}
        dim="2d"
      />
    </>
  )
}

export function ComplexScalarMul() {
  const { vec, c, setVec, setC } = useComplexScalarMulStore()
  const geo = computeComplexScalarMulGeo(vec, c)
  const {
    scaledZ1, scaledZ2,
    rotationAngle, scaleFactor,
    isPureRotation, cIsI, cMagIsZero, cIsPositiveReal,
  } = geo

  return (
    <div className={styles.body}>
      {/* Left: two stacked mini planes */}
      <div className={styles.leftCol}>
        {/* z₁ component */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₁ component — input (red) and c·z₁ (green)</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <ComponentPair
                input={vec[0]}
                scaled={scaledZ1}
                onDragInput={(pos) => setVec([[pos[0], pos[1]], vec[1]])}
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(z₁)</div>
              <NumberInput value={vec[0][0]} onChange={(v) => setVec([[v, vec[0][1]], vec[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(z₁)</div>
              <NumberInput value={vec[0][1]} onChange={(v) => setVec([[vec[0][0], v], vec[1]])} step={0.1} />
            </div>
          </div>
        </div>

        {/* z₂ component */}
        <div className={styles.componentCard}>
          <div className={styles.componentLabel}>z₂ component — input (red) and c·z₂ (green)</div>
          <div className={styles.miniCanvas}>
            <ArgandPlane size="mini" showUnitCircle frameloop="always">
              <ComponentPair
                input={vec[1]}
                scaled={scaledZ2}
                onDragInput={(pos) => setVec([vec[0], [pos[0], pos[1]]])}
              />
            </ArgandPlane>
          </div>
          <div className={styles.inputsRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(z₂)</div>
              <NumberInput value={vec[1][0]} onChange={(v) => setVec([vec[0], [v, vec[1][1]]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(z₂)</div>
              <NumberInput value={vec[1][1]} onChange={(v) => setVec([vec[0], [vec[1][0], v]])} step={0.1} />
            </div>
          </div>
        </div>

        {/* Scalar c controls */}
        <div className={styles.scalarCard}>
          <div className={styles.scalarCardLabel}>Scalar c</div>
          <div className={styles.scalarRow}>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Re(c)</div>
              <NumberInput value={c[0]} onChange={(v) => setC([v, c[1]])} step={0.1} />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.inputLabel}>Im(c)</div>
              <NumberInput value={c[1]} onChange={(v) => setC([c[0], v])} step={0.1} />
            </div>
          </div>
          <div className={styles.sliderSection}>
            <div className={styles.sliderLabel}>|c| ({scaleFactor.toFixed(3)})</div>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={3}
              step={0.01}
              value={scaleFactor}
              onChange={(e) => setC(complexPolar(parseFloat(e.target.value), complexArg(c)))}
            />
          </div>
          <div className={styles.sliderSection}>
            <div className={styles.sliderLabel}>angle(c) — {rotationAngle.toFixed(3)} rad</div>
            <input
              type="range"
              className={styles.slider}
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={rotationAngle}
              onChange={(e) => setC(complexPolar(complexMag(c), parseFloat(e.target.value)))}
            />
          </div>
        </div>

        <div className={styles.calloutsArea}>
          {isPureRotation && !cIsI && !cIsPositiveReal && (
            <Callout variant="info">
              |c| = 1: pure rotation — both components rotate by the same angle without scaling.
            </Callout>
          )}
          {cIsI && (
            <Callout variant="info">
              c ≈ i: quarter-turn rotation. Both components rotate 90°.
            </Callout>
          )}
          {cMagIsZero && (
            <Callout variant="warning">
              c = 0: scalar multiplication collapses the entire vector to zero.
            </Callout>
          )}
          {cIsPositiveReal && (
            <Callout variant="info">
              c is a positive real number: pure scaling with no rotation. Hue is unchanged.
            </Callout>
          )}
        </div>
      </div>

      {/* Center: combined view */}
      <div className={styles.centerCol}>
        <div className={styles.combinedCard}>
          <div className={styles.combinedLabel}>Combined view — position = z₁, color = z₂</div>
          <div className={styles.combinedCanvas}>
            <Scene dim="2d" frameloop="always">
              {/* Input vector */}
              <mesh position={[vec[0][0], vec[0][1], 0]}>
                <circleGeometry args={[0.25, 32]} />
                <meshBasicMaterial color={complexToColor(vec[1])} />
              </mesh>
              {/* Scaled vector */}
              <mesh position={[scaledZ1[0], scaledZ1[1], 0]}>
                <circleGeometry args={[0.25, 32]} />
                <meshBasicMaterial color={complexToColor(scaledZ2)} />
              </mesh>
            </Scene>
            <ComplexColorKey />
          </div>
        </div>
      </div>

      {/* Right: explanation */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Scalar Multiplication in ℂ²">
          <div className={styles.explainInner}>
            <p>
              Scalar multiplication by c ∈ ℂ applies to each component independently:
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="c \begin{pmatrix} z_1 \\ z_2 \end{pmatrix} = \begin{pmatrix} c z_1 \\ c z_2 \end{pmatrix}"
                display
              />
            </div>

            <p>
              Since c is complex, each multiplication is a rotation and scaling in the
              complex plane. Both components rotate by the <em>same</em> angle angle(c)
              and scale by the <em>same</em> factor |c| — simultaneously.
            </p>

            <p>
              In the combined view, the hue shifts by angle(c) (rotation of z₂) and the
              position changes by |c| × rotation (transformation of z₁). A positive real
              scalar only scales — no hue shift, no rotation. The unit scalar i rotates
              both components exactly 90°.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="|cz_k| = |c||z_k|, \quad \arg(cz_k) = \arg(c) + \arg(z_k)"
                display
              />
            </div>

            <ul className={styles.tryList}>
              <li>Set |c| = 1 — pure rotation, magnitudes unchanged</li>
              <li>Set angle(c) = π/2 (c = i) — quarter-turn on both components</li>
              <li>Set c = 0 — collapses the entire vector to zero</li>
              <li>Set Im(c) = 0, Re(c) &gt; 0 — no rotation, only scaling</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
