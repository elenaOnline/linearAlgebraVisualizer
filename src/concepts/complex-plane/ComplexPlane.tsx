import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { Vec3 } from '../../types'
import type { Complex } from '../../types'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { VectorArrow } from '../../scene/VectorArrow'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { useComplexPlaneStore } from './store'
import { computeComplexPlaneGeo } from './geometry'
import { complexArg, complexMag, complexPolar } from '../../linalg/complex'
import { V1, V2, VP } from '../../styles/colors'
import styles from './ComplexPlane.module.css'

interface RotationArcProps {
  fromAngle: number
  toAngle: number
  radius: number
  color: string
}

function RotationArc({ fromAngle, toAngle, radius, color }: RotationArcProps) {
  const points = useMemo<[number, number, number][]>(() => {
    const N = 32
    const pts: [number, number, number][] = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const a = fromAngle + t * (toAngle - fromAngle)
      pts.push([radius * Math.cos(a), radius * Math.sin(a), 0])
    }
    return pts
  }, [fromAngle, toAngle, radius])
  return <Line points={points} color={color} lineWidth={2} />
}

function SceneContent({
  z,
  c,
  product,
  onDragZ,
  onDragC,
}: {
  z: Complex
  c: Complex
  product: Complex
  onDragZ: (pos: Vec3) => void
  onDragC: (pos: Vec3) => void
}) {
  const zMag = complexMag(z)
  const zArg = complexArg(z)
  const productArg = complexArg(product)

  return (
    <>
      {/* Vector arrows from origin */}
      <VectorArrow vector={[z[0], z[1], 0]} color={V1} label="z" showLabel />
      <VectorArrow vector={[c[0], c[1], 0]} color={V2} label="c" showLabel />
      <VectorArrow vector={[product[0], product[1], 0]} color={VP} label="c·z" showLabel />

      {/* Rotation arc from z to product */}
      {zMag > 0.05 && (
        <RotationArc
          fromAngle={zArg}
          toAngle={productArg}
          radius={zMag}
          color={VP}
        />
      )}

      {/* Draggable handles for z and c */}
      <DraggableHandle
        position={[z[0], z[1], 0]}
        onDrag={onDragZ}
        color={V1}
        radius={0.15}
        dim="2d"
      />
      <DraggableHandle
        position={[c[0], c[1], 0]}
        onDrag={onDragC}
        color={V2}
        radius={0.15}
        dim="2d"
      />
    </>
  )
}

export function ComplexPlane() {
  const { z, c, setZ, setC } = useComplexPlaneStore()
  const geo = computeComplexPlaneGeo(z, c)
  const { product, rotationAngle, scaleFactor, isPureRotation, cIsI, cMagIsZero } = geo

  const handleDragZ = (pos: Vec3) => setZ([pos[0], pos[1]])
  const handleDragC = (pos: Vec3) => setC([pos[0], pos[1]])

  return (
    <div className={styles.body}>
      <div className={styles.stageCol}>
        <div className={styles.sceneCard}>
          <ArgandPlane size="full" showUnitCircle frameloop="always">
            <SceneContent
              z={z}
              c={c}
              product={product}
              onDragZ={handleDragZ}
              onDragC={handleDragC}
            />
          </ArgandPlane>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <div className={styles.row}>
              <div className={styles.section}>
                <div className={styles.label}>Re(z)</div>
                <NumberInput value={z[0]} onChange={(v) => setZ([v, z[1]])} step={0.1} />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>Im(z)</div>
                <NumberInput value={z[1]} onChange={(v) => setZ([z[0], v])} step={0.1} />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>Re(c)</div>
                <NumberInput value={c[0]} onChange={(v) => setC([v, c[1]])} step={0.1} />
              </div>
              <div className={styles.section}>
                <div className={styles.label}>Im(c)</div>
                <NumberInput value={c[1]} onChange={(v) => setC([c[0], v])} step={0.1} />
              </div>
            </div>

            <hr className={styles.sectionDivider} />

            <div className={styles.sliderRow}>
              <div className={styles.sliderSection}>
                <div className={styles.sliderLabel}>|c| — scale factor ({scaleFactor.toFixed(3)})</div>
                <input
                  type="range"
                  className={styles.slider}
                  min={0}
                  max={3}
                  step={0.01}
                  value={scaleFactor}
                  onChange={(e) => setC(complexPolar(parseFloat(e.target.value), complexArg(c)))}
                />
              </div>
              <div className={styles.sliderSection}>
                <div className={styles.sliderLabel}>arg(c) — rotation ({rotationAngle.toFixed(3)} rad)</div>
                <input
                  type="range"
                  className={styles.slider}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.01}
                  value={rotationAngle}
                  onChange={(e) => setC(complexPolar(complexMag(c), parseFloat(e.target.value)))}
                />
              </div>
            </div>

            <div className={styles.calloutsArea}>
              {isPureRotation && !cIsI && (
                <Callout variant="info">
                  |c| = 1: unit complex scalars rotate without scaling. The product has the same magnitude as z.
                </Callout>
              )}
              {cIsI && (
                <Callout variant="info">
                  c ≈ i: multiplying by i is a quarter-turn (90° rotation) counterclockwise.
                </Callout>
              )}
              {cMagIsZero && (
                <Callout variant="warning">
                  c = 0: zero scalar collapses everything to the origin regardless of z.
                </Callout>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="The Complex Plane">
          <div className={styles.explainInner}>
            <p>
              Every complex number <em>z = a + bi</em> corresponds to a point (a, b) in the plane.
              The horizontal axis is the real part Re(z) and the vertical axis is the imaginary part Im(z).
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="z = a + bi \;\longleftrightarrow\; (a,\, b) \in \mathbb{R}^2" display />
            </div>

            <p>
              <strong>Multiplication is rotation + scaling.</strong> Multiplying z by c rotates z by
              arg(c) and scales it by |c|. This is something real multiplication cannot do — real
              scalars only scale, never rotate.
            </p>

            <div className={styles.mathBlock}>
              <MathText tex="c \cdot z = |c|\, e^{i\,\arg(c)} \cdot |z|\, e^{i\,\arg(z)} = |c||z|\, e^{i(\arg(c)+\arg(z))}" display />
            </div>

            <p>
              The product (green) is obtained by rotating z (red) by arg(c) and scaling by |c|.
              The blue arc shows the rotation.
            </p>

            <ul className={styles.tryList}>
              <li>Drag z (red) or c (blue) to update the product in real time</li>
              <li>Set |c| = 1 with the slider — pure rotation, no scaling</li>
              <li>Set arg(c) = π/2 — multiplying by i gives a 90° turn</li>
              <li>Set c = 0 — the product collapses to the origin</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
