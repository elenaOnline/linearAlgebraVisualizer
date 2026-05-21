import { useMemo } from 'react'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Labels } from '../../scene/Labels'
import { MatrixInput } from '../../ui/MatrixInput'
import { VectorInput } from '../../ui/VectorInput'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useNullspaceStore } from './store'
import { deriveNullspaceGeometry } from './geometry'
import type { Vec3 } from '../../types'
import styles from './Nullspace.module.css'

const NULLSPACE_COLOR = '#e74c3c'
const PROBE_COLOR = '#f39c12'
const AX_COLOR = '#3498db'

export function Nullspace() {
  const { dim, A, x, constrainToNull, setDim, setA, setX, setConstrainToNull } =
    useNullspaceStore()

  const geo = useMemo(
    () => deriveNullspaceGeometry(A, x, constrainToNull, dim),
    [A, x, constrainToNull, dim],
  )

  // Displayed x position: if constrainToNull and we have a constrained version, use it
  const displayX: Vec3 =
    constrainToNull && geo.constrainedX != null ? geo.constrainedX : geo.x3

  // The displayed Ax: recompute from displayX for constrained case
  // (geometry already computes from the raw x, so we recompute inline)
  const displayAx: Vec3 = useMemo(() => {
    if (constrainToNull && geo.constrainedX != null) {
      // When constrained, Ax should be ≈ 0, show zero sphere
      return [0, 0, 0]
    }
    return geo.Ax3
  }, [constrainToNull, geo.constrainedX, geo.Ax3])

  // Drag handler: project onto nullspace when constrained
  const handleDragX = (rawPos: Vec3) => {
    if (dim === '2d') {
      // If constrainToNull and nullity>0, project onto nullspace
      if (constrainToNull && geo.nullityValue > 0) {
        // Project rawPos onto nullspace directions
        const dirs = geo.nullspaceSubspace.directions
        if (dirs && dirs.length === 1) {
          const d = dirs[0]
          const t = rawPos[0] * d[0] + rawPos[1] * d[1] + rawPos[2] * d[2]
          const proj: Vec3 = [d[0] * t, d[1] * t, d[2] * t]
          setX([proj[0], proj[1]])
        } else if (dirs && dirs.length >= 2) {
          // Project onto 2D subspace: entire space in 2D
          setX([rawPos[0], rawPos[1]])
        } else {
          // nullity >= n, whole space
          setX([rawPos[0], rawPos[1]])
        }
      } else {
        setX([rawPos[0], rawPos[1]])
      }
    } else {
      if (constrainToNull && geo.nullityValue > 0) {
        const dirs = geo.nullspaceSubspace.directions
        if (dirs && dirs.length === 1) {
          const d = dirs[0]
          const t = rawPos[0] * d[0] + rawPos[1] * d[1] + rawPos[2] * d[2]
          const proj: Vec3 = [d[0] * t, d[1] * t, d[2] * t]
          setX(proj)
        } else if (dirs && dirs.length >= 2) {
          const d1 = dirs[0]
          const d2 = dirs[1]
          const t1 = rawPos[0] * d1[0] + rawPos[1] * d1[1] + rawPos[2] * d1[2]
          const t2 = rawPos[0] * d2[0] + rawPos[1] * d2[1] + rawPos[2] * d2[2]
          const proj: Vec3 = [
            d1[0] * t1 + d2[0] * t2,
            d1[1] * t1 + d2[1] * t2,
            d1[2] * t1 + d2[2] * t2,
          ]
          setX(proj)
        } else {
          setX(rawPos)
        }
      } else {
        setX(rawPos)
      }
    }
  }

  const xLabel = 'x'
  const AxLabel = constrainToNull && geo.constrainedX != null ? 'Ax ≈ 0' : 'Ax'

  // Label positions with small offsets
  const xLabelPos: Vec3 = [displayX[0] + 0.15, displayX[1] + 0.2, displayX[2] + 0.15]
  const AxLabelPos: Vec3 = [
    displayAx[0] + 0.15,
    displayAx[1] + 0.2,
    displayAx[2] + 0.15,
  ]

  // Callout: is x in nullspace?
  const inNullCallout =
    constrainToNull && geo.constrainedX != null
      ? true
      : geo.isXInNull

  const nullityName =
    geo.nullityValue === 0
      ? '{0} (the origin only)'
      : geo.nullityValue === 1
        ? 'a line through the origin'
        : geo.nullityValue === 2
          ? 'a plane through the origin'
          : 'all of ℝⁿ'

  return (
    <div className={styles.layout}>
      {/* ── Visualization region ── */}
      <div className={styles.vizRegion}>
        <Scene dim={dim}>
          {/* Nullspace subspace */}
          <SubspaceMesh
            geometry={geo.nullspaceSubspace}
            color={NULLSPACE_COLOR}
            opacity={geo.nullityValue === 0 ? 1 : 0.3}
            dim={dim}
          />

          {/* Probe vector x */}
          <VectorArrow vector={displayX} color={PROBE_COLOR} label={xLabel} showLabel />
          <DraggableHandle
            position={displayX}
            onDrag={handleDragX}
            color={inNullCallout ? NULLSPACE_COLOR : PROBE_COLOR}
            radius={0.15}
            dim={dim}
          />

          {/* Image Ax */}
          <VectorArrow vector={displayAx} color={AX_COLOR} label={AxLabel} showLabel />

          {/* Labels */}
          <Labels
            items={[
              { position: xLabelPos, text: `x` },
              {
                position: AxLabelPos,
                text: inNullCallout ? 'Ax = 0' : `|Ax|=${geo.normAx.toFixed(2)}`,
              },
            ]}
          />
        </Scene>

        {/* Rank–nullity overlay */}
        <div className={styles.rankNullityOverlay}>
          <div className={styles.rankNullityTitle}>Rank–Nullity</div>
          <div className={styles.rankNullityRow}>
            <span>rank(A)</span>
            <span className={styles.rankValue}>{geo.rankValue}</span>
          </div>
          <div className={styles.rankNullityRow}>
            <span>nullity(A)</span>
            <span className={styles.nullityValue}>{geo.nullityValue}</span>
          </div>
          <div className={`${styles.rankNullityRow} ${styles.sumRow}`}>
            <span>sum</span>
            <span>{geo.rankValue} + {geo.nullityValue} = {geo.n}</span>
          </div>
          <div>
            {geo.isSingular ? (
              <span className={styles.singularBadge}>singular</span>
            ) : (
              <span className={styles.invertibleBadge}>invertible</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>
        {/* Sandbox */}
        <div className={styles.sandboxRegion}>
          <div className={styles.sandboxInner}>
            {/* Dimension toggle */}
            <div className={styles.dimRow}>
              <DimensionToggle value={dim} onChange={setDim} />
            </div>

            {/* Controls row */}
            <div className={styles.controlsRow}>
              {/* Matrix A */}
              <MatrixInput value={A} onChange={setA} dim={dim} label="A" />

              {/* Probe vector x */}
              <VectorInput value={x} onChange={setX} dim={dim} label="x" />
            </div>

            {/* Constrain mode */}
            <label
              className={`${styles.constrainRow} ${constrainToNull ? styles.active : ''}`}
            >
              <input
                type="checkbox"
                checked={constrainToNull}
                onChange={(e) => setConstrainToNull(e.target.checked)}
                disabled={geo.nullityValue === 0}
              />
              Constrain x to nullspace
              {geo.nullityValue === 0 && ' (nullspace = {0})'}
            </label>
          </div>
        </div>

        {/* Explanation */}
        <div className={styles.explanationRegion}>
          <div className={styles.explainInner}>
            <h4>Nullspace (Kernel)</h4>
            <p>
              The nullspace is the set of all vectors that the matrix "crushes to zero"
              — everything in the domain that maps to the origin.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex={`\\operatorname{null}(A) = \\ker(A) = \\{\\, x \\in \\mathbb{R}^n \\mid Ax = 0 \\,\\}`}
                display
              />
            </div>

            <div className={styles.mathBlock}>
              <MathText
                tex={`\\operatorname{rank}(A) + \\operatorname{nullity}(A) = n`}
                display
              />
            </div>

            <h4>Try this</h4>
            <ul className={styles.tryList}>
              <li>Make A the identity — nullspace = {'{'}<em>0</em>{'}'}, only the origin.</li>
              <li>Zero out an entire column of A — the nullspace jumps to a line.</li>
              <li>Try a rank-1 matrix (e.g. [[1,2],[2,4]]) — large nullspace!</li>
              <li>Enable "Constrain x" to drag x and watch Ax stay zero.</li>
            </ul>

            {/* State-aware callout */}
            <Callout variant={inNullCallout ? 'success' : 'info'}>
              <div className={styles.rankNullityCallout}>
                rank(A) = <span className={styles.highlight}>{geo.rankValue}</span>,{' '}
                nullity(A) = <span className={styles.highlight}>{geo.nullityValue}</span>,{' '}
                {geo.rankValue} + {geo.nullityValue} = {geo.n}
                <br />
                Nullspace is {nullityName}.
                <br />
                {inNullCallout
                  ? 'x is in the nullspace — Ax = 0.'
                  : `x is NOT in the nullspace — |Ax| = ${geo.normAx.toFixed(3)}.`}
              </div>
            </Callout>
          </div>
        </div>
      </div>
    </div>
  )
}
