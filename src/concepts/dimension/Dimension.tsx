import type { Vec, Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { SubspaceMesh } from '../../scene/SubspaceMesh'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { Panel } from '../../ui/Panel'
import { VectorInput } from '../../ui/VectorInput'
import { DimensionToggle } from '../../ui/DimensionToggle'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useDimensionStore } from './store'
import { deriveDimensionGeometry } from './geometry'
import styles from './Dimension.module.css'

// ---------------------------------------------------------------------------
// Color palette for up to 4 vectors
// ---------------------------------------------------------------------------
const VECTOR_COLORS = ['#e67e22', '#9b59b6', '#3498db', '#e74c3c']

// ---------------------------------------------------------------------------
// Scene content (inside Canvas)
// ---------------------------------------------------------------------------

interface SceneContentProps {
  geo: ReturnType<typeof deriveDimensionGeometry>
  vectorEntries: Array<{ id: string; vec: Vec; visible: boolean }>
  dim: import('../../types').Dim
  onDrag: (id: string, pos: Vec3) => void
}

function SceneContent({ geo, vectorEntries, dim, onDrag }: SceneContentProps) {
  const { spanSubspace, dimension } = geo

  return (
    <>
      {/* Span subspace mesh */}
      {dimension > 0 && (
        <SubspaceMesh
          geometry={spanSubspace}
          color="var(--color-span, #1abc9c)"
          opacity={0.28}
          dim={dim}
        />
      )}

      {/* Vector arrows and draggable handles */}
      {vectorEntries.map((entry, idx) => {
        if (!entry.visible) return null
        const status = geo.vectorStatuses.find((s) => s.id === entry.id)
        const vec3 = status?.vec3 ?? [0, 0, 0]
        const isIndep = status?.isIndependent ?? false
        const color = VECTOR_COLORS[idx % VECTOR_COLORS.length]
        const opacity = isIndep ? 1 : 0.55

        return (
          <group key={entry.id}>
            <VectorArrow
              vector={vec3}
              color={color}
              opacity={opacity}
              label={`v${idx + 1}`}
              showLabel
            />
            <DraggableHandle
              position={vec3}
              onDrag={(pos) => onDrag(entry.id, pos)}
              color={color}
              radius={0.13}
              dim={dim}
            />
          </group>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function Dimension() {
  const { dim, vectors, setDim, addVector, removeVector, updateVector, toggleVisible } =
    useDimensionStore()

  const geo = deriveDimensionGeometry(vectors, dim)
  const { dimension, numVectors, maxDimension } = geo

  const handleDrag = (id: string, pos: Vec3) => {
    const next: Vec = dim === '2d' ? [pos[0], pos[1]] : [pos[0], pos[1], pos[2]]
    updateVector(id, next)
  }

  // State-aware callout logic
  const atMaxDim = dimension >= maxDimension
  const hasDependentVisible = geo.vectorStatuses.some(
    (s) => s.isIndependent === false && vectors.find((e) => e.id === s.id)?.visible,
  )

  return (
    <div className={styles.layout}>
      {/* ---- Visualization region ---- */}
      <div className={styles.vizRegion}>
        <Scene dim={dim} frameloop="always">
          <SceneContent
            geo={geo}
            vectorEntries={vectors}
            dim={dim}
            onDrag={handleDrag}
          />
        </Scene>
      </div>

      {/* ---- Bottom row: sandbox + explanation ---- */}
      <div className={styles.bottomRow}>
        {/* Sandbox */}
        <div className={styles.sandboxRegion}>
          <div className={styles.sandboxInner}>
            {/* Space toggle */}
            <div className={styles.dimRow}>
              <span className={styles.sandboxLabel}>Space</span>
              <DimensionToggle value={dim} onChange={setDim} />
            </div>

            {/* Dimension readout */}
            <div className={styles.dimReadout}>
              <div className={styles.dimNumber}>dim&nbsp;=&nbsp;{dimension}</div>
              <div className={styles.dimStats}>
                <div>Vectors in set: {numVectors}</div>
                <div>Dimension of span: {dimension}</div>
              </div>
            </div>

            {/* Vector list */}
            <div className={styles.vectorList}>
              {vectors.map((entry, idx) => {
                const status = geo.vectorStatuses.find((s) => s.id === entry.id)
                const isVisible = entry.visible
                const isIndep = status?.isIndependent ?? false

                let badgeClass = styles.badgeHidden
                let badgeText = 'hidden'
                if (isVisible) {
                  badgeClass = isIndep ? styles.badgeIndependent : styles.badgeDependent
                  badgeText = isIndep ? 'independent' : 'dependent'
                }

                return (
                  <div
                    key={entry.id}
                    className={`${styles.vectorRow} ${!isVisible ? styles.vectorRowInvisible : ''}`}
                  >
                    {/* Visibility toggle */}
                    <button
                      className={`${styles.visibilityToggle} ${isVisible ? styles.visibilityToggleActive : ''}`}
                      onClick={() => toggleVisible(entry.id)}
                      title={isVisible ? 'Hide vector' : 'Show vector'}
                      aria-label={isVisible ? 'Hide vector' : 'Show vector'}
                    >
                      {isVisible ? '●' : '○'}
                    </button>

                    {/* Color swatch / label */}
                    <span
                      className={styles.vectorLabel}
                      style={{ color: VECTOR_COLORS[idx % VECTOR_COLORS.length] }}
                    >
                      v{idx + 1}
                    </span>

                    {/* Component inputs */}
                    <VectorInput
                      value={entry.vec}
                      onChange={(v) => updateVector(entry.id, v)}
                      dim={dim}
                    />

                    {/* Independent/dependent badge */}
                    <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>

                    {/* Remove button */}
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeVector(entry.id)}
                      disabled={vectors.length <= 1}
                      title="Remove vector"
                      aria-label="Remove vector"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Add vector button */}
            <div className={styles.addRow}>
              <button
                className={styles.addBtn}
                onClick={addVector}
                disabled={vectors.length >= 4}
              >
                + Add vector
              </button>
              {vectors.length >= 4 && (
                <span className={styles.sandboxLabel} style={{ fontSize: 11 }}>
                  (max 4)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className={styles.explanationRegion}>
          <Panel title="What is dimension?">
            <div className={styles.explainInner}>
              <p>
                <strong>Dimension</strong> tells you how many truly independent directions
                exist — the "degrees of freedom" in a space. It is the size of any basis,
                and every basis of a given space has exactly the same size.
              </p>

              <div className={styles.mathBlock}>
                <MathText
                  tex="\dim(V) = \text{size of any basis of } V = \operatorname{rank}(\text{spanning set})"
                  display
                />
              </div>

              <div className={styles.mathBlock}>
                <MathText
                  tex="\dim(\operatorname{span}\{v_1,\ldots,v_k\}) = \operatorname{rank}\begin{pmatrix}v_1 \\ \vdots \\ v_k\end{pmatrix}"
                  display
                />
              </div>

              <p>
                <strong>Key invariance:</strong> no matter which independent vectors you choose
                as your basis, the count is always the same.
              </p>

              <ul className={styles.tryList}>
                <li>Add a vector parallel to an existing one — dimension doesn't increase</li>
                <li>Add a truly independent vector — watch the span grow</li>
                <li>Try filling R² with 3 vectors — dimension stays 2</li>
                <li>Toggle visibility to see how each vector contributes</li>
              </ul>

              {/* State-aware callouts */}
              {numVectors === 0 && (
                <Callout variant="info">
                  No visible vectors. The span of the empty set is just the zero vector —
                  dimension 0.
                </Callout>
              )}

              {numVectors > 0 && (
                <Callout variant={dimension === numVectors ? 'success' : 'info'}>
                  These <strong>{numVectors}</strong> visible vector{numVectors !== 1 ? 's' : ''}{' '}
                  have a span of dimension <strong>{dimension}</strong>.
                </Callout>
              )}

              {hasDependentVisible && (
                <Callout variant="warning">
                  At least one vector lies inside the existing span — adding it doesn't
                  increase the dimension.
                </Callout>
              )}

              {atMaxDim && numVectors > 0 && (
                <Callout variant="warning">
                  Adding more vectors to a {dimension}-dimensional span in R
                  <sup>{maxDimension}</sup> cannot increase the dimension further.
                </Callout>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
