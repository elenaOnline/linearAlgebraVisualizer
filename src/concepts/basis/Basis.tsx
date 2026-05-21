import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Vec, Vec3 } from '../../types'

import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Labels } from '../../scene/Labels'
import { Panel } from '../../ui/Panel'
import { VectorInput } from '../../ui/VectorInput'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useBasisStore } from './store'
import { deriveBasisGeometry } from './geometry'
import styles from './Basis.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 3): string {
  return n.toFixed(decimals)
}

// ── LatticeLines — renders the induced coordinate grid as line segments ──────

interface LatticeLinesProps {
  latticePoints: Vec3[]
  basisVecs: Vec3[]
}

function LatticeLines({ latticePoints, basisVecs }: LatticeLinesProps) {
  const geometry = useMemo(() => {
    if (latticePoints.length === 0 || basisVecs.length < 2) return null

    const positions: number[] = []

    // Build a fast lookup map from rounded coords to point
    const ptMap = new Map<string, Vec3>()
    const SNAP = 1e-4
    for (const pt of latticePoints) {
      const key = `${Math.round(pt[0] / SNAP)},${Math.round(pt[1] / SNAP)},${Math.round(pt[2] / SNAP)}`
      ptMap.set(key, pt)
    }

    const b1 = basisVecs[0]
    const b2 = basisVecs[1]
    const b3 = basisVecs.length >= 3 ? basisVecs[2] : null

    const dirs = b3 ? [b1, b2, b3] : [b1, b2]

    for (const pt of latticePoints) {
      for (const dir of dirs) {
        // Connect pt to pt + dir (i.e., one step in the basis direction)
        const neighbor: Vec3 = [pt[0] + dir[0], pt[1] + dir[1], pt[2] + dir[2]]
        const key = `${Math.round(neighbor[0] / SNAP)},${Math.round(neighbor[1] / SNAP)},${Math.round(neighbor[2] / SNAP)}`
        if (ptMap.has(key)) {
          positions.push(pt[0], pt[1], pt[2])
          positions.push(neighbor[0], neighbor[1], neighbor[2])
        }
      }
    }

    if (positions.length === 0) return null

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [latticePoints, basisVecs])

  if (!geometry) return null

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#f39c12"
        opacity={0.45}
        transparent
        linewidth={1}
      />
    </lineSegments>
  )
}

// ── LatticeDots — tiny spheres at each lattice point ─────────────────────────

interface LatticeDotsProps {
  latticePoints: Vec3[]
}

function LatticeDots({ latticePoints }: LatticeDotsProps) {
  // Instanced mesh for performance
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    const mesh = meshRef.current
    if (!mesh) return
    latticePoints.forEach((pt, i) => {
      dummy.position.set(pt[0], pt[1], pt[2])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [latticePoints, dummy])

  if (latticePoints.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, latticePoints.length]}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color="#f39c12" opacity={0.7} transparent />
    </instancedMesh>
  )
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
          <LatticeLines latticePoints={latticePoints} basisVecs={basisVecs} />
          <LatticeDots latticePoints={latticePoints} />
        </>
      )}

      {/* Basis vectors */}
      <VectorArrow vector={b1_3} color="#f39c12" label="b1" showLabel={false} />
      <VectorArrow vector={b2_3} color="#e94560" label="b2" showLabel={false} />
      {dim === '3d' && (
        <VectorArrow vector={b3_3} color="#1abc9c" label="b3" showLabel={false} />
      )}

      {/* Point p */}
      <mesh position={p3}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#9b59b6" />
      </mesh>

      {/* Draggable handles at tips of basis vectors */}
      <DraggableHandle position={b1_3} onDrag={onDragB1} color="#f39c12" radius={0.12} dim={dim} />
      <DraggableHandle position={b2_3} onDrag={onDragB2} color="#e94560" radius={0.12} dim={dim} />
      {dim === '3d' && (
        <DraggableHandle position={b3_3} onDrag={onDragB3} color="#1abc9c" radius={0.12} dim={dim} />
      )}
      {/* Draggable handle for point p */}
      <DraggableHandle position={p3} onDrag={onDragP} color="#9b59b6" radius={0.12} dim={dim} />

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
    <div className={styles.layout}>
      {/* ── Visualization ── */}
      <div className={styles.vizRegion}>
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

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>
        {/* Sandbox */}
        <div className={styles.sandboxRegion}>
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

        {/* Explanation */}
        <div className={styles.explanationRegion}>
          <Panel title="What is a basis?">
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
        </div>
      </div>
    </div>
  )
}
