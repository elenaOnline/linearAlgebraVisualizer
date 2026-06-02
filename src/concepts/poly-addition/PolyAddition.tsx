import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { StackingIndicators } from '../../scene/StackingIndicators'
import { Line } from '@react-three/drei'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { PolyDegToggle } from '../../ui/PolyDegToggle'
import { usePolyAdditionStore } from './store'
import { computePolyAdditionGeo } from './geometry'
import { V1, V2, VP } from '../../styles/colors'
import styles from './PolyAddition.module.css'

// ---- Coefficient-space scene content ----------------------------------------

interface CoeffSceneContentProps {
  pPos: Vec3
  qPos: Vec3
  sumPos: Vec3
  onDragP: (pos: Vec3) => void
  onDragQ: (pos: Vec3) => void
  dim: '2d' | '3d'
}

function CoeffSceneContent({
  pPos,
  qPos,
  sumPos,
  onDragP,
  onDragQ,
  dim,
}: CoeffSceneContentProps) {
  return (
    <>
      {/* Vectors from origin */}
      <VectorArrow vector={pPos} color={V1} />
      <VectorArrow vector={qPos} color={V2} />
      <VectorArrow vector={sumPos} color={VP} />
      {/* Tip-to-tail displacement: displaced q from p-tip to sum */}
      <Line points={[pPos, sumPos]} color={V2} lineWidth={1.5} />
      {/* Interactive handles */}
      <DraggableHandle position={pPos} onDrag={onDragP} color={V1} radius={0.15} dim={dim} />
      <DraggableHandle position={qPos} onDrag={onDragQ} color={V2} radius={0.15} dim={dim} />
    </>
  )
}

// ---- Main component ----------------------------------------------------------

