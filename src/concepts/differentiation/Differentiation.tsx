import { useCallback } from 'react'
import type { Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { FunctionGraph } from '../../scene/FunctionGraph'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useDifferentiationStore } from './store'
import { computeDifferentiationGeo } from './geometry'
import { V1, V2, VP } from '../../styles/colors'
import styles from './Differentiation.module.css'

// Kernel geometry: the "1"-axis direction in P₂ coefficient space
const KERNEL_DIRECTION: Vec3 = [1, 0, 0]

// ---- Left panel scene content (P₂ domain) ----------------------------------

interface DomainContentProps {
  input: [number, number, number]
  showKernel: boolean
  onDrag: (pos: Vec3) => void
}

function DomainContent({ input, showKernel, onDrag }: DomainContentProps) {
  return (
    <>
      {showKernel && (
        <SubspaceMesh
          geometry={{ kind: 'line', directions: [KERNEL_DIRECTION] }}
          color={VP}
          opacity={0.5}
          dim="3d"
        />
      )}
      <VectorArrow vector={input} color={V1} />
      <DraggableHandle
        position={input}
        onDrag={onDrag}
        color={V1}
        radius={0.15}
        dim="3d"
      />
    </>
  )
}

// ---- Right panel scene content (P₁ codomain) --------------------------------

interface ImageContentProps {
  image: [number, number]
}

function ImageContent({ image }: ImageContentProps) {
  return <VectorArrow vector={[image[0], image[1], 0]} color={V2} />
}

// ---- Main component ---------------------------------------------------------

export function Differentiation() {
  const { a0, a1, a2, showKernel, setA0, setA1, setA2, setShowKernel } =
    useDifferentiationStore()

  const geo = computeDifferentiationGeo(a0, a1, a2)
  const { input, image, onKernel } = geo

  const handleDrag = (pos: Vec3) => {
    setA0(pos[0])
    setA1(pos[1])
    setA2(pos[2])
  }

  // Stable function references for FunctionGraph, closed over current coefficients.
  // useCallback ensures the function identity updates when coefficients change,
  // triggering FunctionGraph to recompute its sampled points.
  const fFn = useCallback((x: number) => a0 + a1 * x + a2 * x * x, [a0, a1, a2])
  const dfFn = useCallback((x: number) => a1 + 2 * a2 * x, [a1, a2])

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Left column: stacked scenes ---- */}
        <div className={styles.scenesCol}>
          {/* P₂ domain */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              Domain — P₂ coefficient space (axes: 1, x, x²)
            </div>
            <div className={styles.canvasWrap}>
              <Scene dim="3d" axisLabels={['1', 'x', 'x²']} frameloop="always">
                <DomainContent
                  input={input}
                  showKernel={showKernel}
                  onDrag={handleDrag}
                />
              </Scene>
            </div>
          </div>

          {/* P₁ codomain — read-only */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              Codomain — P₁ coefficient space (axes: 1, x)
            </div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" axisLabels={['1', 'x']} frameloop="always">
                <ImageContent image={image} />
              </Scene>
            </div>
          </div>
        </div>

        {/* ---- Right column: graph + controls ---- */}
        <div className={styles.graphCol}>
          {/* Function graph panel */}
          <div className={styles.graphPanel}>
            <div className={styles.panelHeader}>
              Graph — f(x) and f′(x) over x ∈ [−10, 10]
            </div>
            <div className={styles.graphLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: V1 }} />
                f(x) = a₀ + a₁x + a₂x²
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: V2 }} />
                f′(x) = a₁ + 2a₂x
              </span>
            </div>
            <div className={styles.graphCanvasWrap}>
              <Scene dim="2d" frameloop="always">
                <FunctionGraph fn={fFn} xMin={-10} xMax={10} color={V1} lineWidth={2} />
                <FunctionGraph fn={dfFn} xMin={-10} xMax={10} color={V2} lineWidth={2} />
              </Scene>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.controlsInner}>
              <div className={styles.row}>
                <div className={styles.section}>
                  <div className={styles.label}>a₀ (constant term)</div>
                  <NumberInput value={a0} onChange={setA0} step={0.1} showIntSlider />
                </div>
                <div className={styles.section}>
                  <div className={styles.label}>a₁ (x coefficient)</div>
                  <NumberInput value={a1} onChange={setA1} step={0.1} showIntSlider />
                </div>
                <div className={styles.section}>
                  <div className={styles.label}>a₂ (x² coefficient)</div>
                  <NumberInput value={a2} onChange={setA2} step={0.1} showIntSlider />
                </div>
              </div>

              <div className={styles.toggleRow}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={showKernel}
                    onChange={(e) => setShowKernel(e.target.checked)}
                  />
                  Show kernel of D (constant polynomial axis)
                </label>
              </div>

              {onKernel && (
                <Callout variant="info">
                  This polynomial is constant: its derivative is the zero polynomial.
                  Constant polynomials span the kernel of D.
                </Callout>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Differentiation as a Linear Map">
          <div className={styles.explainInner}>
            <p>
              The derivative <strong>D</strong> maps the space P₂ (polynomials of
              degree ≤ 2) to P₁ (polynomials of degree ≤ 1):
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="D(a_0 + a_1 x + a_2 x^2) = a_1 + 2a_2 x"
                display
              />
            </div>

            <p>
              In coefficient coordinates: the domain point (a₀, a₁, a₂) ∈ P₂ maps
              to the codomain point (a₁, 2a₂) ∈ P₁. The a₀ coordinate disappears —
              it is in the kernel.
            </p>

            <p>
              <strong>Rank-nullity theorem</strong> applied to D:
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\dim(\ker D) + \dim(\operatorname{im} D) = \dim(P_2)"
                display
              />
            </div>
            <div className={styles.mathBlock}>
              <MathText tex="1 + 2 = 3" display />
            </div>

            <p>
              The kernel (nullity = 1) is the line of constant polynomials along
              the "1"-axis. The image (rank = 2) is all of P₁. D is surjective but
              not injective.
            </p>

            <ul className={styles.tryList}>
              <li>Drag the point in the left panel — the right panel updates</li>
              <li>Move along the "1"-axis (change a₀ only) — the image stays fixed</li>
              <li>Set a₁ = a₂ = 0 — the right image collapses to the origin</li>
              <li>Toggle the kernel line to see where constant polynomials live</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
