import { useMemo } from 'react'
import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useIsomorphismStore } from './store'
import { computeIsomorphismGeo } from './geometry'
import { V1, V2 } from '../../styles/colors'
import styles from './Isomorphism.module.css'

// ---- Left panel: R² scene content ------------------------------------------

interface R2ContentProps {
  a: number
  b: number
  onDrag: (pos: Vec3) => void
}

function R2Content({ a, b, onDrag }: R2ContentProps) {
  const vec3: Vec3 = [a, b, 0]
  return (
    <>
      <VectorArrow vector={vec3} color={V1} label="(a,b)" showLabel />
      <DraggableHandle
        position={vec3}
        onDrag={onDrag}
        color={V1}
        radius={0.13}
        dim="2d"
      />
    </>
  )
}

// ---- Right top panel: P₁ coefficient space (read-only) ---------------------

interface P1ContentProps {
  polyCoeffs: [number, number]
}

function P1Content({ polyCoeffs }: P1ContentProps) {
  // polyCoeffs = [b, a]: constant term first, then x coefficient
  const vec: Vec3 = [polyCoeffs[0], polyCoeffs[1], 0]
  return <VectorArrow vector={vec} color={V2} />
}

// ---- Right bottom panel: function graph (read-only) -------------------------

interface GraphContentProps {
  a: number
  b: number
}

function GraphContent({ a, b }: GraphContentProps) {
  const fn = useMemo(() => (x: number) => b + a * x, [a, b])
  return <FunctionGraph fn={fn} xMin={-4} xMax={4} color={V2} lineWidth={2} />
}

// ---- Main component ---------------------------------------------------------

export function Isomorphism() {
  const { a, b, setA, setB } = useIsomorphismStore()

  const geo = computeIsomorphismGeo(a, b)
  const { polyCoeffs, isZero, bIsZero, aIsZero } = geo

  const handleDrag = (pos: Vec3) => {
    setA(pos[0])
    setB(pos[1])
  }

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Three panels: left R², right two stacked ---- */}
        <div className={styles.threePanels}>
          {/* Left: R² */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>R² — Euclidean plane</div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" frameloop="always">
                <R2Content a={a} b={b} onDrag={handleDrag} />
              </Scene>
            </div>
          </div>

          {/* Right: two sub-panels stacked */}
          <div className={styles.rightCol}>
            <div className={styles.mappingLabel}>
              (a, b) ↦ b·1 + a·x
            </div>

            {/* Right top: P₁ coefficient space */}
            <div className={styles.rightSubPanel}>
              <div className={styles.rightSubPanelHeader}>
                P₁ coefficient space (axes: 1, x) — read-only
              </div>
              <div className={styles.subCanvasWrap}>
                <Scene dim="2d" axisLabels={['1', 'x']} frameloop="always">
                  <P1Content polyCoeffs={polyCoeffs} />
                </Scene>
              </div>
            </div>

            {/* Right bottom: function graph */}
            <div className={styles.rightSubPanel}>
              <div className={styles.rightSubPanelHeader}>
                Graph of f(x) = b + a·x — read-only
              </div>
              <div className={styles.subCanvasWrap}>
                <Scene dim="2d" frameloop="always">
                  <GraphContent a={a} b={b} />
                </Scene>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Controls ---- */}
        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <div className={styles.row}>
              <div className={styles.section}>
                <div className={styles.label}>a (x-component → x coefficient)</div>
                <NumberInput value={a} onChange={setA} step={0.1} showIntSlider />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>b (y-component → constant term)</div>
                <NumberInput value={b} onChange={setB} step={0.1} showIntSlider />
              </div>
            </div>

            {isZero && (
              <Callout variant="info">
                Zero vector: the zero polynomial maps to the origin in R².
              </Callout>
            )}
            {!isZero && bIsZero && (
              <Callout variant="info">
                b = 0: the polynomial has no constant term; the graph passes through
                the origin.
              </Callout>
            )}
            {!isZero && aIsZero && (
              <Callout variant="info">
                a = 0: a constant polynomial maps to the y-axis.
              </Callout>
            )}
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Isomorphic Spaces">
          <div className={styles.explainInner}>
            <p>
              Two vector spaces are <strong>isomorphic</strong> when there exists a
              linear bijection between them. Isomorphic spaces are structurally
              identical — every vector space fact on one side has an exact counterpart
              on the other.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\varphi: \mathbb{R}^2 \xrightarrow{\sim} P_1"
                display
              />
            </div>
            <div className={styles.mathBlock}>
              <MathText
                tex="\varphi(a,\,b) = b \cdot 1 + a \cdot x"
                display
              />
            </div>

            <p>
              The left panel lives in R²: vectors are pairs of real numbers. The top
              right panel lives in P₁: vectors are linear polynomials, with their
              coefficient pair (constant term, x-coefficient) shown as a point. The
              bottom right panel graphs the polynomial as a function.
            </p>

            <p>
              All three representations describe the <em>same abstract 2D vector</em>.
              Drag the vector in R² and watch P₁ and its graph update simultaneously.
            </p>

            <ul className={styles.tryList}>
              <li>Drag to a = 0 — the polynomial becomes a constant function</li>
              <li>Drag to b = 0 — the polynomial has no constant term</li>
              <li>Try a = 1, b = 0 — the polynomial is just x</li>
              <li>What does the zero vector look like in each representation?</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
