import { useMemo } from 'react'
import { toVec3 } from '../../linalg/vector'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Panel } from '../../ui/Panel'
import { VectorInput } from '../../ui/VectorInput'
import { Slider } from '../../ui/Slider'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import type { Dim, Vec, Vec3 } from '../../types'
import { useVectorSpacesStore } from './store'
import type { CandidateType } from './store'
import { deriveVectorSpacesGeometry } from './geometry'
import { CANDIDATE, VEC_A, VEC_B, VEC_SUM, VEC_SCALAR, OFFSET } from '../../styles/colors'
import styles from './VectorSpaces.module.css'

// ---------------------------------------------------------------------------
// Colour palette for the visualization
// ---------------------------------------------------------------------------
const COLOR_CANDIDATE = CANDIDATE   // teal — the candidate subspace
const COLOR_A         = VEC_A       // orange — vector a
const COLOR_B         = VEC_B       // purple — vector b
const COLOR_SUM       = VEC_SUM     // blue — a+b
const COLOR_SCALAR    = VEC_SCALAR  // yellow — c*a
const COLOR_OFFSET    = OFFSET      // red — offset point marker

// ---------------------------------------------------------------------------
// Candidate type metadata
// ---------------------------------------------------------------------------
interface CandidateOption {
  value: CandidateType
  label: string
  requires3D?: boolean
}

