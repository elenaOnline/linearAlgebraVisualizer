import type { Vec, Vec3, Dim } from '../../types'
import { dot, norm, isZero, EPS } from '../../linalg/vector'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Labels } from '../../scene/Labels'
import { Slider } from '../../ui/Slider'
import { VectorInput } from '../../ui/VectorInput'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useVectorsStore } from './store'
import { deriveVectorsGeometry } from './geometry'
import { V1, V2, VP } from '../../styles/colors'
import styles from './Vectors.module.css'

// ---- helpers ----------------------------------------------------------------

function fmt(n: number): string {
  return n.toFixed(3)
}

/** True when u and v are (anti-)parallel and neither is zero */
function areCollinear(u3: Vec3, v3: Vec3): boolean {
  if (isZero(u3) || isZero(v3)) return false
  const nu = norm(u3)
  const nv = norm(v3)
  const cosTheta = dot(u3, v3) / (nu * nv)
  return Math.abs(Math.abs(cosTheta) - 1) < 1e-6
}

// ---- SceneContent -----------------------------------------------------------
// Separate component so it renders inside <Canvas> context

interface SceneContentProps {
  geo: ReturnType<typeof deriveVectorsGeometry>
  showSum: boolean
  showTipToTail: boolean
  showScalarMult: boolean
  onDragU: (pos: Vec3) => void
  onDragV: (pos: Vec3) => void
  dim: Dim
  c: number
}

function SceneContent({
  geo,
  showSum,
  showTipToTail,
  showScalarMult,
  onDragU,
  onDragV,
  dim,
  c,
}: SceneContentProps) {
  const { u3, v3, sum3, cV3, tipToTailOffset3, normU, normV } = geo

  const labelItems: Array<{ position: Vec3; text: string }> = [
    {
      position: [u3[0] * 1.15 + 0.15, u3[1] * 1.15 + 0.15, u3[2] * 1.15 + 0.15],
      text: `u  ‖u‖=${fmt(normU)}`,
    },
    {
      position: [v3[0] * 1.15 + 0.15, v3[1] * 1.15 + 0.15, v3[2] * 1.15 + 0.15],
      text: `v  ‖v‖=${fmt(normV)}`,
    },
  ]

  if (showSum) {
    labelItems.push({
      position: [sum3[0] * 1.1 + 0.15, sum3[1] * 1.1 + 0.15, sum3[2] * 1.1 + 0.15],
      text: `u+v  ‖u+v‖=${fmt(norm(sum3))}`,
    })
  }

  if (showScalarMult) {
    labelItems.push({
      position: [cV3[0] * 1.1 + 0.15, cV3[1] * 1.1 + 0.15, cV3[2] * 1.1 + 0.15],
      text: `cv  (c=${fmt(c)})`,
    })
  }

  return (
    <>
      {/* u — vermilion (v1) */}
      <VectorArrow vector={u3} color={V1} label="u" showLabel={false} />

      {/* v — prussian (v2) */}
      <VectorArrow vector={v3} color={V2} label="v" showLabel={false} />

      {/* sum — forest (vp, derived result) */}
      {showSum && (
        <VectorArrow vector={sum3} color={VP} label="u+v" showLabel={false} />
      )}

      {/* tip-to-tail ghost: v translated so its tail is at tip of u */}
      {showSum && showTipToTail && (
        <group position={tipToTailOffset3}>
          <VectorArrow vector={v3} color={V2} opacity={0.35} showLabel={false} />
        </group>
      )}

      {/* scalar multiple c*v — forest (vp, derived) */}
      {showScalarMult && (
        <VectorArrow vector={cV3} color={VP} label="cv" showLabel={false} opacity={0.85} />
      )}

      {/* Draggable handles at tips */}
      <DraggableHandle position={u3} onDrag={onDragU} color={V1} radius={0.13} dim={dim} />
      <DraggableHandle position={v3} onDrag={onDragV} color={V2} radius={0.13} dim={dim} />

      <Labels items={labelItems} />
    </>
  )
}

// ---- Main component ---------------------------------------------------------

