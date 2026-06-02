import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { PolyDegToggle } from '../../ui/PolyDegToggle'
import { usePolySpaceStore } from './store'
import { computePolySpaceGeo } from './geometry'
import { V1 } from '../../styles/colors'
import styles from './PolySpace.module.css'

// ---- Main component ----------------------------------------------------------

export function PolySpace() {
  const { deg, a0, a1, a2, setDeg, setA0, setA1, setA2 } = usePolySpaceStore()

  const geo = computePolySpaceGeo(deg, a0, a1, a2)
  const { effectiveA2, isZero, a2IsZero } = geo

  const handleDrag = (pos: Vec3) => {
    setA0(pos[0])
    setA1(pos[1])
    if (deg === 'p2') setA2(pos[2])
  }

  const fnGraph = (x: number) => a0 + a1 * x + effectiveA2 * x * x

  const coeffPoint3d: Vec3 = [a0, a1, deg === 'p2' ? a2 : 0]
  const coeffPoint2d: Vec3 = [a0, a1, 0]

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Two scenes side by side ---- */}
        <div className={styles.splitPanels}>
          {/* Left: coefficient space */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              {deg === 'p2'
                ? 'P₂ coefficient space (axes: 1, x, x²)'
                : 'P₁ coefficient space (axes: 1, x)'}
            </div>
            <div className={styles.canvasWrap}>
              {deg === 'p2' ? (
                <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="always">
                  <VectorArrow vector={coeffPoint3d} color={V1} />
                  <DraggableHandle
                    position={coeffPoint3d}
                    onDrag={handleDrag}
                    color={V1}
                    radius={0.15}
                    dim="3d"
                  />
                </Scene>
              ) : (
                <Scene dim="2d" axisLabels={['1', 'x']} frameloop="always">
                  <VectorArrow vector={coeffPoint2d} color={V1} />
                  <DraggableHandle
                    position={coeffPoint2d}
                    onDrag={handleDrag}
                    color={V1}
                    radius={0.15}
                    dim="2d"
                  />
                </Scene>
              )}
            </div>
          </div>

          {/* Right: function graph */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              Graph of f(x) = a₀ + a₁x{deg === 'p2' ? ' + a₂x²' : ''}
            </div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" axisLabels={['x', 'f(x)']} frameloop="always">
                <FunctionGraph fn={fnGraph} xMin={-4} xMax={4} color={V1} />
              </Scene>
            </div>
          </div>
        </div>

        {/* ---- Controls ---- */}
        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <div className={styles.toggleRow}>
              <PolyDegToggle value={deg} onChange={setDeg} />
            </div>

            <div className={styles.row}>
              <div className={styles.section}>
                <div className={styles.label}>a₀ (constant term)</div>
                <NumberInput value={a0} onChange={setA0} step={0.1} showIntSlider />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>a₁ (x coefficient)</div>
                <NumberInput value={a1} onChange={setA1} step={0.1} showIntSlider />
              </div>
              {deg === 'p2' && (
                <div className={styles.section}>
                  <div className={styles.label}>a₂ (x² coefficient)</div>
                  <NumberInput value={a2} onChange={setA2} step={0.1} showIntSlider />
                </div>
              )}
            </div>

            {isZero && (
              <Callout variant="info">
                This is the zero polynomial — the zero vector in polynomial space.
              </Callout>
            )}
            {!isZero && a2IsZero && deg === 'p2' && (
              <Callout variant="info">
                a₂ = 0: this polynomial has no quadratic term, but it is still a
                valid element of P₂. P₂ contains all polynomials of degree ≤ 2.
              </Callout>
            )}
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Polynomials as Vectors">
          <div className={styles.explainInner}>
            <p>
              The set of all polynomials of degree ≤ 2 forms a{' '}
              <strong>vector space</strong> P₂. Each polynomial
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="f(x) = a_0 + a_1 x + a_2 x^2" display />
            </div>

            <p>
              is identified with its coefficient triple (a₀, a₁, a₂) — a point in
              R³. Addition and scalar multiplication act coefficient-wise, exactly
              like vectors in R³.
            </p>

            <p>
              This is an <strong>isomorphism</strong>: P₂ ≅ R³. The left panel
              shows the polynomial as a point in coefficient space; the right panel
              shows its graph.
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="P_2 \cong \mathbb{R}^3,\quad (a_0,a_1,a_2) \leftrightarrow a_0 + a_1 x + a_2 x^2" display />
            </div>

            <p>
              Switching to P₁ restricts to polynomials of degree ≤ 1 — a
              2-dimensional subspace where a₂ must be zero.
            </p>

            <ul className={styles.tryList}>
              <li>Drag the point — the graph updates instantly</li>
              <li>Set all coefficients to 0 — the zero vector</li>
              <li>Toggle P₁ / P₂ — watch the dimension change</li>
              <li>Move only a₀ — shifts the graph vertically, point moves along "1"-axis</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
