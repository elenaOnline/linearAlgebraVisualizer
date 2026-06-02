import type { Vec, Vec2, Vec3 } from '../../types'
import { Scene } from '../../scene/Scene'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { LatticeLines, LatticeDots } from '../../scene/LatticeLines'
import { VectorInput } from '../../ui/VectorInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useCoordinatesStore } from './store'
import { computeCoordinatesGeo } from './geometry'
import { V1, V2, V3 } from '../../styles/colors'
import styles from './Coordinates.module.css'

function fmt(n: number): string {
  return n.toFixed(3)
}

// ---- Left panel: standard basis scene content -------------------------------

interface StdSceneContentProps {
  vec: Vec2
  onDragVec: (pos: Vec3) => void
}

function StdSceneContent({ vec, onDragVec }: StdSceneContentProps) {
  const vec3: Vec3 = [vec[0], vec[1], 0]
  return (
    <>
      <VectorArrow vector={vec3} color={V1} label="v" showLabel />
      <DraggableHandle
        position={vec3}
        onDrag={onDragVec}
        color={V1}
        radius={0.13}
        dim="2d"
      />
    </>
  )
}

// ---- Right panel: custom basis scene content --------------------------------

interface CustomSceneContentProps {
  vec: Vec2
  v1: Vec2
  v2: Vec2
  latticePoints: Vec3[]
  basisIsValid: boolean
  onDragVec: (pos: Vec3) => void
  onDragV1: (pos: Vec3) => void
  onDragV2: (pos: Vec3) => void
}

function CustomSceneContent({
  vec,
  v1,
  v2,
  latticePoints,
  basisIsValid,
  onDragVec,
  onDragV1,
  onDragV2,
}: CustomSceneContentProps) {
  const vec3: Vec3 = [vec[0], vec[1], 0]
  const v13: Vec3 = [v1[0], v1[1], 0]
  const v23: Vec3 = [v2[0], v2[1], 0]
  const basisVecs: Vec3[] = [v13, v23]
  return (
    <>
      {/* Deformed coordinate grid (parallelogram lattice spanned by v₁, v₂) */}
      {basisIsValid && (
        <>
          <LatticeLines latticePoints={latticePoints} basisVecs={basisVecs} />
          <LatticeDots latticePoints={latticePoints} />
        </>
      )}
      {/* Basis vectors */}
      <VectorArrow vector={v13} color={V2} label="v₁" showLabel />
      <VectorArrow vector={v23} color={V3} label="v₂" showLabel />
      {/* Abstract vector — same object as in left panel */}
      <VectorArrow vector={vec3} color={V1} label="v" showLabel />
      {/* Draggable handles */}
      <DraggableHandle
        position={v13}
        onDrag={onDragV1}
        color={V2}
        radius={0.13}
        dim="2d"
      />
      <DraggableHandle
        position={v23}
        onDrag={onDragV2}
        color={V3}
        radius={0.13}
        dim="2d"
      />
      <DraggableHandle
        position={vec3}
        onDrag={onDragVec}
        color={V1}
        radius={0.13}
        dim="2d"
      />
    </>
  )
}

// ---- Main component ---------------------------------------------------------

export function Coordinates() {
  const { vec, v1, v2, setVec, setV1, setV2 } = useCoordinatesStore()

  const geo = computeCoordinatesGeo(vec, v1, v2)
  const { stdCoords, customCoords, basisIsValid, latticePoints } = geo

  const handleDragVec = (pos: Vec3) => {
    setVec([pos[0], pos[1]])
  }

  const handleDragV1 = (pos: Vec3) => {
    setV1([pos[0], pos[1]])
  }

  const handleDragV2 = (pos: Vec3) => {
    setV2([pos[0], pos[1]])
  }

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        {/* ---- Two scenes side by side ---- */}
        <div className={styles.splitPanels}>
          {/* Left: standard basis */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>Standard basis {'{'}e₁, e₂{'}'}</div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" frameloop="always">
                <StdSceneContent vec={vec} onDragVec={handleDragVec} />
              </Scene>
            </div>
            <div className={styles.coordReadout}>
              coordinates: <span className={styles.coordValue}>
                ({fmt(stdCoords[0])}, {fmt(stdCoords[1])})
              </span>
            </div>
          </div>

          {/* Right: custom basis */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>Custom basis {'{'}v₁, v₂{'}'}</div>
            <div className={styles.canvasWrap}>
              <Scene dim="2d" frameloop="always" showGrid={false}>
                <CustomSceneContent
                  vec={vec}
                  v1={v1}
                  v2={v2}
                  latticePoints={latticePoints}
                  basisIsValid={basisIsValid}
                  onDragVec={handleDragVec}
                  onDragV1={handleDragV1}
                  onDragV2={handleDragV2}
                />
              </Scene>
            </div>
            <div className={styles.coordReadout}>
              {basisIsValid && customCoords !== null ? (
                <>
                  coordinates: <span className={styles.coordValue}>
                    ({fmt(customCoords[0])}, {fmt(customCoords[1])})
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--v3)' }}>
                  basis is degenerate — coordinates undefined
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ---- Controls ---- */}
        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <div className={styles.row}>
              <div className={styles.section}>
                <VectorInput
                  value={vec}
                  onChange={(v: Vec) => setVec([v[0], v[1]])}
                  dim="2d"
                  label="Vector v"
                />
              </div>
              <div className={styles.section}>
                <VectorInput
                  value={v1}
                  onChange={(v: Vec) => setV1([v[0], v[1]])}
                  dim="2d"
                  label="Basis v₁"
                />
              </div>
              <div className={styles.section}>
                <VectorInput
                  value={v2}
                  onChange={(v: Vec) => setV2([v[0], v[1]])}
                  dim="2d"
                  label="Basis v₂"
                />
              </div>
            </div>

            {!basisIsValid && (
              <Callout variant="warning">
                v₁ and v₂ are linearly dependent — this is not a valid basis.
                Coordinates are undefined.
              </Callout>
            )}
          </div>
        </div>
      </div>

      {/* ---- Explanation rail ---- */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Coordinates and Bases">
          <div className={styles.explainInner}>
            <p>
              A <strong>coordinate system</strong> is a choice of basis. The same
              abstract vector has different numerical representations in different bases.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\mathbf{v} = x_1 \mathbf{v}_1 + x_2 \mathbf{v}_2"
                display
              />
            </div>

            <p>
              Given basis {'{'}v₁, v₂{'}'}, the coordinates (x₁, x₂) are the unique
              scalars solving the above equation. They exist if and only if the basis
              vectors are linearly independent (det ≠ 0).
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\begin{pmatrix}v_{1,x} & v_{2,x}\\ v_{1,y} & v_{2,y}\end{pmatrix}\begin{pmatrix}x_1\\x_2\end{pmatrix}=\mathbf{v}"
                display
              />
            </div>

            <p>
              The left panel shows the vector in the <em>standard</em> basis where
              coordinates equal the Cartesian components. The right panel shows the
              same abstract vector with a custom basis — the arrow doesn't move, but
              the numbers change.
            </p>

            <ul className={styles.tryList}>
              <li>Drag the vector tip in either panel — both update</li>
              <li>Drag v₁ or v₂ to change the basis — coordinates update, vector stays</li>
              <li>Make v₁ and v₂ parallel — the warning fires and coordinates become undefined</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