export function Vectors() {
  const {
    dim,
    u,
    v,
    c,
    showSum,
    showTipToTail,
    showScalarMult,
    setDim,
    setU,
    setV,
    setC,
    setShowSum,
    setShowTipToTail,
    setShowScalarMult,
  } = useVectorsStore()

  const geo = deriveVectorsGeometry(u, v, c, dim)
  const { u3, v3 } = geo

  const handleDragU = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setU(next)
  }

  const handleDragV = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setV(next)
  }

  // State-aware callout text
  const collinear = areCollinear(u3, v3)
  const zeroC = Math.abs(c) < EPS
  const zeroU = isZero(u3)
  const zeroV = isZero(v3)

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Visualization card ---- */}
        <div className={styles.stageViz}>
          <div className={styles.vh}>
            <em>u</em>, <em>v</em> ∈ ℝ<sup><em>n</em></sup>
            <span className={styles.grow} />
          </div>
          <div className={styles.canvas}>
            <Scene dim={dim} frameloop="always">
              <SceneContent
                geo={geo}
                showSum={showSum}
                showTipToTail={showTipToTail}
                showScalarMult={showScalarMult}
                onDragU={handleDragU}
                onDragV={handleDragV}
                dim={dim}
                c={c}
              />
            </Scene>
          </div>
        </div>

        {/* ---- Controls card ---- */}
        <div className={styles.stageControls}>
          <div className={styles.sandboxInner}>
            {/* Dimension toggle */}
            <div className={styles.dimRow}>
              <span className={styles.sandboxLabel}>Space</span>
              <DimensionToggle value={dim} onChange={setDim} />
            </div>

            {/* Vector inputs */}
            <div className={styles.sandboxRow}>
              <div className={styles.sandboxSection}>
                <VectorInput value={u} onChange={setU} dim={dim} label="u (orange)" />
                <div className={styles.normReadout}>
                  ‖u‖ = <span className={styles.normValue}>{geo.normU.toFixed(4)}</span>
                </div>
              </div>

              <div className={styles.sandboxSection}>
                <VectorInput value={v} onChange={setV} dim={dim} label="v (purple)" />
                <div className={styles.normReadout}>
                  ‖v‖ = <span className={styles.normValue}>{geo.normV.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Scalar c */}
            <div className={styles.sandboxSection}>
              <Slider value={c} onChange={setC} min={-3} max={3} step={0.05} label="Scalar c" />
            </div>

            {/* Toggles */}
            <div className={styles.togglesRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showSum}
                  onChange={(e) => setShowSum(e.target.checked)}
                />
                Show u+v
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showTipToTail}
                  onChange={(e) => setShowTipToTail(e.target.checked)}
                  disabled={!showSum}
                />
                Tip-to-tail construction
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showScalarMult}
                  onChange={(e) => setShowScalarMult(e.target.checked)}
                />
                Show c·v
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Definition rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="What is a vector?">
            <div className={styles.explainInner}>
              <p>
                A <strong>vector</strong> in Rⁿ is an ordered list of n real numbers, visualized as
                an arrow from the origin to the point with those coordinates. Two operations define
                vector algebra:
              </p>

              <div className={styles.mathBlock}>
                <MathText tex="\mathbf{u} + \mathbf{v} = (u_1 + v_1,\, \ldots,\, u_n + v_n)" display />
              </div>
              <div className={styles.mathBlock}>
                <MathText tex="c\,\mathbf{v} = (c\,v_1,\, \ldots,\, c\,v_n)" display />
              </div>
              <div className={styles.mathBlock}>
                <MathText tex="\|\mathbf{v}\| = \sqrt{v_1^2 + \cdots + v_n^2}" display />
              </div>

              <p>A vector <MathText tex="\mathbf{v} \in \mathbb{R}^n" /> is the n-tuple:</p>
              <div className={styles.mathBlock}>
                <MathText tex="\mathbf{v} = (v_1, \ldots, v_n) \in \mathbb{R}^n" display />
              </div>

              <ul className={styles.tryList}>
                <li>Drag the orange or purple tip to move u or v</li>
                <li>Enable "Show u+v" and "Tip-to-tail" to see the parallelogram law</li>
                <li>Set the scalar c to −1 to watch the arrow reverse direction</li>
                <li>Try setting both vectors to the same direction — what does the sum look like?</li>
              </ul>

              {/* State-aware callouts */}
              {collinear && (
                <Callout variant="info">
                  u and v are <strong>collinear</strong> (parallel or anti-parallel). Their sum lies
                  on the same line through the origin.
                </Callout>
              )}
              {zeroC && showScalarMult && (
                <Callout variant="warning">
                  c = 0 gives the <strong>zero vector</strong> — a point at the origin with no
                  direction. This is perfectly valid; it is the additive identity in Rⁿ.
                </Callout>
              )}
              {(zeroU || zeroV) && (
                <Callout variant="info">
                  The <strong>zero vector</strong> (0, …, 0) has norm 0 and no defined direction.
                  Adding it to any vector leaves that vector unchanged.
                </Callout>
              )}
              {showSum && !showTipToTail && (
                <Callout variant="info">
                  Enable <em>tip-to-tail construction</em> to see the faint copy of v placed at the
                  tip of u — showing exactly how addition works geometrically.
                </Callout>
              )}
            </div>
          </Panel>
      </aside>
    </div>
  )
}
