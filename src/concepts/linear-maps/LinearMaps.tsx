import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec3, SubspaceGeometry, Dim, Mat2x2, Mat3x3 } from '../../types'
import { normalize, isZero } from '../../linalg/vector'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Labels } from '../../scene/Labels'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { Panel } from '../../ui/Panel'
import { MatrixInput } from '../../ui/MatrixInput'
import { VectorInput } from '../../ui/VectorInput'
import { Slider } from '../../ui/Slider'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useLinearMapsStore } from './store'
import { deriveLinearMapsGeometry } from './geometry'
import type { Vec } from '../../types'
import { V1, V2, V3, VP } from '../../styles/colors'
import styles from './LinearMaps.module.css'

// ---- helpers ----------------------------------------------------------------

function fmt4(n: number): string {
  // 4 significant figures
  if (!isFinite(n)) return 'N/A'
  if (Math.abs(n) < 1e-9) return '0'
  return parseFloat(n.toPrecision(4)).toString()
}

// ---- TransformedGrid --------------------------------------------------------

interface TransformedGridProps {
  gridLines: Array<[Vec3, Vec3]>
  color?: string
  opacity?: number
}

function TransformedGrid({ gridLines, color = V1, opacity = 0.30 }: TransformedGridProps) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const [start, end] of gridLines) {
      positions.push(start[0], start[1], start[2])
      positions.push(end[0], end[1], end[2])
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [gridLines])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} opacity={opacity} transparent linewidth={1} />
    </lineSegments>
  )
}

// ---- DetRegion2D ------------------------------------------------------------
// Renders the transformed unit square as a filled polygon

interface DetRegion2DProps {
  corners: Vec3[]  // 4 corners, in order
  isPositive: boolean
}