export function PolyAddition() {
  const { deg, p, q, showIndicators, setDeg, setP, setQ, setShowIndicators } =
    usePolyAdditionStore()

  const geo = computePolyAdditionGeo(deg, p, q)
  const { pCoeffs, qCoeffs, sumCoeffs, pGraph, qGraph, sumGraph, stackingSamples, sumIsZero } =
    geo

  const handleDragP = (pos: Vec3) => {
    setP([pos[0], pos[1], deg === 'p2' ? pos[2] : 0])
  }
  const handleDragQ = (pos: Vec3) => {
    setQ([pos[0], pos[1], deg === 'p2' ? pos[2] : 0])
  }

  const pFn = (x: number) => pCoeffs[0] + pCoeffs[1] * x + pCoeffs[2] * x * x
  const qFn = (x: number) => qCoeffs[0] + qCoeffs[1] * x + qCoeffs[2] * x * x
  const sumFn = (x: number) => sumCoeffs[0] + sumCoeffs[1] * x + sumCoeffs[2] * x * x

  const pPos3d: Vec3 = [pCoeffs[0], pCoeffs[1], pCoeffs[2]]
  const qPos3d: Vec3 = [qCoeffs[0], qCoeffs[1], qCoeffs[2]]
  const sumPos3d: Vec3 = [sumCoeffs[0], sumCoeffs[1], sumCoeffs[2]]

  const pPos2d: Vec3 = [pCoeffs[0], pCoeffs[1], 0]
  const qPos2d: Vec3 = [qCoeffs[0], qCoeffs[1], 0]
  const sumPos2d: Vec3 = [sumCoeffs[0], sumCoeffs[1], 0]

  // suppress "unused variable" — graphPoints are stored but only fn versions used for FunctionGraph
  void pGraph; void qGraph; void sumGraph

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Two scenes side by side ---- */}
        <div className={styles.splitPanels}>
          {/* Left: coefficient space */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              {deg === 'p2'
                ? 'Coefficient space P₂ — p (red), q (blue), p+q (green)'
                : 'Coefficient space P₁ — p (red), q (blue), p+q (green)'}
            </div>
            <div className={styles.canvasWrap}>
              {deg === 'p2' ? (
                <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="always">
                  <CoeffSceneContent
                    pPos={pPos3d}
                    qPos={qPos3d}
                    sumPos={sumPos3d}
                    onDragP={handleDragP}
                    onDragQ={handleDragQ}
                    dim="3d"
                  />
                </Scene>
              ) : (
                <Scene dim="2d" axisLabels={['1', 'x']} frameloop="always">
                  <CoeffSceneContent
                    pPos={pPos2d}
                    qPos={qPos2d}
                    sumPos={sumPos2d}
                    onDragP={handleDragP}
                    onDragQ={handleDragQ}
                    dim="2d"
                  />
                </Scene>
              )}
            </div>
          </div>

          {/* Right: function graphs */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              Graphs — p (red), q (blue), p+q (green)
            </div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" axisLabels={['x', 'f(x)']} frameloop="always">
                <FunctionGraph fn={pFn} xMin={-4} xMax={4} color={V1} />
                <FunctionGraph fn={qFn} xMin={-4} xMax={4} color={V2} />
                <FunctionGraph fn={sumFn} xMin={-4} xMax={4} color={VP} />
                {showIndicators && (
                  <StackingIndicators
                    samples={stackingSamples.map((s) => ({
                      x: s.x,
                      baseY: s.fAtX,
                      topY: s.sumAtX,
                    }))}
                    colorBottom={V1}
                    colorTop={V2}
                  />
                )}
              </Scene>
            </div>
          </div>
        </div>

        {/* ---- Controls ---- */}
        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <div className={styles.toggleRow}>
              <PolyDegToggle value={deg} onChange={setDeg} />
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showIndicators}
                  onChange={(e) => setShowIndicators(e.target.checked)}
                />
                Show stacking indicators
              </label>
            </div>

            <div className={styles.row}>
              <div className={styles.section}>
                <div className={styles.groupLabel}>p (red)</div>
                <div className={styles.label}>a₀</div>
                <NumberInput value={p[0]} onChange={(v) => setP([v, p[1], p[2]])} step={0.1} showIntSlider />
                <div className={styles.label}>a₁</div>
                <NumberInput value={p[1]} onChange={(v) => setP([p[0], v, p[2]])} step={0.1} showIntSlider />
                {deg === 'p2' && (
                  <>
                    <div className={styles.label}>a₂</div>
                    <NumberInput value={p[2]} onChange={(v) => setP([p[0], p[1], v])} step={0.1} showIntSlider />
                  </>
                )}
              </div>
              <div className={styles.section}>
                <div className={styles.groupLabel}>q (blue)</div>
                <div className={styles.label}>b₀</div>
                <NumberInput value={q[0]} onChange={(v) => setQ([v, q[1], q[2]])} step={0.1} showIntSlider />
                <div className={styles.label}>b₁</div>
                <NumberInput value={q[1]} onChange={(v) => setQ([q[0], v, q[2]])} step={0.1} showIntSlider />
                {deg === 'p2' && (
                  <>
                    <div className={styles.label}>b₂</div>
                    <NumberInput value={q[2]} onChange={(v) => setQ([q[0], q[1], v])} step={0.1} showIntSlider />
                  </>
                )}
              </div>
            </div>

            {sumIsZero && (
              <Callout variant="info">
                p + q is the zero polynomial — the two polynomials are negatives of
                each other.
              </Callout>
            )}
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Polynomial Addition">
          <div className={styles.explainInner}>
            <p>
              Two polynomials are added <strong>coefficient-wise</strong>: the sum
              of p and q is the polynomial whose coefficient at each term is the
              sum of p's and q's coefficients:
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="(p + q)(x) = (a_0+b_0) + (a_1+b_1)x + (a_2+b_2)x^2"
                display
              />
            </div>

            <p>
              In coefficient coordinates, this is just vector addition in R³ (or
              R² for P₁). The left panel shows the three points; the right panel
              shows the three graphs.
            </p>

            <p>
              The stacking indicators show, at six sample x-values, how the value
              of q(x) "stacks on top of" p(x) to reach (p+q)(x).
            </p>

            <ul className={styles.tryList}>
              <li>Drag p or q — the sum updates instantly</li>
              <li>Make p and q negatives — sum collapses to zero</li>
              <li>Set q = 0 — sum equals p</li>
              <li>Toggle P₁/P₂ — removes the quadratic term</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
