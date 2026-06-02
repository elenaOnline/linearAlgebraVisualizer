import { useMemo } from 'react'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Labels } from '../../scene/Labels'
import { VectorInput } from '../../ui/VectorInput'
import { Slider } from '../../ui/Slider'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { toVec3 } from '../../linalg/vector'
import { useSpanStore } from './store'
import { deriveSpanGeometry } from './geometry'
import type { Vec, Vec3 } from '../../types'
import { V1, V2, V3, VP } from '../../styles/colors'
import styles from './Span.module.css'

const SPAN_COLOR = VP
const V_COLORS = [V1, V2, V3]
const V_LABELS = ['v₁', 'v₂', 'v₃']

const DIMENSION_NAMES: Record<number, string> = {
  0: 'just the origin (point)',
  1: 'a line through the origin',
  2: 'a plane through the origin',
  3: 'all of R³',
}

export function Span() {
  const {
    dim,
    numVectors,
    v1,
    v2,
    v3,
    c1,
    c2,
    c3,
    probe,
    setDim,
    setNumVectors,
    setV1,
    setV2,
    setV3,
    setC1,
    setC2,
    setC3,
    setProbe,
  } = useSpanStore()

  // Collect active vectors
  const activeVecs: Vec[] = useMemo(() => {
    const all: Vec[] = [v1, v2, v3]
    return all.slice(0, numVectors)
  }, [v1, v2, v3, numVectors])

  // Derive all geometry
  const geo = useMemo(
    () => deriveSpanGeometry(activeVecs, c1, c2, c3, probe, dim),
    [activeVecs, c1, c2, c3, probe, dim],
  )

  // Drag handlers: convert Vec3 back to Vec for the store setters
  const handleDragV1 = (p: Vec3) => {
    setV1(dim === '2d' ? [p[0], p[1]] : p)
  }
  const handleDragV2 = (p: Vec3) => {
    setV2(dim === '2d' ? [p[0], p[1]] : p)
  }
  const handleDragV3 = (p: Vec3) => {
    setV3(dim === '2d' ? [p[0], p[1]] : p)
  }
  const handleDragProbe = (p: Vec3) => {
    setProbe(dim === '2d' ? [p[0], p[1]] : p)
  }

  const v1_3 = toVec3(v1)
  const v2_3 = toVec3(v2)
  const v3_3 = toVec3(v3)
  const probe3 = geo.probe3

  const combinationPoint = geo.combinationPoint

  const dimensionName = DIMENSION_NAMES[geo.dimension] ?? `${geo.dimension}-dimensional subspace`

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ── Visualization card ── */}
        <div className={styles.stageViz}>
          <div className={styles.vh}>
            span&#123;<em>v</em><sub>1</sub>, …, <em>v</em><sub><em>k</em></sub>&#125; ⊆ ℝ<sup><em>n</em></sup>
            <span className={styles.grow} />
          </div>
          <div className={styles.canvas}>
        <Scene dim={dim}>
          {/* Span subspace mesh */}
          <SubspaceMesh
            geometry={geo.spanSubspace}
            color={SPAN_COLOR}
            opacity={0.25}
            dim={dim}
          />

          {/* Active vector arrows */}
          <VectorArrow vector={v1_3} color={V_COLORS[0]} label={V_LABELS[0]} showLabel />
          <DraggableHandle
            position={v1_3}
            onDrag={handleDragV1}
            color={V_COLORS[0]}
            radius={0.15}
            dim={dim}
          />

          {numVectors >= 2 && (
            <>
              <VectorArrow vector={v2_3} color={V_COLORS[1]} label={V_LABELS[1]} showLabel />
              <DraggableHandle
                position={v2_3}
                onDrag={handleDragV2}
                color={V_COLORS[1]}
                radius={0.15}
                dim={dim}
              />
            </>
          )}

          {numVectors >= 3 && (
            <>
              <VectorArrow vector={v3_3} color={V_COLORS[2]} label={V_LABELS[2]} showLabel />
              <DraggableHandle
                position={v3_3}
                onDrag={handleDragV3}
                color={V_COLORS[2]}
                radius={0.15}
                dim={dim}
              />
            </>
          )}

          {/* Combination point marker */}
          <mesh position={combinationPoint}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={SPAN_COLOR} />
          </mesh>

          {/* Probe point */}
          <DraggableHandle
            position={probe3}
            onDrag={handleDragProbe}
            color={geo.isProbeInSpan ? VP : V1}
            radius={0.18}
            dim={dim}
          />

          {/* Labels for combination point and probe */}
          <Labels
            items={[
              {
                position: [
                  combinationPoint[0] + 0.2,
                  combinationPoint[1] + 0.2,
                  combinationPoint[2] + 0.2,
                ],
                text: `c₁v₁+…`,
              },
              {
                position: [probe3[0] + 0.2, probe3[1] + 0.25, probe3[2] + 0.2],
                text: geo.isProbeInSpan ? 'probe ✓' : 'probe ✗',
              },
            ]}
          />
        </Scene>

        {/* Dimension readout overlay */}
        <div className={styles.dimReadout}>
          <div>
            <span className={styles.dimNumber}>{geo.dimension}</span>
            <span>-dimensional span</span>
          </div>
          <div>{dimensionName}</div>
        </div>
          </div>
        </div>

        {/* ── Controls card ── */}
        <div className={styles.stageControls}>
          <div className={styles.sandboxInner}>
            {/* Dimension toggle */}
            <div className={styles.dimRow}>
              <DimensionToggle value={dim} onChange={setDim} />
            </div>

            {/* Vector count */}
            <div>
              <div className={styles.sandboxLabel}>Vectors</div>
              <div className={styles.countButtons}>
                {([1, 2, 3] as const).map((n) => (
                  <button
                    key={n}
                    className={`${styles.countBtn} ${numVectors === n ? styles.countBtnActive : ''}`}
                    onClick={() => setNumVectors(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Vector inputs */}
            <div className={styles.vectorsRow}>
              <VectorInput
                value={v1}
                onChange={setV1}
                dim={dim}
                label={`v₁`}
              />
              {numVectors >= 2 && (
                <VectorInput
                  value={v2}
                  onChange={setV2}
                  dim={dim}
                  label={`v₂`}
                />
              )}
              {numVectors >= 3 && (
                <VectorInput
                  value={v3}
                  onChange={setV3}
                  dim={dim}
                  label={`v₃`}
                />
              )}
            </div>

            {/* Coefficient sliders */}
            <div>
              <div className={styles.sandboxLabel}>Coefficients (linear combination)</div>
              <Slider value={c1} onChange={setC1} min={-3} max={3} step={0.05} label="c₁" />
              {numVectors >= 2 && (
                <Slider value={c2} onChange={setC2} min={-3} max={3} step={0.05} label="c₂" />
              )}
              {numVectors >= 3 && (
                <Slider value={c3} onChange={setC3} min={-3} max={3} step={0.05} label="c₃" />
              )}
            </div>

            {/* Probe point */}
            <div>
              <div className={styles.sandboxLabel}>Probe point</div>
              <VectorInput
                value={probe}
                onChange={setProbe}
                dim={dim}
              />
              <div
                className={`${styles.probeReadout} ${geo.isProbeInSpan ? styles.probeIn : styles.probeOut}`}
              >
                {geo.isProbeInSpan
                  ? 'In the span'
                  : 'Not in the span'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Definition rail ── */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Span">
          <div className={styles.explainInner}>
            <p>
              The span of a set of vectors is every linear combination you can make from
              them — all possible scalings and additions. It is the smallest subspace
              containing all the vectors.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex={`\\operatorname{span}(v_1,\\ldots,v_k) = \\{\\, c_1 v_1 + \\cdots + c_k v_k \\mid c_1,\\ldots,c_k \\in \\mathbb{R} \\,\\}`}
                display
              />
            </div>

            <h4>Try this</h4>
            <ul className={styles.tryList}>
              <li>Make two vectors parallel — the span collapses to a line.</li>
              <li>Add a third vector independent of the first two — span becomes a plane (or all of R³).</li>
              <li>Drag the coefficient sliders to "fly through" the span.</li>
              <li>Move the probe point to test whether it lies in the span.</li>
            </ul>

            <Callout variant="info">
              These {numVectors} vector{numVectors > 1 ? 's' : ''} span{' '}
              {dimensionName}
              {geo.dimension < Math.min(numVectors, dim === '2d' ? 2 : 3)
                ? ' (some vectors are linearly dependent)'
                : ''}
              .
            </Callout>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
