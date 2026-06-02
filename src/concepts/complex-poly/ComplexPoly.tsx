import { useMemo } from 'react'
import type { Vec3 } from '../../types'
import type { Complex } from '../../types'
import { ArgandPlane } from '../../scene/ArgandPlane'
import { DomainColoringMesh } from '../../scene/DomainColoringMesh'
import { Scene } from '../../scene/Scene'
import { DraggableHandle } from '../../scene/DraggableHandle'
import { NumberInput } from '../../ui/NumberInput'
import { Panel } from '../../ui/Panel'
import { MathText } from '../../ui/MathText'
import { Callout } from '../../ui/Callout'
import { evalComplexPoly } from '../../linalg/complex'
import { useComplexPolyStore } from './store'
import { computeComplexPolyGeo } from './geometry'
import { V1, V2, V3 } from '../../styles/colors'
import styles from './ComplexPoly.module.css'

const BOUNDS = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }

// ---- Coefficient mini panel --------------------------------------------------

interface CoeffPanelProps {
  label: string
  value: Complex
  color: string
  onChange: (v: Complex) => void
}

function CoeffPanel({ label, value, color, onChange }: CoeffPanelProps) {
  const pos: Vec3 = [value[0], value[1], 0]
  const handleDrag = (p: Vec3) => onChange([p[0], p[1]])

  return (
    <div className={styles.coeffCard}>
      <div className={styles.coeffLabel}>{label}</div>
      <div className={styles.miniCanvas}>
        <ArgandPlane size="mini" showUnitCircle frameloop="always">
          <DraggableHandle
            position={pos}
            onDrag={handleDrag}
            color={color}
            radius={0.12}
            dim="2d"
          />
        </ArgandPlane>
      </div>
      <div className={styles.coeffInputs}>
        <div className={styles.coeffInputGroup}>
          <div className={styles.inputLabel}>Re</div>
          <NumberInput
            value={value[0]}
            onChange={(v) => onChange([v, value[1]])}
            step={0.1}
            showIntSlider
          />
        </div>
        <div className={styles.coeffInputGroup}>
          <div className={styles.inputLabel}>Im</div>
          <NumberInput
            value={value[1]}
            onChange={(v) => onChange([value[0], v])}
            step={0.1}
            showIntSlider
          />
        </div>
      </div>
    </div>
  )
}

// ---- Main component ----------------------------------------------------------

export function ComplexPoly() {
  const { a0, a1, a2, displayMode, setA0, setA1, setA2, setDisplayMode } =
    useComplexPolyStore()

  const geo = computeComplexPolyGeo(a0, a1, a2)
  const { isZero, isDoubleZero } = geo

  const polyFn = useMemo(
    () => (z: Complex) => evalComplexPoly([a0, a1, a2], z),
    [a0, a1, a2],
  )

  return (
    <div className={styles.body}>
      {/* Left column: three coefficient mini panels */}
      <div className={styles.leftCol}>
        <CoeffPanel label="a₀ — constant term" value={a0} color={V1} onChange={setA0} />
        <CoeffPanel label="a₁ — linear term" value={a1} color={V2} onChange={setA1} />
        <CoeffPanel label="a₂ — quadratic term" value={a2} color={V3} onChange={setA2} />
      </div>

      {/* Center column: main domain-coloring visualization */}
      <div className={styles.centerCol}>
        <div className={styles.topBar}>
          <span className={styles.modeLabel}>Display mode:</span>
          <button
            className={`${styles.modeBtn} ${displayMode === '2d' ? styles.modeBtnActive : ''}`}
            onClick={() => setDisplayMode('2d')}
          >
            2D coloring
          </button>
          <button
            className={`${styles.modeBtn} ${displayMode === '3d' ? styles.modeBtnActive : ''}`}
            onClick={() => setDisplayMode('3d')}
          >
            3D surface
          </button>
        </div>

        <div className={styles.mainCanvas}>
          <Scene dim={displayMode} frameloop="always">
            <DomainColoringMesh
              fn={polyFn}
              bounds={BOUNDS}
              resolution={128}
              mode={displayMode}
            />
          </Scene>
          <div className={styles.colorLegend}>
            Hue = arg(z) &nbsp;·&nbsp; Brightness = |z|
          </div>
        </div>

        <div className={styles.calloutsArea}>
          <Callout variant="info">
            Zeros are dark wells in the coloring — the color wheel makes one full
            rotation around each zero.
          </Callout>
          {isZero && (
            <Callout variant="warning">
              The zero polynomial has no zeros and no structure to show.
            </Callout>
          )}
          {isDoubleZero && !isZero && (
            <Callout variant="warning">
              Double zero — the discriminant is 0, both zeros coincide.
            </Callout>
          )}
        </div>
      </div>

      {/* Right rail: explanation */}
      <aside className={styles.rail}>
        <Panel eyebrow="Definition" title="Complex Polynomial">
          <div className={styles.explainInner}>
            <p>
              A degree-2 polynomial with complex coefficients maps each complex
              number <em>z</em> to another complex number:
            </p>
            <div className={styles.mathBlock}>
              <MathText
                tex="p(z) = a_0 + a_1 z + a_2 z^2, \quad a_i \in \mathbb{C}"
                display
              />
            </div>

            <p>
              <strong>Domain coloring</strong> visualizes a complex function by
              coloring each input point <em>z</em> according to the output{' '}
              <em>p(z)</em>: hue encodes the argument (angle) and brightness
              encodes the modulus (magnitude).
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="\text{hue} = \arg(p(z)), \quad \text{brightness} = |p(z)|"
                display
              />
            </div>

            <p>
              <strong>Zeros</strong> appear as dark wells where |p(z)| → 0, and
              the hue makes exactly one full rotation (winding number 1) around
              each simple zero.
            </p>

            <p>
              <strong>Fundamental Theorem of Algebra:</strong> a degree-2 polynomial
              over ℂ has exactly 2 zeros in ℂ, counting multiplicity.
            </p>

            <div className={styles.mathBlock}>
              <MathText
                tex="z_{1,2} = \frac{-a_1 \pm \sqrt{a_1^2 - 4a_0 a_2}}{2a_2}"
                display
              />
            </div>

            <p>
              The <strong>3D surface</strong> mode lifts |p(z)| as height above
              the complex plane, making the poles (growing magnitude) and zeros
              (touching zero) visible as peaks and valleys.
            </p>

            <ul className={styles.tryList}>
              <li>Drag a coefficient handle in the mini planes on the left</li>
              <li>Set a₂ = [1,0], a₁ = [0,0], a₀ = [−1,0] to see two real zeros</li>
              <li>Set a₀ = [1,0] to move the zeros to ±i</li>
              <li>Make a₂ = [0,0] to degrade to a linear polynomial</li>
              <li>Switch to 3D to see the magnitude as a height surface</li>
            </ul>
          </div>
        </Panel>
      </aside>
    </div>
  )
}