function DetRegion2D({ corners, isPositive }: DetRegion2DProps) {
  const { geom } = useMemo(() => {
    // Build a triangle fan from the 4 corners (always convex for unit square)
    const verts: number[] = []
    const idxs: number[] = []
    for (const c of corners) {
      verts.push(c[0], c[1], c[2])
    }
    // Two triangles: 0-1-2 and 0-2-3
    idxs.push(0, 1, 2, 0, 2, 3)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geom.setIndex(idxs)
    geom.computeVertexNormals()
    return { geom }
  }, [corners])

  const color = isPositive ? VP : V1

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial
        color={color}
        opacity={0.3}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ---- DetRegion3D ------------------------------------------------------------
// Renders the transformed unit cube edges

interface DetRegion3DProps {
  corners: Vec3[]  // 8 corners [0..7]
}

function DetRegion3D({ corners }: DetRegion3DProps) {
  const geometry = useMemo(() => {
    // Cube edges: pairs of corner indices
    // Ordering matches unitCubeCorners: [000, 100, 110, 010, 001, 101, 111, 011]
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
      [4, 5], [5, 6], [6, 7], [7, 4], // top face
      [0, 4], [1, 5], [2, 6], [3, 7], // vertical edges
    ]
    const positions: number[] = []
    for (const [a, b] of edges) {
      const ca = corners[a]
      const cb = corners[b]
      positions.push(ca[0], ca[1], ca[2])
      positions.push(cb[0], cb[1], cb[2])
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [corners])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={V3} opacity={0.6} transparent linewidth={1.5} />
    </lineSegments>
  )
}

// ---- ColumnSpaceSubspace ----------------------------------------------------

function buildColumnSpaceSubspace(
  col1: Vec3,
  col2: Vec3,
  col3: Vec3 | null,
): SubspaceGeometry {
  const cols: Vec3[] = [col1, col2]
  if (col3) cols.push(col3)

  const nonZero = cols.filter((c) => !isZero(c))
  if (nonZero.length === 0) return { kind: 'point' }

  // Check if col2 is linearly independent from col1
  const d1 = normalize(nonZero[0])
  if (nonZero.length === 1) return { kind: 'line', directions: [d1] }

  // Gram-Schmidt: project col2 onto perp of col1
  const v2 = nonZero[1]
  const proj = (d1[0] * v2[0] + d1[1] * v2[1] + d1[2] * v2[2])
  const perp: Vec3 = [
    v2[0] - proj * d1[0],
    v2[1] - proj * d1[1],
    v2[2] - proj * d1[2],
  ]

  if (isZero(perp, 1e-6)) {
    // col2 is parallel to col1 — still check col3
    if (nonZero.length >= 3) {
      const v3 = nonZero[2]
      const proj3 = (d1[0] * v3[0] + d1[1] * v3[1] + d1[2] * v3[2])
      const perp3: Vec3 = [
        v3[0] - proj3 * d1[0],
        v3[1] - proj3 * d1[1],
        v3[2] - proj3 * d1[2],
      ]
      if (!isZero(perp3, 1e-6)) {
        return { kind: 'plane', directions: [d1, normalize(perp3)] }
      }
    }
    return { kind: 'line', directions: [d1] }
  }

  const d2 = normalize(perp)

  // If 3D, check col3 for a third independent direction
  if (col3 && nonZero.length >= 3) {
    const v3 = nonZero[2]
    // Project out d1 and d2 components
    const p1 = d1[0] * v3[0] + d1[1] * v3[1] + d1[2] * v3[2]
    const p2 = d2[0] * v3[0] + d2[1] * v3[1] + d2[2] * v3[2]
    const perp3: Vec3 = [
      v3[0] - p1 * d1[0] - p2 * d2[0],
      v3[1] - p1 * d1[1] - p2 * d2[1],
      v3[2] - p1 * d1[2] - p2 * d2[2],
    ]
    if (!isZero(perp3, 1e-6)) {
      return { kind: 'space' }
    }
  }

  return { kind: 'plane', directions: [d1, d2] }
}

// ---- SceneContent -----------------------------------------------------------

interface SceneContentProps {
  geo: ReturnType<typeof deriveLinearMapsGeometry>
  showTransformedGrid: boolean
  showDetRegion: boolean
  showColumnSpace: boolean
  onDragV: (pos: Vec3) => void
  onDragCol1: (pos: Vec3) => void
  onDragCol2: (pos: Vec3) => void
  onDragCol3: ((pos: Vec3) => void) | null
  dim: Dim
}

function SceneContent({
  geo,
  showTransformedGrid,
  showDetRegion,
  showColumnSpace,
  onDragV,
  onDragCol1,
  onDragCol2,
  onDragCol3,
  dim,
}: SceneContentProps) {
  const { col1, col2, col3, v3, Av3, gridLines, unitShapeCorners, detA } = geo

  // Label positions
  const labelItems: Array<{ position: Vec3; text: string }> = [
    {
      position: [col1[0] * 1.15 + 0.15, col1[1] * 1.15 + 0.15, col1[2] * 1.15 + 0.15],
      text: 'Ae₁',
    },
    {
      position: [col2[0] * 1.15 + 0.15, col2[1] * 1.15 + 0.15, col2[2] * 1.15 + 0.15],
      text: 'Ae₂',
    },
    {
      position: [v3[0] * 1.15 + 0.1, v3[1] * 1.15 + 0.1, v3[2] * 1.15 + 0.1],
      text: 'v',
    },
    {
      position: [Av3[0] * 1.15 + 0.1, Av3[1] * 1.15 + 0.1, Av3[2] * 1.15 + 0.1],
      text: 'Av',
    },
  ]

  if (col3) {
    labelItems.push({
      position: [col3[0] * 1.15 + 0.15, col3[1] * 1.15 + 0.15, col3[2] * 1.15 + 0.15],
      text: 'Ae₃',
    })
  }

  const columnSpaceSubspace = showColumnSpace
    ? buildColumnSpaceSubspace(col1, col2, col3)
    : null

  return (
    <>
      {/* Transformed grid */}
      {showTransformedGrid && (
        <TransformedGrid gridLines={gridLines} color={V1} opacity={0.30} />
      )}

      {/* Determinant region */}
      {showDetRegion && dim === '2d' && unitShapeCorners.length === 4 && (
        <DetRegion2D corners={unitShapeCorners} isPositive={detA >= 0} />
      )}
      {showDetRegion && dim === '3d' && unitShapeCorners.length === 8 && (
        <DetRegion3D corners={unitShapeCorners} />
      )}

      {/* Column space — forest (vp) */}
      {columnSpaceSubspace && (
        <SubspaceMesh geometry={columnSpaceSubspace} color={VP} opacity={0.18} dim={dim} />
      )}

      {/* Standard basis vectors (faint) */}
      <VectorArrow vector={[1, 0, 0]} color={V1} opacity={0.20} showLabel={false} />
      <VectorArrow vector={[0, 1, 0]} color={V2} opacity={0.20} showLabel={false} />
      {dim === '3d' && (
        <VectorArrow vector={[0, 0, 1]} color={V3} opacity={0.20} showLabel={false} />
      )}

      {/* Transformed basis vectors (columns of A) */}
      <VectorArrow vector={col1} color={V1} showLabel={false} />
      <VectorArrow vector={col2} color={V2} showLabel={false} />
      {col3 && <VectorArrow vector={col3} color={V3} showLabel={false} />}

      {/* Draggable handles at column vector tips */}
      <DraggableHandle position={col1} onDrag={onDragCol1} color={V1} radius={0.13} dim={dim} />
      <DraggableHandle position={col2} onDrag={onDragCol2} color={V2} radius={0.13} dim={dim} />
      {col3 && onDragCol3 && (
        <DraggableHandle position={col3} onDrag={onDragCol3} color={V3} radius={0.13} dim={dim} />
      )}

      {/* Probe vector v (original, faint) */}
      <VectorArrow vector={v3} color={V3} opacity={0.45} showLabel={false} />

      {/* Transformed probe Av — ochre (v3) */}
      <VectorArrow vector={Av3} color={V3} showLabel={false} />

      {/* Draggable handle for v */}
      <DraggableHandle
        position={v3}
        onDrag={onDragV}
        color={V3}
        radius={0.13}
        dim={dim}
      />

      <Labels items={labelItems} />
    </>
  )
}

// ---- Main component ---------------------------------------------------------

export function LinearMaps() {
  const {
    dim,
    A,
    v,
    t,
    showTransformedGrid,
    showDetRegion,
    showColumnSpace,
    setDim,
    setA,
    setV,
    setT,
    setShowTransformedGrid,
    setShowDetRegion,
    setShowColumnSpace,
  } = useLinearMapsStore()

  const geo = deriveLinearMapsGeometry(A, v, t, dim)
  const { detA, isSingular } = geo

  const handleDragV = (pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    setV(next)
  }

  const handleDragCol1 = (pos: Vec3) => {
    if (dim === '2d') {
      const a = A as Mat2x2
      setA([[pos[0], a[0][1]], [pos[1], a[1][1]]])
    } else {
      const a = A as Mat3x3
      setA([[pos[0], a[0][1], a[0][2]], [pos[1], a[1][1], a[1][2]], [pos[2], a[2][1], a[2][2]]])
    }
  }

  const handleDragCol2 = (pos: Vec3) => {
    if (dim === '2d') {
      const a = A as Mat2x2
      setA([[a[0][0], pos[0]], [a[1][0], pos[1]]])
    } else {
      const a = A as Mat3x3
      setA([[a[0][0], pos[0], a[0][2]], [a[1][0], pos[1], a[1][2]], [a[2][0], pos[2], a[2][2]]])
    }
  }

  const handleDragCol3 = (pos: Vec3) => {
    if (dim === '3d') {
      const a = A as Mat3x3
      setA([[a[0][0], a[0][1], pos[0]], [a[1][0], a[1][1], pos[1]], [a[2][0], a[2][1], pos[2]]])
    }
  }

  const detLabel = `det(A) = ${fmt4(detA)}`
  const absDetLabel = `|det| = ${fmt4(Math.abs(detA))}`

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Visualization card ---- */}
        <div className={styles.stageViz}>
          <div className={styles.vh}>
            <em>T</em>(<em>x</em>) = <em>Ax</em>
            <span className={styles.grow} />
          </div>
          <div className={styles.canvas}>
            <Scene dim={dim} frameloop="always">
              <SceneContent
                geo={geo}
                showTransformedGrid={showTransformedGrid}
                showDetRegion={showDetRegion}
                showColumnSpace={showColumnSpace}
                onDragV={handleDragV}
                onDragCol1={handleDragCol1}
                onDragCol2={handleDragCol2}
                onDragCol3={dim === '3d' ? handleDragCol3 : null}
                dim={dim}
              />
            </Scene>

            {/* Det overlay */}
            <div className={styles.detOverlay}>
              <div>
                <span className={styles.detValue}>{detLabel}</span>
                {isSingular && <span className={styles.singularBadge}>Singular</span>}
              </div>
              <div>{absDetLabel}</div>
              {detA < -1e-9 && <div style={{ color: V1, fontSize: '11px' }}>Orientation reversed</div>}
            </div>
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

            <div className={styles.sandboxRow}>
              {/* Matrix input */}
              <div className={styles.sandboxSection}>
                <MatrixInput value={A} onChange={setA} dim={dim} label="Matrix A" />
              </div>

              {/* Probe vector */}
              <div className={styles.sandboxSection}>
                <VectorInput value={v} onChange={setV} dim={dim} label="Probe v" />
              </div>
            </div>

            {/* Interpolation slider */}
            <div className={styles.sandboxSection}>
              <Slider
                value={t}
                onChange={setT}
                min={0}
                max={1}
                step={0.01}
                label="Interpolation t (0 = identity, 1 = A)"
              />
            </div>

            {/* Toggles */}
            <div className={styles.togglesRow}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showTransformedGrid}
                  onChange={(e) => setShowTransformedGrid(e.target.checked)}
                />
                Transformed grid
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showDetRegion}
                  onChange={(e) => setShowDetRegion(e.target.checked)}
                />
                Unit {dim === '2d' ? 'square' : 'cube'} / det region
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={showColumnSpace}
                  onChange={(e) => setShowColumnSpace(e.target.checked)}
                />
                Column space
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* ---- Definition rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Matrices as Linear Maps">
            <div className={styles.explainInner}>
              <p>
                A matrix is a machine that stretches, rotates, reflects, and shears space — it maps
                every vector to a new vector according to the same rule.
              </p>

              <div className={styles.mathBlock}>
                <MathText tex="T(\mathbf{x}) = A\mathbf{x}" display />
              </div>

              <p>
                The columns of <MathText tex="A" /> are exactly the images of the standard basis
                vectors:
              </p>

              <div className={styles.mathBlock}>
                <MathText
                  tex="A\mathbf{e}_1 = \text{col}_1(A), \quad A\mathbf{e}_2 = \text{col}_2(A)"
                  display
                />
              </div>

              <p>
                The <strong>determinant</strong> of <MathText tex="A" /> is the signed
                area (2D) or signed volume (3D) scale factor. The unit square/cube image has
                area/volume equal to <MathText tex="|\det(A)|" />. When <MathText tex="\det(A) < 0" />,
                orientation is reversed.
              </p>

              <ul className={styles.tryList}>
                <li>
                  Try a rotation matrix: <MathText tex="A = \bigl[\begin{smallmatrix}0&-1\\1&0\end{smallmatrix}\bigr]" />
                </li>
                <li>Set a row to zero to make A singular (det = 0) and watch the grid collapse</li>
                <li>Use the t slider to watch space deform continuously from identity to A</li>
                <li>Toggle the column space to see what A&apos;s columns span</li>
              </ul>

              {/* State-aware callout */}
              {isSingular ? (
                <Callout variant="warning">
                  <strong>Singular matrix:</strong> det(A) ≈ 0. The transformation collapses space
                  onto a lower-dimensional subspace — rows or columns are linearly dependent. This
                  matrix is <em>not</em> invertible.
                </Callout>
              ) : (
                <Callout variant="info">
                  det(A) = {fmt4(detA)} — matrix A scales areas/volumes by |det(A)| ={' '}
                  {fmt4(Math.abs(detA))}.
                  {detA < -1e-9 && ' Orientation is reversed (det < 0).'}
                </Callout>
              )}
            </div>
          </Panel>
      </aside>
    </div>
  )
}
