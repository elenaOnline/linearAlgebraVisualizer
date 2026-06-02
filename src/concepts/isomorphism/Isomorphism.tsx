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

// ---- Left panel: R³ scene content ------------------------------------------

interface R3ContentProps {
  a: number
  b: number
  c: number
  onDrag: (pos: Vec3) => void
}

function R3Content({ a, b, c, onDrag }: R3ContentProps) {
  const vec3: Vec3 = [a, b, c]
  return (
    <>
      <VectorArrow vector={vec3} color={V1} label="(a,b,c)" showLabel />
      <DraggableHandle
        position={vec3}
        onDrag={onDrag}
        color={V1}
        radius={0.13}
        dim="3d"
      />
    </>
  )
}

// ---- Right top panel: P₂ coefficient space (read-only) ---------------------

interface P2ContentProps {
  polyCoeffs: [number, number, number]
}

function P2Content({ polyCoeffs }: P2ContentProps) {
  // polyCoeffs = [a, b, c]: coefficients of 1, x, x²
  const vec: Vec3 = [polyCoeffs[0], polyCoeffs[1], polyCoeffs[2]]
  return <VectorArrow vector={vec} color={V2} />
}

// ---- Right bottom panel: function graph (read-only) -------------------------

interface GraphContentProps {
  a: number
  b: number
  c: number
}

function GraphContent({ a, b, c }: GraphContentProps) {
  const fn = useMemo(() => (x: number) => a + b * x + c * x * x, [a, b, c])
  return <FunctionGraph fn={fn} xMin={-10} xMax={10} color={V2} lineWidth={2} />
}

// ---- Main component ---------------------------------------------------------

export function Isomorphism() {
  const { a, b, c, setA, setB, setC } = useIsomorphismStore()

  const geo = computeIsomorphismGeo(a, b, c)
  const { polyCoeffs, isZero, bIsZero, aIsZero, cIsZero } = geo

  const handleDrag = (pos: Vec3) => {
    setA(pos[0])
    setB(pos[1])
    setC(pos[2])
  }

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Three panels: left R³, right two stacked ---- */}
        <div className={styles.threePanels}>
          {/* Left: R³ */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>R³ — Euclidean 3-space</div>
            <div className={styles.canvasWrap}>
              <Scene dim="3d" frameloop="always">
                <R3Content a={a} b={b} c={c} onDrag={handleDrag} />
              </Scene>
            </div>
          </div>

          {/* Right: two sub-panels stacked */}
          <div className={styles.rightCol}>
            <div className={styles.mappingLabel}>
              (a, b, c) ↦ a·1 + b·x + c·x²
            </div>

            {/* Right top: P₂ coefficient space */}
            <div className={styles.rightSubPanel}>
              <div className={styles.rightSubPanelHeader}>
                P₂ coefficient space (axes: 1, x, x²) — read-only
              </div>
              <div className={styles.subCanvasWrap}>
                <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="always">
                  <P2Content polyCoeffs={polyCoeffs} />
                </Scene>
              </div>
            </div>

            {/* Right bottom: function graph */}
            <div className={styles.rightSubPanel}>
              <div className={styles.rightSubPanelHeader}>
                Graph of f(x) = a + b·x + c·x² — read-only
              </div>
              <div className={styles.subCanvasWrap}>
                <Scene dim="2d" frameloop="always">
                  <GraphContent a={a} b={b} c={c} />
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
                <div className={styles.label}>a (constant term coefficient)</div>
                <NumberInput value={a} onChange={setA} step={0.1} showIntSlider />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>b (x coefficient)</div>
                <NumberInput value={b} onChange={setB} step={0.1} showIntSlider />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>c (x² coefficient)</div>
                <NumberInput value={c} onChange={setC} step={0.1} showIntSlider />
              </div>
            </div>

            {isZero && (
              <Callout variant="info">
                Zero vector: the zero polynomial maps to the origin in R³.
              </Callout>
            )}
            {!isZero && bIsZero && (
              <Callout variant="info">
                b = 0: the polynomial has no x term.
              </Callout>
            )}
            {!isZero && aIsZero && (
              <Callout variant="info">
                a = 0: the polynomial has no constant term; the graph passes through the origin.
              </Callout>
            )}
            {!isZero && cIsZero && (
              <Callout variant="info">
                c = 0: the polynomial has no x² term; it is linear (or constant).
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
                tex="\varphi: \mathbb{R}^3 \xrightarrow{\sim} P_2"
                display
              />
            </div>
            <div className={styles.mathBlock}>
              <MathText
                tex="\varphi(a,\,b,\,c) = a \cdot 1 + b \cdot x + c \cdot x^2"
                display
              />
            </div>

            <p>
              The left panel lives in R³: vectors are triples of real numbers. The top
              right panel lives in P₂: vectors are quadratic polynomials, with their
              coefficient triple (constant, x, x²) shown as a point. The bottom right
              panel graphs the polynomial as a function.
            </p>

            <p>
              All three representations describe the <em>same abstract 3D vector</em>.
              Drag the vector in R³ and watch P₂ and its graph update simultaneously.
            </p>

            <ul className={styles.tryList}>
              <li>Set c = 0 — the polynomial becomes linear (lives in P₁)</li>
              <li>Set a = b = 0 — a pure quadratic through the origin</li>
              <li>Try a = 0, b = 0, c = 1 — the polynomial is just x²</li>
              <li>What does the zero vector look like in each representation?</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
