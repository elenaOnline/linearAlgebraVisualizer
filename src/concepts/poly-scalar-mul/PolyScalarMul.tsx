import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { ShadedArea } from '../../scene/ShadedArea'
import { NumberInput } from '../../ui/NumberInput'
import { Slider } from '../../ui/Slider'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { PolyDegToggle } from '../../ui/PolyDegToggle'
import { usePolyScalarMulStore } from './store'
import { computePolyScalarMulGeo } from './geometry'
import { V1, VP } from '../../styles/colors'
import styles from './PolyScalarMul.module.css'


// ---- Main component ----------------------------------------------------------

export function PolyScalarMul() {
  const { deg, p, c, setDeg, setP, setC } = usePolyScalarMulStore()

  const geo = computePolyScalarMulGeo(deg, p, c)
  const { pCoeffs, scaledCoeffs, pGraph, scaledGraph, cIsZero, cIsOne, cIsNegative } = geo

  const handleDragP = (pos: Vec3) => {
    setP([pos[0], pos[1], deg === 'p2' ? pos[2] : 0])
  }

  const pFn = (x: number) => pCoeffs[0] + pCoeffs[1] * x + pCoeffs[2] * x * x
  const scaledFn = (x: number) =>
    scaledCoeffs[0] + scaledCoeffs[1] * x + scaledCoeffs[2] * x * x

  const pPos3d: Vec3 = [pCoeffs[0], pCoeffs[1], pCoeffs[2]]
  const scaledPos3d: Vec3 = [scaledCoeffs[0], scaledCoeffs[1], scaledCoeffs[2]]

  const pPos2d: Vec3 = [pCoeffs[0], pCoeffs[1], 0]
  const scaledPos2d: Vec3 = [scaledCoeffs[0], scaledCoeffs[1], 0]

  // When c < 0, the scaled curve is below p(x), so swap lower/upper accordingly
  const shadeLower = cIsNegative ? scaledGraph : pGraph
  const shadeUpper = cIsNegative ? pGraph : scaledGraph

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Two scenes side by side ---- */}
        <div className={styles.splitPanels}>
          {/* Left: coefficient space */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              {deg === 'p2'
                ? 'P₂ coefficient space — p (red), c·p (green)'
                : 'P₁ coefficient space — p (red), c·p (green)'}
            </div>
            <div className={styles.canvasWrap}>
              {deg === 'p2' ? (
                <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="always">
                  <VectorArrow vector={pPos3d} color={V1} />
                  <VectorArrow vector={scaledPos3d} color={VP} />
                  <DraggableHandle
                    position={pPos3d}
                    onDrag={handleDragP}
                    color={V1}
                    radius={0.15}
                    dim="3d"
                  />
                </Scene>
              ) : (
                <Scene dim="2d" axisLabels={['1', 'x']} frameloop="always">
                  <VectorArrow vector={pPos2d} color={V1} />
                  <VectorArrow vector={scaledPos2d} color={VP} />
                  <DraggableHandle
                    position={pPos2d}
                    onDrag={handleDragP}
                    color={V1}
                    radius={0.15}
                    dim="2d"
                  />
                </Scene>
              )}
            </div>
          </div>

          {/* Right: function graphs */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              Graphs — f (red), c·f (green)
            </div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" axisLabels={['x', 'f(x)']} frameloop="always">
                {/* Shaded region between f(x) and c·f(x) shows the scaling effect */}
                <ShadedArea lower={shadeLower} upper={shadeUpper} color={VP} opacity={0.25} />
                <FunctionGraph fn={pFn} xMin={-10} xMax={10} color={V1} />
                <FunctionGraph fn={scaledFn} xMin={-10} xMax={10} color={VP} />
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

            {/* Scalar c */}
            <div className={styles.scalarRow}>
              <div className={styles.sliderWrap}>
                <Slider
                  value={Math.max(-3, Math.min(3, c))}
                  onChange={setC}
                  min={-3}
                  max={3}
                  step={0.01}
                  label="c (scalar)"
                />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>c (exact)</div>
                <NumberInput value={c} onChange={setC} step={0.1} />
              </div>
            </div>

            {/* Polynomial p */}
            <div>
              <div className={styles.groupLabel}>p (red polynomial)</div>
              <div className={styles.row}>
                <div className={styles.section}>
                  <div className={styles.label}>a₀</div>
                  <NumberInput
                    value={p[0]}
                    onChange={(v) => setP([v, p[1], p[2]])}
                    step={0.1}
                    showIntSlider
                  />
                </div>
                <div className={styles.section}>
                  <div className={styles.label}>a₁</div>
                  <NumberInput
                    value={p[1]}
                    onChange={(v) => setP([p[0], v, p[2]])}
                    step={0.1}
                    showIntSlider
                  />
                </div>
                {deg === 'p2' && (
                  <div className={styles.section}>
                    <div className={styles.label}>a₂</div>
                    <NumberInput
                      value={p[2]}
                      onChange={(v) => setP([p[0], p[1], v])}
                      step={0.1}
                      showIntSlider
                    />
                  </div>
                )}
              </div>
            </div>

            {cIsZero && (
              <Callout variant="info">
                c = 0: the result is the zero polynomial regardless of p.
              </Callout>
            )}
            {cIsNegative && !cIsZero && (
              <Callout variant="info">
                c &lt; 0: the polynomial is flipped &mdash; every value changes sign.
              </Callout>
            )}
            {cIsOne && (
              <Callout variant="info">
                c = 1: the scaled polynomial equals p exactly.
              </Callout>
            )}
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Polynomial Scalar Multiplication">
          <div className={styles.explainInner}>
            <p>
              Multiplying a polynomial by a scalar <em>c</em> scales every
              coefficient:
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="c \cdot (a_0 + a_1 x + a_2 x^2) = ca_0 + ca_1 x + ca_2 x^2"
                display
              />
            </div>

            <p>
              In coefficient space, this is exactly scalar multiplication in
              R³: the point (a₀, a₁, a₂) moves to
              (ca₀, ca₁, ca₂). The result lies on the ray through
              the origin and p.
            </p>

            <p>
              Together with polynomial addition, scalar multiplication makes P₂
              a vector space. These two operations are the <em>only</em> structure
              needed.
            </p>

            <ul className={styles.tryList}>
              <li>Drag the slider &mdash; watch the graph stretch or compress</li>
              <li>Set c = -1 &mdash; the graph flips about the x-axis</li>
              <li>Set c = 0 &mdash; the zero polynomial</li>
              <li>Large |c| &mdash; amplifies the polynomial&apos;s values</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
