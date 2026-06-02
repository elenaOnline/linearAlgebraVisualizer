import type { Vec, Vec3 } from '../../types'

import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { LatticeLines, LatticeDots } from '../../scene/LatticeLines'
import { Labels } from '../../scene/Labels'
import { Panel } from '../../ui/Panel'
import { VectorInput } from '../../ui/VectorInput'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useBasisStore } from './store'
import { deriveBasisGeometry } from './geometry'
import { V1, V2, V3, VP } from '../../styles/colors'
import styles from './Basis.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 3): string {
  return n.toFixed(decimals)
}

// ── SceneContent ─────────────────────────────────────────────────────────────

interface SceneContentProps {
  b1_3: Vec3
  b2_3: Vec3
  b3_3: Vec3
  p3: Vec3
  latticePoints: Vec3[]
  isBasis: boolean
  dim: import('../../types').Dim
  onDragB1: (pos: Vec3) => void
  onDragB2: (pos: Vec3) => void
  onDragB3: (pos: Vec3) => void
  onDragP: (pos: Vec3) => void
}

function SceneContent({
  b1_3,
  b2_3,
  b3_3,
  p3,
  latticePoints,
  isBasis,
  dim,
  onDragB1,
  onDragB2,
  onDragB3,
  onDragP,
}: SceneContentProps) {
  const labelItems: Array<{ position: Vec3; text: string }> = [
    {
      position: [b1_3[0] * 1.15 + 0.15, b1_3[1] * 1.15 + 0.15, b1_3[2] * 1.15 + 0.15],
      text: 'b₁',
    },
    {
      position: [b2_3[0] * 1.15 + 0.15, b2_3[1] * 1.15 + 0.15, b2_3[2] * 1.15 + 0.15],
      text: 'b₂',
    },
    {
      position: [p3[0] + 0.2, p3[1] + 0.2, p3[2] + 0.2],
      text: 'p',
    },
  ]

  if (dim === '3d') {
    labelItems.push({
      position: [b3_3[0] * 1.15 + 0.15, b3_3[1] * 1.15 + 0.15, b3_3[2] * 1.15 + 0.15],
      text: 'b₃',
    })
  }

  const basisVecs = dim === '3d' ? [b1_3, b2_3, b3_3] : [b1_3, b2_3]

  return (
    <>
      {/* Induced lattice — only when valid basis */}
      {isBasis && (
        <>
          <LatticeLines latticePoints={latticePoints} basisVecs={basisVecs} color={V1} opacity={0.30} />
          <LatticeDots latticePoints={latticePoints} color={V1} opacity={0.55} />
        </>
      )}

      {/* Basis vectors — Plate palette */}
      <VectorArrow vector={b1_3} color={V1} label="b1" showLabel={false} />
      <VectorArrow vector={b2_3} color={V2} label="b2" showLabel={false} />
      {dim === '3d' && (
        <VectorArrow vector={b3_3} color={V3} label="b3" showLabel={false} />
      )}

      {/* Point p — forest (derived/result) */}
      <mesh position={p3}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={VP} />
      </mesh>

      {/* Draggable handles at tips of basis vectors */}
      <DraggableHandle position={b1_3} onDrag={onDragB1} color={V1} radius={0.12} dim={dim} />
      <DraggableHandle position={b2_3} onDrag={onDragB2} color={V2} radius={0.12} dim={dim} />
      {dim === '3d' && (
        <DraggableHandle position={b3_3} onDrag={onDragB3} color={V3} radius={0.12} dim={dim} />
      )}
      {/* Draggable handle for point p */}
      <DraggableHandle position={p3} onDrag={onDragP} color={VP} radius={0.12} dim={dim} />

      <Labels items={labelItems} />
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Basis() {
  const { dim, b1, b2, b3, p, setDim, setB1, setB2, setB3, setP } = useBasisStore()

  const n = dim === '2d' ? 2 : 3
  const candidates = n === 2 ? [b1, b2] : [b1, b2, b3]
  const geo = deriveBasisGeometry(candidates, p, dim)

  const { vectors3, p3, isIndependent, doesSpan, isBasis, reasonIfNot, coordsStandard, coordsBasis, latticePoints } = geo

  const b1_3 = vectors3[0] ?? [1, 0, 0]
  const b2_3 = vectors3[1] ?? [0, 1, 0]
  const b3_3 = vectors3[2] ?? [0, 0, 1]

  // Drag handlers — clamp to active dimension
  const handleDragB1 = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setB1(next)
  }
  const handleDragB2 = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setB2(next)
  }
  const handleDragB3 = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setB3(next)
  }
  const handleDragP = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setP(next)
  }

  // Coordinate display helpers
  const stdStr = coordsStandard.map((c) => fmt(c)).join(', ')
  const basisStr = coordsBasis
    ? coordsBasis.map((c) => fmt(c)).join(', ')
    : null

  // Callout state
  const calloutVariant = isBasis ? 'success' : 'warning'

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ── Visualization card ── */}
        <div className={styles.stageViz}>
          <div className={styles.vh}>
            ℬ = &#123;<em>b</em><sub>1</sub>, …, <em>b</em><sub><em>n</em></sub>&#125;, <em>p</em> ∈ ℝ<sup><em>n</em></sup>
            <span className={styles.grow} />
          </div>
          <div className={styles.canvas}>
            <Scene dim={dim} frameloop="always">
              <SceneContent
                b1_3={b1_3}
                b2_3={b2_3}
                b3_3={b3_3}
                p3={p3}
                latticePoints={latticePoints}
                isBasis={isBasis}
                dim={dim}
                onDragB1={handleDragB1}
                onDragB2={handleDragB2}
                onDragB3={handleDragB3}
                onDragP={handleDragP}
              />
            </Scene>
          </div>
        </div>

        {/* ── Controls card ── */}
        <div className={styles.stageControls}>
          <div className={styles.sandboxInner}>
            {/* Dimension toggle */}
            <div className={styles.dimRow}>
              <span className={styles.sandboxLabel}>Space</span>
              <DimensionToggle value={dim} onChange={setDim} />
            </div>

            {/* Basis vector inputs */}
            <div className={styles.sandboxRow}>
              <div className={styles.sandboxSection}>
                <VectorInput value={b1} onChange={setB1} dim={dim} label="b₁ (orange)" />
              </div>
              <div className={styles.sandboxSection}>
                <VectorInput value={b2} onChange={setB2} dim={dim} label="b₂ (red)" />
              </div>
              {dim === '3d' && (
                <div className={styles.sandboxSection}>
                  <VectorInput value={b3} onChange={setB3} dim={dim} label="b₃ (teal)" />
                </div>
              )}
              <div className={styles.sandboxSection}>
                <VectorInput value={p} onChange={setP} dim={dim} label="p (purple)" />
              </div>
            </div>

            {/* Verdict badges */}
            <div className={styles.verdictRow}>
              <span
                className={`${styles.badge} ${isIndependent ? styles.badgePass : styles.badgeFail}`}
              >
                {isIndependent ? '✓' : '✗'} Independent
              </span>
              <span
                className={`${styles.badge} ${doesSpan ? styles.badgePass : styles.badgeFail}`}
              >
                {doesSpan ? '✓' : '✗'} Spans R{dim === '2d' ? '²' : '³'}
              </span>
              <span
                className={`${styles.badge} ${isBasis ? styles.badgePass : styles.badgeFail}`}
              >
                {isBasis ? '✓' : '✗'} Basis
              </span>
            </div>

            {/* Coordinates readout */}
            <div className={styles.coordsBox}>
              <div className={styles.coordsRow}>
                <span className={styles.coordsLabel}>p in standard basis:</span>
                <span className={styles.coordsValue}>({stdStr})</span>
              </div>
              <div className={styles.coordsRow}>
                <span className={styles.coordsLabel}>p in chosen basis:</span>
                <span className={styles.coordsValue}>
                  {basisStr ? `(α, β${dim === '3d' ? ', γ' : ''}) = (${basisStr})` : 'Not a basis'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Definition rail ── */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="What is a basis?">
            <div className={styles.explainInner}>
              <p>
                A <strong>basis</strong> is a linearly independent set that spans the whole space —
                exactly enough vectors to describe any point <em>uniquely</em>. A basis of R
                {dim === '2d' ? '²' : '³'} has exactly {dim === '2d' ? '2' : '3'} vectors.
              </p>

              <div className={styles.mathBlock}>
                <MathText
                  tex="\mathcal{B} = \{b_1, \ldots, b_n\} \text{ is a basis iff independent AND spans } \mathbb{R}^n"
                  display
                />
              </div>

              <div className={styles.mathBlock}>
                <MathText
                  tex="\forall\, p \in \mathbb{R}^n,\; \exists!\, (\alpha_1,\ldots,\alpha_n)\colon p = \alpha_1 b_1 + \cdots + \alpha_n b_n"
                  display
                />
              </div>

              <p>
                The golden payoff: every basis induces its own coordinate system. The grid you see
                (when a valid basis is formed) is the set of all <em>integer</em> linear combinations
                — the lattice of that basis.
              </p>

              <ul className={styles.tryList}>
                <li>Drag b₁ or b₂ to deform the grid live</li>
                <li>Make b₁ and b₂ parallel — independence fails, grid disappears</li>
                <li>Try the standard basis [1,0],[0,1] — the grid aligns with the background</li>
                <li>Move p around and watch its basis coordinates update</li>
              </ul>

              {/* State-aware callout */}
              <Callout variant={calloutVariant}>
                {isBasis ? (
                  <>
                    <strong>Valid basis</strong> — these {n} vectors are linearly independent and span
                    R{dim === '2d' ? '²' : '³'}. Point p has{' '}
                    <strong>unique coordinates</strong> in this basis.
                  </>
                ) : (
                  <>
                    <strong>Not a basis</strong> — {reasonIfNot}
                  </>
                )}
              </Callout>
            </div>
          </Panel>
      </aside>
    </div>
  )
}