const CANDIDATE_OPTIONS: CandidateOption[] = [
  { value: 'zero',         label: '{0}' },
  { value: 'line',         label: 'Line through origin' },
  { value: 'plane',        label: 'Plane through origin', requires3D: true },
  { value: 'whole-space',  label: 'Whole space' },
  { value: 'offset-line',  label: 'Offset line (non-example)' },
  { value: 'offset-plane', label: 'Offset plane (non-example)', requires3D: true },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ConditionIconProps { pass: boolean }
function ConditionIcon({ pass }: ConditionIconProps) {
  return (
    <span className={`${styles.conditionIcon} ${pass ? styles.conditionPass : styles.conditionFail}`}>
      {pass ? '✓' : '✗'}
    </span>
  )
}

// Offset visualisation inside the Canvas — shows a small red sphere at the
// offset point so the user can see "the origin is NOT there".
interface OffsetMarkerProps { point: Vec3 }
function OffsetMarker({ point }: OffsetMarkerProps) {
  return (
    <mesh position={point}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color={COLOR_OFFSET} opacity={0.9} transparent />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function VectorSpaces() {
  const {
    dim, candidateType,
    lineDir, planeDir1, planeDir2, offset,
    a, b, c,
    setDim, setCandidateType,
    setLineDir, setPlaneDir1, setPlaneDir2,
    setOffset, setA, setB, setC,
  } = useVectorSpacesStore()

  // Derive geometry (pure, memoised)
  const geo = useMemo(
    () => deriveVectorSpacesGeometry(candidateType, lineDir, planeDir1, planeDir2, offset, a, b, c),
    [candidateType, lineDir, planeDir1, planeDir2, offset, a, b, c],
  )

  const { conditions, candidateSubspace, aPlus_b, cTimesA, offsetPoint } = geo

  const a3 = toVec3(a)
  const b3 = toVec3(b)

  // Determine colors for the result vectors
  const sumColor  = conditions.closedUnderAddition    ? COLOR_SUM    : COLOR_OFFSET
  const scaleColor = conditions.closedUnderScalarMult ? COLOR_SCALAR : COLOR_OFFSET

  // Verdict callout variant
  const calloutVariant = conditions.isSubspace ? 'success' : 'warning'

  // ---- Render ----
  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Visualization card ---- */}
        <div className={styles.stageViz}>
          <div className={styles.vh}>
            <em>V</em> ⊆ ℝ<sup><em>n</em></sup>, closed under + and ·
            <span className={styles.grow} />
          </div>
          <div className={styles.canvas}>
          <Scene dim={dim} frameloop="always">

            {/* The candidate subspace (drawn through origin for non-examples too,
                since SubspaceMesh draws through origin; the offset is shown via
                the offset marker) */}
            <SubspaceMesh
              geometry={candidateSubspace}
              color={COLOR_CANDIDATE}
              opacity={0.35}
              dim={dim}
            />

            {/* Offset marker — a red sphere placed at the offset translation
                vector, making it clear the set is shifted away from origin */}
            {offsetPoint && <OffsetMarker point={offsetPoint} />}

            {/* Vector a */}
            <VectorArrow vector={a3} color={COLOR_A} label="a" showLabel />
            <DraggableHandle
              position={a3}
              onDrag={(p: Vec3) => setA(dim === '2d' ? [p[0], p[1]] : p)}
              color={COLOR_A}
              dim={dim}
            />

            {/* Vector b */}
            <VectorArrow vector={b3} color={COLOR_B} label="b" showLabel />
            <DraggableHandle
              position={b3}
              onDrag={(p: Vec3) => setB(dim === '2d' ? [p[0], p[1]] : p)}
              color={COLOR_B}
              dim={dim}
            />

            {/* a + b — color-coded green/red by whether it lands in subset */}
            <VectorArrow vector={aPlus_b} color={sumColor} opacity={0.85} label="a+b" showLabel />

            {/* c * a — color-coded green/red */}
            <VectorArrow vector={cTimesA} color={scaleColor} opacity={0.85} label={`${c.toFixed(1)}a`} showLabel />

          </Scene>

          {/* Badge overlaid on the scene reminding about offset */}
          {(candidateType === 'offset-line' || candidateType === 'offset-plane') && (
            <div className={styles.offsetBadge}>
              Offset = {offset.toFixed(2)} — NOT a subspace
            </div>
          )}
          </div>
        </div>

        {/* ---- Controls card ---- */}
        <div className={styles.stageControls}>
          {/* Dimension toggle + candidate selector */}
          <div className={styles.toolbar}>
            <DimensionToggle value={dim} onChange={(d: Dim) => setDim(d)} />
            <span className={styles.toolbarLabel}>Candidate subset:</span>
            <div className={styles.radioGroup}>
              {CANDIDATE_OPTIONS.map((opt) => {
                const disabled = !!opt.requires3D && dim === '2d'
                const checked  = candidateType === opt.value
                return (
                  <label
                    key={opt.value}
                    className={[
                      styles.radioLabel,
                      checked ? styles.radioLabelChecked : '',
                      disabled ? styles.radioLabelDisabled : '',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      className={styles.radioInput}
                      name="candidateType"
                      value={opt.value}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => !disabled && setCandidateType(opt.value)}
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Field inputs */}
          <div className={styles.fieldGroup}>
            {(candidateType === 'line' || candidateType === 'offset-line') && (
              <div>
                <div className={styles.fieldLabel}>Direction vector</div>
                <VectorInput value={lineDir} onChange={(v: Vec) => setLineDir(v)} dim={dim} />
              </div>
            )}
            {(candidateType === 'plane' || candidateType === 'offset-plane') && (
              <>
                <div>
                  <div className={styles.fieldLabel}>Direction 1</div>
                  <VectorInput value={planeDir1} onChange={(v: Vec) => setPlaneDir1(v)} dim={dim} />
                </div>
                <div>
                  <div className={styles.fieldLabel}>Direction 2</div>
                  <VectorInput value={planeDir2} onChange={(v: Vec) => setPlaneDir2(v)} dim={dim} />
                </div>
              </>
            )}
            {(candidateType === 'offset-line' || candidateType === 'offset-plane') && (
              <Slider value={offset} onChange={setOffset} min={0} max={3} step={0.05} label="Offset from origin" />
            )}
            <div>
              <div className={styles.fieldLabel} style={{ color: COLOR_A }}>Test vector a</div>
              <VectorInput value={a} onChange={(v: Vec) => setA(v)} dim={dim} />
            </div>
            <div>
              <div className={styles.fieldLabel} style={{ color: COLOR_B }}>Test vector b</div>
              <VectorInput value={b} onChange={(v: Vec) => setB(v)} dim={dim} />
            </div>
            <Slider value={c} onChange={setC} min={-4} max={4} step={0.1} label="Scalar c" />
          </div>
        </div>
      </div>

      {/* ---- Definition rail ---- */}
      <aside className={styles.rail}>
          {/* Conditions panel */}
          <Panel eyebrow="Conditions" title="Subspace conditions">
            <div className={styles.conditionsList}>
              <div className={styles.conditionRow}>
                <ConditionIcon pass={conditions.containsZero} />
                <span>
                  Contains <strong>0</strong>
                </span>
              </div>
              <div className={styles.conditionRow}>
                <ConditionIcon pass={conditions.closedUnderAddition} />
                <span>
                  Closed under addition (<strong>a+b</strong> in subset)
                </span>
              </div>
              <div className={styles.conditionRow}>
                <ConditionIcon pass={conditions.closedUnderScalarMult} />
                <span>
                  Closed under scalar mult (<strong>c·a</strong> in subset)
                </span>
              </div>
              <div className={`${styles.verdictRow} ${conditions.isSubspace ? styles.verdictPass : styles.verdictFail}`}>
                {conditions.isSubspace ? '✓ Valid subspace' : '✗ Not a subspace'}
              </div>
            </div>
          </Panel>

          {/* State-aware callout */}
          <Callout variant={calloutVariant}>
            {conditions.isSubspace
              ? 'This is a valid subspace — all three conditions hold.'
              : !conditions.containsZero
                ? 'This is NOT a subspace — it does not contain the zero vector.'
                : !conditions.closedUnderAddition
                  ? 'This is NOT a subspace — a+b leaves the subset.'
                  : 'This is NOT a subspace — c·a leaves the subset.'}
          </Callout>

          {/* Explanation */}
          <Panel eyebrow="Definition" title="Vector spaces &amp; subspaces">
            <div className={styles.explanationSection}>

              <p className={styles.explanationText}>
                A <strong>subspace</strong> is a subset W of a vector space V that is itself a
                vector space — it must be closed under addition and scalar multiplication, and
                always contain the zero vector.
              </p>

              <div className={styles.mathBlock}>
                <MathText
                  tex="W \subseteq V \text{ is a subspace iff}"
                  display
                />
                <MathText tex="(1)\; \mathbf{0} \in W" display />
                <MathText tex="(2)\; \forall\, u,v \in W:\; u+v \in W" display />
                <MathText tex="(3)\; \forall\, u \in W,\, c \in \mathbb{R}:\; cu \in W" display />
              </div>

              <p className={styles.explanationText}>
                The subspaces of R³ are exactly: the zero vector, every line through the origin,
                every plane through the origin, and R³ itself.
              </p>

              <p className={styles.noteText}>
                Note: vector spaces also include non-geometric examples such as polynomial spaces
                P<sub>n</sub> and function spaces — this page only visualises subspaces of R² and R³.
              </p>

              <ul className={styles.tryThisList}>
                <li className={styles.tryThisItem}>
                  Select <em>Offset line</em> and watch it fail the "contains 0" test.
                </li>
                <li className={styles.tryThisItem}>
                  On a line through the origin, move <strong>a</strong> off the line — watch
                  c·a turn red.
                </li>
                <li className={styles.tryThisItem}>
                  Try a plane through the origin in 3D with vectors inside vs outside the plane.
                </li>
                <li className={styles.tryThisItem}>
                  Set both test vectors to <strong>0</strong> — which candidates pass all three
                  conditions trivially?
                </li>
              </ul>
            </div>
          </Panel>

      </aside>
    </div>
  )
}
