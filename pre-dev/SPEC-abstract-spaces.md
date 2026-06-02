# SPEC — Abstract Vector Spaces Phase

Technical design document for the eleven new visualization cards in the abstract
vector spaces phase. Implementation-ready: each card has a complete store spec,
geometry spec, test requirements, and verifiable goal criteria.

**Read alongside:** `CLAUDE.md` (operating rules) and `SPEC.md` (global requirements).
The verification protocol in `dev/PROTOCOL.md` and `CLAUDE.md §9` applies unchanged.

---

## 0. Preamble

### Relationship to SPEC.md

This document extends the original `SPEC.md` for eleven new concept cards. It does
not replace or modify `SPEC.md`; all global requirements G1–G12 carry over. The
following existing commitments apply to every new card:

- **Math/rendering split** (`CLAUDE.md §6.3`): all geometry derivation is in pure
  functions (`geometry.ts`) with unit tests. React/R3F components are a rendering
  layer only — they take already-computed geometry and draw it.
- **Registry pattern** (`CLAUDE.md §5`): adding a card = one new folder under
  `concepts/` + one line in `concepts/registry.ts`. No other file changes.
- **Concepts decouple** (`CLAUDE.md §10`): concepts never import from each other.
  Shared infrastructure lives in `scene/`, `ui/`, `linalg/`, and `styles/`.
- **Real-time requirement** (G5): every exposed variable updates the visualization
  immediately. No apply/submit/recompute buttons.
- **Mathematical honesty** (`SPEC.md §3`): all depictions are literal, not
  metaphorical. Degenerate states shown in real time.

### New ground covered by this document

The original seven concepts live in Rⁿ. This phase introduces:

- **Polynomial spaces** (Pₙ): vectors are polynomials; coefficient space is shown
  alongside the function graph.
- **Cross-space linear maps**: maps between spaces of different types/dimensions
  (e.g. differentiation D: P₂ → P₁).
- **Complex vector spaces** (ℂⁿ): complex scalars; domain coloring for
  four-dimensional relationships.

Where a space is higher-dimensional than can be drawn directly (e.g. ℂ²), the
design uses an honest combination of views that together describe it completely —
not a simplified stand-in. This is the same principle as SPEC.md §3.

### Domain coloring convention (standing default)

Whenever a complex number must be encoded as a color — in domain coloring of p(z),
in the ℂ² combined view — use:

- **Hue** → argument (angle) of the complex number, mapping 0 → 2π to the full
  color wheel (red at 0, cycling through yellow, green, cyan, blue, magenta, back
  to red at 2π).
- **Brightness** → magnitude of the complex number, with 0 mapping to black and
  larger values to full brightness (clamp at a reasonable maximum, e.g. 3 units).

This is the established domain coloring convention from complex analysis. Depart
from it only with documented reason. A color legend (circular hue ring + brightness
gradient, both labeled) must accompany every visualization that uses it.

---

## 1. New Shared Primitives

Phase A must implement these before any card work begins. The five new components
and one new linalg module are documented fully here. An agent implementing Phase A
reads this section only.

---

### 1.1 `src/linalg/complex.ts`

Pure functions with no imports from `linalg/` (self-contained). No React, no Three.
Required by Cards 4, 8, 9, 10, 11 and by several geometry.ts files.

```ts
/** [real, imaginary] */
export type Complex = [number, number]

export function complexAdd(a: Complex, b: Complex): Complex
// returns [a[0]+b[0], a[1]+b[1]]

export function complexSub(a: Complex, b: Complex): Complex
// returns [a[0]-b[0], a[1]-b[1]]

export function complexMul(a: Complex, b: Complex): Complex
// returns [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]

export function complexScale(z: Complex, r: number): Complex
// real scalar multiplication; returns [z[0]*r, z[1]*r]

export function complexMag(z: Complex): number
// returns Math.sqrt(z[0]**2 + z[1]**2)

export function complexArg(z: Complex): number
// principal argument in (-π, π]; returns Math.atan2(z[1], z[0])

export function complexPolar(r: number, theta: number): Complex
// returns [r*Math.cos(theta), r*Math.sin(theta)]

export function complexConj(z: Complex): Complex
// returns [z[0], -z[1]]

/**
 * Evaluate polynomial with complex coefficients at complex point z.
 * coeffs[0] = a₀ (constant), coeffs[1] = a₁, coeffs[2] = a₂ (highest degree).
 * Uses Horner's method.
 */
export function evalComplexPoly(coeffs: Complex[], z: Complex): Complex

export const COMPLEX_ZERO: Complex = [0, 0]
export const COMPLEX_ONE: Complex = [1, 0]
export const COMPLEX_I: Complex = [0, 1]
```

**Unit test requirements (`complex.test.ts`):**

- `complexAdd`: zero identity (`a + 0 = a`), commutativity spot-check
- `complexMul`: `i * i = -1`, `(1,0) * z = z`, `(0,1) * (0,1) = (-1,0)`
- `complexMag`: `|(3,4)| = 5`, `|0| = 0`
- `complexArg`: `arg(1,0) = 0`, `arg(0,1) = π/2`, `arg(-1,0) = ±π`
- `complexPolar`: round-trip with `complexArg` and `complexMag` within EPS
- `evalComplexPoly`: degree-0 constant, degree-1 linear, degree-2 quadratic at
  known values; verify at a known zero (e.g. `a₀ = 1, a₁ = 0, a₂ = -1` has zeros
  at `z = ±1`)

---

### 1.2 `src/scene/FunctionGraph.tsx`

A 2D curve renderer for function graphs. Renders as a `THREE.Line` (BufferGeometry
with `LineBasicMaterial`) in the z=0 plane. Intended for use inside `<Scene dim="2d">`.

```tsx
interface FunctionGraphProps {
  fn: (x: number) => number
  xMin: number
  xMax: number
  color?: string            // default: var(--v1) hex equivalent
  samples?: number          // default: 300
  label?: string            // optional in-scene label at x=xMax
  lineWidth?: number        // default: 2
}

export function FunctionGraph(props: FunctionGraphProps): JSX.Element
```

**Rendering notes:**
- Sample `samples` evenly spaced x values in `[xMin, xMax]`.
- Clamp output y to `[-20, 20]` (or a configurable `yClamp` prop) to prevent
  degenerate vertices when the function diverges.
- Recompute vertices when `fn`, `xMin`, `xMax`, or `samples` change (useMemo on
  the computed array, not on the Three.js object, so R3F can diff normally).
- The component must not compute any mathematics beyond sampling the provided `fn`;
  the caller provides the already-derived function.

No unit tests required (rendering-only component), but it must appear in the build.

---

### 1.3 `src/scene/StackingIndicators.tsx`

Renders vertical segment pairs at sampled x-values to show pointwise addition or
scalar scaling. Renders as `THREE.LineSegments` in the z=0 plane. For use inside
`<Scene dim="2d">`.

```tsx
interface StackingIndicatorsProps {
  /**
   * Each entry gives one column of two stacked segments.
   * lower segment: y=0 → y=baseY
   * upper segment: y=baseY → y=topY
   */
  samples: Array<{
    x: number
    baseY: number    // top of segment 1 / bottom of segment 2
    topY: number     // top of segment 2
  }>
  colorBottom: string    // segment 1 (y=0 → baseY)
  colorTop: string       // segment 2 (baseY → topY)
  lineWidth?: number     // default: 2
}

export function StackingIndicators(props: StackingIndicatorsProps): JSX.Element
```

**Note:** The caller (geometry.ts → component) provides the pre-computed sample
positions; this component only draws. Two `LineSegments` objects (one per color)
are used so each can have its own material.

---

### 1.4 `src/scene/ArgandPlane.tsx`

An Argand (complex) plane. Thin wrapper around `<Scene dim="2d">` that: (a) renders
a unit circle as a `THREE.LineLoop` (50 segments, subtle stroke color), and (b)
overrides the default axis label text to "Re" (x-axis) and "Im" (y-axis).

```tsx
interface ArgandPlaneProps {
  size?: 'full' | 'mini'   // 'full' = fills container; 'mini' = compact stacked view
  showUnitCircle?: boolean  // default: true
  children?: React.ReactNode
}

export function ArgandPlane(props: ArgandPlaneProps): JSX.Element
```

**Implementation note:** The existing `Scene.tsx` renders axis labels (via
`Labels.tsx`). To override these labels, either:
- Add an optional `axisLabels?: [string, string]` prop to `Labels.tsx` or `Axes.tsx`,
  or
- Render custom `<Text>` overlays inside `ArgandPlane` positioned at the axis tips.

Either approach is acceptable; the first is preferred as it keeps label customization
in the existing component hierarchy. Choose whichever avoids modifying Scene.tsx's
core camera/control logic.

The unit circle renders at radius 1 in world units. Use `--line-2` token color
(existing subtle line style) so it reads as a reference, not a primary object.

---

### 1.5 `src/scene/DomainColoringMesh.tsx`

Renders a domain coloring of a ℂ → ℂ function as either a flat 2D texture or a
3D height-mapped surface. CPU-side computation into a canvas, uploaded as
`THREE.CanvasTexture`.

```tsx
interface DomainColoringMeshProps {
  /**
   * The function to visualize. Must be pure and fast (called resolution² times
   * per render). Called on every change to coefficients.
   */
  fn: (z: Complex) => Complex
  bounds: {
    xMin: number; xMax: number
    yMin: number; yMax: number
  }
  resolution?: number     // default: 256; number of pixels per axis
  mode: '2d' | '3d'
}

export function DomainColoringMesh(props: DomainColoringMeshProps): JSX.Element
```

**Rendering strategy:**

1. On every change to `fn` or `bounds`, run `resolution × resolution` evaluations
   on the CPU, writing RGBA pixel data into an `ImageData` / `OffscreenCanvas`.
2. Pixel color encoding:
   - Hue = `complexArg(w) / (2π)` mapped to HSL hue (0–360°).
   - Lightness = `complexMag(w)` mapped through a sigmoid to `[0.1, 0.9]` so
     zeros approach black and large magnitudes approach white/bright.
   - Saturation = constant 0.85.
3. Upload the canvas as a `THREE.CanvasTexture` on a `PlaneGeometry` (for `mode='2d'`)
   or a `PlaneGeometry` with per-vertex height = clamp(`complexMag(w)`, 0, 3)
   (for `mode='3d'`).
4. `mode='3d'` requires vertex positions to be updated from the CPU-computed height
   grid; use a `BufferGeometry` with a mutable `position` attribute.
5. Memoize the evaluation: only recompute when `fn` inputs (coefficient values)
   change, not on every animation frame. The `fn` prop should be rebuilt by the
   caller only when coefficients change (using `useMemo` in the concept component
   keyed on coefficient state).

**Mathematical honesty:** The rendering is an approximation (finite resolution), but
this is inherent to any rasterization of a continuous field. Label the panel
"Domain coloring of p(z)" and include the color legend to make the encoding explicit.

---

### 1.6 Axis label customization (`src/scene/Labels.tsx` or `src/scene/Axes.tsx`)

Several new cards need non-standard axis labels (polynomial basis labels {1, x, x²},
complex plane labels {Re, Im}). Before implementing any card, add support for custom
axis labels to the shared scene layer.

**Proposed change:** Add an optional `axisLabels?: [string, string] | [string, string, string]`
prop to `Labels.tsx` (or wherever axis labels are currently rendered). Default values
should match the current behavior (e.g. `['x', 'y']` or `['x', 'y', 'z']`) so all
existing concepts are unaffected.

**Goal criteria for this change:**
- `grep 'axisLabels' src/scene/` returns a match.
- `npm run build && npm run test && npm run lint` exit 0.
- Existing concepts (in `src/concepts/`) are unmodified.

---

## 2. New Types

Add the following to `src/types.ts`. These are additions only — do not remove or
modify existing types.

```ts
/** [real, imaginary] — mirrors the type in src/linalg/complex.ts */
export type Complex = [number, number]

/** P₁ (degree ≤ 1, 2D coefficient space) or P₂ (degree ≤ 2, 3D) */
export type PolyDeg = 'p1' | 'p2'

/** A vector in ℂ² — a pair of complex numbers */
export type ComplexVec2 = [Complex, Complex]
```

**Note on `Complex` duplication:** `src/linalg/complex.ts` also declares `Complex`.
The type in `src/types.ts` is the shared import for concept stores and geometry.ts
files. Import from `src/types.ts` in all concept files. `src/linalg/complex.ts`
declares its own local alias to remain dependency-free.

---

## 3. Card Specifications

Eleven entries follow. Each entry is self-contained: a developer can implement a
card by reading its entry plus Sections 0–2 and the global rules in `CLAUDE.md`.

Registry slugs are kebab-case strings used as the `id` field in `ConceptMeta`.

---

### Card 1 — Polynomial Space

**Registry ID:** `poly-space`
**Title:** Polynomial Space
**Blurb:** A polynomial of degree ≤ 2 is a vector — move through coefficient space and watch the function update.
**Supports:** `['2d', '3d']` — here 2d/3d means P₁ (2D coefficient space) / P₂ (3D coefficient space). The `PolyDeg` toggle replaces the `DimensionToggle`.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (`dim="3d"` or `dim="2d"`) | Coefficient space with axes labeled {1, x, x²} (or {1, x} in P₁ mode). A draggable point represents the polynomial. A secondary read-only "same point, R³ labels" display sits below or beside the main view. |
| Right | R3F Scene (`dim="2d"`) | Standard x-y function plot using `FunctionGraph`. |

The secondary display (dual labeling) shows the same coefficient point rendered
twice side by side — once with {1, x, x²} axes and once with {x, y, z} axes — to
make the isomorphism P₂ ≅ R³ explicit. Both copies of the point are driven by the
same store state; neither is independently draggable.

#### Store spec (`concepts/poly-space/store.ts`)

```ts
interface PolySpaceState {
  deg: PolyDeg
  a0: number
  a1: number
  a2: number            // ignored (clamped to 0) when deg === 'p1'
  setDeg: (d: PolyDeg) => void
  setA0: (v: number) => void
  setA1: (v: number) => void
  setA2: (v: number) => void
}
// Initial state: deg='p2', a0=0, a1=1, a2=0.5
```

#### geometry.ts spec

```ts
interface PolySpaceGeo {
  effectiveA2: number          // a2 when deg='p2', 0 when deg='p1'
  graphPoints: Array<[number, number]>  // (x, f(x)) sampled pairs for FunctionGraph
  isZero: boolean              // all three effective coefficients are < EPS
  a2IsZero: boolean            // |effectiveA2| < EPS (point in a0-a1 plane)
  a1IsZero: boolean            // |a1| < EPS
}

function computePolySpaceGeo(
  deg: PolyDeg,
  a0: number,
  a1: number,
  a2: number,
  xMin?: number,   // default: -4
  xMax?: number,   // default: 4
): PolySpaceGeo
```

The function `f(x) = a0 + a1*x + effectiveA2*x²` is evaluated at 200 evenly spaced
x values for `graphPoints`. Graph points are clamped to `yClamp = ±8`.

#### geometry.test requirements

- Zero polynomial: `a0=a1=a2=0` → `isZero=true`, all `graphPoints` have y=0.
- Constant polynomial: `a0=3, a1=0, a2=0` → `a2IsZero=true`, `a1IsZero=true`, all graphPoints have y=3.
- Linear (`a2=0`): `a0=0, a1=1, a2=0` → `a2IsZero=true`, graphPoints form a line through origin.
- P₁ mode: `deg='p1', a2=5` → `effectiveA2=0` (a2 clamped).
- Real-time wiring: changing `a1` from 1 to 2 changes the slope of `graphPoints`.

#### Components used

- `Scene` (left, `dim="2d"` or `dim="3d"` based on `deg`)
- `DraggableHandle` (the coefficient point)
- `FunctionGraph` (right panel)
- `NumberInput` for a0, a1, a2
- Custom `PolyDeg` toggle button pair (styled same as `DimensionToggle`)
- `Callout` for special states
- `Panel` for sandboxes and explanations

#### Acceptance criteria

- Dragging the coefficient point updates the function graph in real time.
- Editing a numeric input moves the point and updates the graph.
- P₁/P₂ toggle switches the coefficient scene between 2D and 3D.
- In P₂ mode, the dual-labeling display shows the same point with {1, x, x²} and {x, y, z} axes simultaneously.
- When all coefficients = 0, the graph is the x-axis and a callout notes "zero vector."
- When `a2 = 0`, a callout notes that this polynomial is still in P₂ (lower-degree polynomials are valid).

#### Goal criteria

- `grep -r 'poly-space' src/concepts/registry.ts` returns a match.
- `grep -r 'FunctionGraph' src/concepts/poly-space/` returns a match.
- `grep -r 'isZero\|a2IsZero' src/concepts/poly-space/geometry.test.ts` returns matches.
- `npm run test` exits 0 with poly-space geometry tests passing.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The coefficient space axes **must** be labeled {1, x, x²}, not {x, y, z}. This
  is not cosmetic: the labels name the basis elements of the polynomial space.
- The dual-labeling display makes the isomorphism P₂ ≅ R³ explicit: the *same
  draggable point* gets *different meanings* depending on which label set is shown.
- Do not depict the polynomial space as "just like R³" without the dual label. The
  student must see that the space structure is identical but the coordinate meanings differ.
- The zero polynomial graphs to the x-axis — draw it honestly as a straight line on
  the x-axis, not as "nothing."

---

### Card 2 — Polynomial Addition

**Registry ID:** `poly-addition`
**Title:** Polynomial Addition
**Blurb:** Adding two polynomials adds their coefficient vectors — shown simultaneously in coefficient space and as stacked function curves.
**Supports:** `['2d', '3d']` (same PolyDeg semantics as Card 1)

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (2D or 3D per PolyDeg) | Two draggable coefficient points p and q; tip-to-tail construction showing p+q. Color A for p, Color B for q, neutral (--ink-3 hex) for sum. |
| Right | R3F Scene (`dim="2d"`) | Three `FunctionGraph` instances (f, g, h=f+g). `StackingIndicators` at ~6 evenly-spaced x values showing pointwise composition. |

#### Store spec

```ts
interface PolyAdditionState {
  deg: PolyDeg
  p: [number, number, number]    // [a0, a1, a2] for polynomial p
  q: [number, number, number]    // [a0, a1, a2] for polynomial q
  showIndicators: boolean
  setDeg: (d: PolyDeg) => void
  setP: (v: [number, number, number]) => void
  setQ: (v: [number, number, number]) => void
  setShowIndicators: (v: boolean) => void
}
// Initial: deg='p2', p=[0,1,0.5], q=[0,-0.5,0.3], showIndicators=true
```

#### geometry.ts spec

```ts
interface PolyAdditionGeo {
  pCoeffs: [number, number, number]
  qCoeffs: [number, number, number]
  sumCoeffs: [number, number, number]
  pGraph: Array<[number, number]>
  qGraph: Array<[number, number]>
  sumGraph: Array<[number, number]>
  stackingSamples: Array<{
    x: number
    fAtX: number      // f(x) = value of p at x
    sumAtX: number    // f(x)+g(x) = value of p+q at x
  }>
  sumIsZero: boolean
}

function computePolyAdditionGeo(
  deg: PolyDeg,
  p: [number, number, number],
  q: [number, number, number],
  xMin?: number,    // default: -4
  xMax?: number,    // default: 4
): PolyAdditionGeo
```

`stackingSamples` has exactly 6 evenly-spaced x values in `[xMin, xMax]`.
In P₁ mode, `p[2]` and `q[2]` are treated as 0.

#### geometry.test requirements

- Sum is zero: `p = [1,2,3], q = [-1,-2,-3]` → `sumIsZero=true`, all sumGraph y=0.
- Both zero: both p and q zero → sumIsZero=true.
- Stacking correctness: at each stacking sample x, `stackingSamples[i].sumAtX` must equal `f(x) + g(x)` within EPS.
- P₁ mode zeroes a2: `deg='p1', p[2]=5` → pCoeffs[2]=0 in output.
- Real-time wiring: changing q[0] changes sumCoeffs[0] by the same amount.

#### Components used

- `Scene` (left), `DraggableHandle` (two points + tip-to-tail arrow via `VectorArrow`)
- `FunctionGraph` × 3 (right)
- `StackingIndicators` (right, toggled by showIndicators)
- `NumberInput` × 6 (three per polynomial)
- `PolyDeg` toggle, toggle for showIndicators
- `Callout` for sumIsZero

#### Acceptance criteria

- Dragging either point updates all three curves and the stacking indicators in real time.
- The toggle correctly shows/hides stacking indicators without layout shift.
- When sum = 0, the sum graph is the x-axis and a callout notes this.
- Color coding is consistent: same color for a vector in coefficient space and its corresponding curve in the graph.

#### Goal criteria

- `grep -r 'poly-addition' src/concepts/registry.ts` returns a match.
- `grep -r 'StackingIndicators' src/concepts/poly-addition/` returns a match.
- `grep -r 'sumIsZero' src/concepts/poly-addition/geometry.test.ts` returns a match.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The stacking indicators are the literal pointwise-addition construction: each
  column of two segments at x shows that h(x) = f(x) + g(x) by physical stacking.
  Do not use shaded areas (which imply integration).
- The tip-to-tail construction in coefficient space and the stacking in function
  space are the *same operation* in their respective geometries. The callout should
  say this.

---

### Card 3 — Polynomial Scalar Multiplication

**Registry ID:** `poly-scalar-mul`
**Title:** Polynomial Scalar Multiplication
**Blurb:** Multiplying a polynomial by a scalar scales all coefficients — and flips the curve when the scalar is negative.
**Supports:** `['2d', '3d']` (PolyDeg semantics)

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (2D or 3D per PolyDeg) | One draggable point p; the scaled point c·p shown simultaneously, connected by a line through the origin. |
| Right | R3F Scene (`dim="2d"`) | Two `FunctionGraph` instances: f(x) and c·f(x). `StackingIndicators` showing the additive gap at 6 sample x values. |

#### Store spec

```ts
interface PolyScalarMulState {
  deg: PolyDeg
  p: [number, number, number]
  c: number                    // scalar; range slider -3..3, but numeric input unrestricted
  showIndicators: boolean
  setDeg: (d: PolyDeg) => void
  setP: (v: [number, number, number]) => void
  setC: (v: number) => void
  setShowIndicators: (v: boolean) => void
}
// Initial: deg='p2', p=[0,1,0.5], c=2, showIndicators=true
```

#### geometry.ts spec

```ts
interface PolyScalarMulGeo {
  pCoeffs: [number, number, number]
  scaledCoeffs: [number, number, number]  // c * pCoeffs (elementwise)
  pGraph: Array<[number, number]>
  scaledGraph: Array<[number, number]>
  stackingSamples: Array<{
    x: number
    fAtX: number        // f(x)
    scaledAtX: number   // c * f(x)
  }>
  cIsZero: boolean      // |c| < EPS
  cIsOne: boolean       // |c - 1| < EPS
  cIsNegative: boolean  // c < -EPS
}

function computePolyScalarMulGeo(
  deg: PolyDeg,
  p: [number, number, number],
  c: number,
  xMin?: number,
  xMax?: number,
): PolyScalarMulGeo
```

#### geometry.test requirements

- c=0: `cIsZero=true`, all scaledCoeffs=0, all scaledGraph y=0.
- c=1: `cIsOne=true`, scaledCoeffs equals pCoeffs, scaledGraph equals pGraph.
- c=-1: `cIsNegative=true`, scaledCoeffs are negated, scaledGraph is reflected.
- c=2: scaledCoeffs are doubled, stackingSamples[*].scaledAtX = 2 * fAtX.
- P₁ mode: p[2] treated as 0.
- Real-time wiring: changing c from 1 to 3 triples scaledCoeffs.

#### Components used

- `Scene` (left), `DraggableHandle` (point p + scaled point c·p)
- `FunctionGraph` × 2 (right)
- `StackingIndicators` (right)
- `Slider` for c (range -3..3, step 0.01)
- `NumberInput` for c and for p's three coefficients
- `Callout` for cIsZero, cIsNegative
- `PolyDeg` toggle

#### Acceptance criteria

- Dragging the scalar slider c updates the scaled point and scaled curve in real time.
- The line connecting p and c·p always passes through the origin.
- When c < 0, stacking segment 2 points downward (below f(x)), and the scaled curve is a vertical reflection.
- When c = 0, a callout notes "zero vector: this is the zero polynomial, reachable by scalar multiplication."
- When c = 1, stacking indicators are hidden (or zero-height) since the two curves coincide.
- The numeric input for c accepts values outside [-3, 3] (the slider clamps; the input does not).

#### Goal criteria

- `grep -r 'poly-scalar-mul' src/concepts/registry.ts` returns a match.
- `grep -r 'cIsZero\|cIsNegative' src/concepts/poly-scalar-mul/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The c < 0 case is mathematically important: it demonstrates that scalar
  multiplication includes reflection, not just stretching. Show it prominently
  (downward stacking segment, reflected curve) rather than treating it as an edge case.
- The line through the origin in the coefficient space view is the literal scalar
  subspace spanned by p — this is the honest geometric picture of scalar multiplication.

---

### Card 4 — Complex Polynomial

**Registry ID:** `complex-poly`
**Title:** Complex Polynomial
**Blurb:** When polynomial coefficients are complex, domain coloring reveals the full structure — including the roots.
**Supports:** `[]` — no PolyDeg or R²/R³ toggle. The card has its own 2D/3D display toggle for the domain coloring view.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | Three stacked `ArgandPlane` (mini size) | One mini Argand plane per coefficient: a₀ (top), a₁ (middle), a₂ (bottom). Labeled "a₀", "a₁", "a₂". Each has a draggable point. |
| Right | R3F Scene | Domain coloring of p(z) = a₀ + a₁z + a₂z². Defaults to 3D surface (height = |p(z)|, color = arg(p(z))). Toggle switches to flat 2D coloring. Color legend anchored to panel. |

#### Store spec

```ts
interface ComplexPolyState {
  a0: Complex
  a1: Complex
  a2: Complex
  displayMode: '3d' | '2d'    // 3D surface vs flat domain coloring
  setA0: (v: Complex) => void
  setA1: (v: Complex) => void
  setA2: (v: Complex) => void
  setDisplayMode: (m: '3d' | '2d') => void
}
// Initial: a0=[0,0], a1=[0,0], a2=[1,0], displayMode='3d'
// (This is z², a degree-2 polynomial with a double zero at z=0)
```

#### geometry.ts spec

```ts
interface ComplexPolyGeo {
  /**
   * Approximate zeros of p(z). For a degree-2 polynomial, 0, 1, or 2 zeros.
   * Computed analytically from the quadratic formula in ℂ.
   * Returns empty array if all coefficients are zero.
   */
  zeros: Complex[]
  /**
   * Whether the polynomial has a double zero (discriminant ≈ 0).
   * Discriminant = a1² - 4*a0*a2.
   */
  isDoubleZero: boolean
  /**
   * Whether the polynomial is identically zero (all coefficients < EPS in magnitude).
   */
  isZero: boolean
  /**
   * A snapshot of the color data for the domain coloring, for testing.
   * In production, DomainColoringMesh computes this directly from the fn prop.
   * In tests, this is the raw evaluated complex values at a coarse grid.
   */
  sampleGrid: Complex[][]     // resolution×resolution grid of p(z) values
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number }
}

function computeComplexPolyGeo(
  a0: Complex,
  a1: Complex,
  a2: Complex,
  gridResolution?: number,    // default: 8 for tests (256 for rendering)
  bounds?: { xMin: number; xMax: number; yMin: number; yMax: number }
): ComplexPolyGeo
```

**Note on DomainColoringMesh integration:** The geometry.ts function provides the
`zeros` array (analytically computed) and `isDoubleZero` flag for callout logic.
The actual pixel-level domain coloring is computed inside `DomainColoringMesh`
directly from a `fn` prop (the polynomial evaluator). The component receives the
function, not a pixel array, so the rendering resolution can be set independently
of geometry computation.

#### geometry.test requirements

- Zero polynomial: `a0=a1=a2=[0,0]` → `isZero=true`, `zeros=[]`.
- Degree-2 with two distinct real roots: `a2=[1,0], a1=[0,0], a0=[-1,0]` (z²-1)
  → `zeros` contains values near [1,0] and [-1,0] within EPS.
- Double zero: `a2=[1,0], a1=[0,0], a0=[0,0]` (z²) → `isDoubleZero=true`, one zero near [0,0].
- Complex zero: `a2=[1,0], a1=[0,0], a0=[1,0]` (z²+1) → `zeros` contains values near [0,1] and [0,-1].
- `sampleGrid` correctness: at z=(0,0), `sampleGrid` center value equals `a0`.

#### Components used

- `ArgandPlane` (3× mini, left panel)
- `DraggableHandle` (one per ArgandPlane)
- `DomainColoringMesh` (right panel, inside Scene)
- `NumberInput` for Re/Im of each coefficient (6 inputs total)
- Toggle button for displayMode
- Color legend component (new, inline in this card's TSX or as `src/ui/ColorLegend.tsx`)
- `Callout` for isDoubleZero, zeros list

#### Acceptance criteria

- Dragging any coefficient point updates the domain coloring/surface in real time.
- The 3D/2D toggle switches the right panel without clearing state.
- Zeros are visible as dark wells/points in the coloring.
- A callout identifies the number of zeros and their approximate locations.
- When the discriminant approaches zero (double zero), the callout updates to note this.
- The color legend is always visible alongside the domain coloring.

#### Goal criteria

- `grep -r 'complex-poly' src/concepts/registry.ts` returns a match.
- `grep -r 'DomainColoringMesh' src/concepts/complex-poly/` returns a match.
- `grep -r 'isDoubleZero\|zeros' src/concepts/complex-poly/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- Domain coloring is an established technique from complex analysis — label the
  panel and legend to make the encoding explicit (hue = angle, brightness = magnitude).
- The number of full hue cycles around a zero equals the order of that zero. For a
  degree-2 polynomial with two distinct zeros, each zero has one hue cycle. For a
  double zero, two hue cycles appear at one point. This is the visual instance of
  the fundamental theorem of algebra — acknowledge it in the explanation panel.
- The 3D surface view (height = |p(z)|) makes zeros visually obvious as wells
  touching the floor at z=0. Do not cap these wells; the descent to 0 is the
  mathematically meaningful feature.

---

### Card 5 — Differentiation as a Linear Map

**Registry ID:** `differentiation`
**Title:** Differentiation as a Linear Map
**Blurb:** The derivative maps P₂ to P₁ — a 3D space collapses onto a 2D space, with a visible kernel.
**Supports:** `[]` — fixed domain P₂ (3D) and codomain P₁ (2D).

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (`dim="3d"`) | P₂ coefficient space (axes {1, x, x²}). One draggable point (a₀, a₁, a₂). When kernel indicator is active, the kernel line (the "1" axis) is highlighted. |
| Right | R3F Scene (`dim="2d"`) | P₁ coefficient space (axes {1, x}). The image point (a₁, 2a₂) shown, updated in real time. Cannot be dragged (image is determined by domain). |

#### Store spec

```ts
interface DifferentiationState {
  a0: number
  a1: number
  a2: number
  showKernel: boolean
  setA0: (v: number) => void
  setA1: (v: number) => void
  setA2: (v: number) => void
  setShowKernel: (v: boolean) => void
}
// Initial: a0=0, a1=2, a2=1, showKernel=true
```

#### geometry.ts spec

```ts
interface DifferentiationGeo {
  input: [number, number, number]   // [a0, a1, a2]
  image: [number, number]           // [a1, 2*a2] — the derivative's coefficients
  onKernel: boolean                 // |a1| < EPS && |a2| < EPS
}

function computeDifferentiationGeo(
  a0: number,
  a1: number,
  a2: number
): DifferentiationGeo
```

#### geometry.test requirements

- Kernel input: `a0=3, a1=0, a2=0` → `onKernel=true`, `image=[0,0]`.
- Non-kernel: `a0=1, a1=2, a2=3` → `image=[2, 6]`, `onKernel=false`.
- Zero input: `a0=a1=a2=0` → `onKernel=true`, `image=[0,0]`.
- a0 independence: changing a0 does not change image (`a0` does not affect derivative).
- Real-time wiring: changing a2 from 1 to 2 changes `image[1]` from 2 to 4.

#### Components used

- `Scene` (left, `dim="3d"` with custom axisLabels `['1', 'x', 'x²']`)
- `Scene` (right, `dim="2d"` with custom axisLabels `['1', 'x']`)
- `DraggableHandle` (left panel only; right panel is read-only)
- `SubspaceMesh` (kernel line in left panel — `kind='line'`, shown when showKernel=true)
- `NumberInput` × 3 for a0, a1, a2
- Toggle for showKernel
- `Callout` for onKernel (note: constant polynomials have zero derivative)
- Explanation panel must note rank-nullity: dim(P₂)=3, nullity(D)=1, rank(D)=2.

#### Acceptance criteria

- Dragging the left point updates the right point in real time.
- When showKernel is active, the "1"-axis line is visually highlighted in the left panel.
- When the input is on the kernel (a₁=a₂=0), the right panel shows the origin and a callout fires.
- a0 can be dragged freely without affecting the image (a0 is in the kernel).
- Numeric inputs drive both panels.

#### Goal criteria

- `grep -r 'differentiation' src/concepts/registry.ts` returns a match.
- `grep -r 'onKernel' src/concepts/differentiation/geometry.test.ts` returns a match.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The kernel is the set of constant polynomials (a₁ = a₂ = 0) — a 1D subspace of
  P₂ (a line along the "1" axis). Render it using `SubspaceMesh kind='line'`, same
  as nullspace rendering in the existing `nullspace` concept. It is unbounded.
- The image of D is all of P₁ (the map is surjective onto P₁). State this in the
  explanation panel; it does not require special visual treatment.
- Rank-nullity theorem is directly visible: 3D domain, 1D kernel (nullity=1), 2D
  image (rank=2). The explanation panel must state this as a concrete instance.
- Do not invent a visual for "where does a₀ go?" — a₀ literally disappears under
  differentiation; the honest answer is it maps to 0, which is shown in the right
  panel for kernel inputs.

---

### Card 6 — Coordinates and Bases

**Registry ID:** `coordinates`
**Title:** Coordinates and Bases
**Blurb:** The same vector has different coordinates in different bases — a choice of basis is a choice of labeling.
**Supports:** `['2d']` only — R² for both panels. (R³ extension is a possible future addition; do not implement now.)

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (`dim="2d"`) | Standard basis {e₁=(1,0), e₂=(0,1)}. One draggable vector (its tip). Standard coordinates shown as readout. |
| Right | R3F Scene (`dim="2d"`) | Custom basis {v₁, v₂}. Same abstract vector shown in this basis. Basis vectors v₁, v₂ are draggable. Custom coordinates shown as readout. |

Dragging the vector in either panel syncs to the other. Dragging v₁ or v₂ changes
the coordinate display without moving the abstract vector.

#### Store spec

```ts
interface CoordinatesState {
  vec: Vec2            // the abstract vector (in standard coordinates)
  v1: Vec2             // first basis vector
  v2: Vec2             // second basis vector
  setVec: (v: Vec2) => void
  setV1: (v: Vec2) => void
  setV2: (v: Vec2) => void
}
// Initial: vec=[1,1], v1=[1,0.5], v2=[0.5,1]
```

#### geometry.ts spec

```ts
interface CoordinatesGeo {
  vec: Vec2
  stdCoords: Vec2           // same as vec (trivial, for symmetry)
  customCoords: Vec2 | null // null if |det([v1,v2])| < EPS
  basisIsValid: boolean     // |det([v1,v2])| >= EPS
  detValue: number          // det of [v1 | v2] matrix (signed)
}

function computeCoordinatesGeo(
  vec: Vec2,
  v1: Vec2,
  v2: Vec2
): CoordinatesGeo
```

`customCoords` is the solution to `[v1 | v2] * [x,y]ᵀ = vec`, computed via
2×2 matrix inversion: `x = (vec[0]*v2[1] - vec[1]*v2[0]) / det`, `y = (v1[0]*vec[1] - v1[1]*vec[0]) / det`.

#### geometry.test requirements

- Standard basis (v1=[1,0], v2=[0,1]): `customCoords` equals `vec`.
- Non-standard basis (v1=[2,0], v2=[0,1]): `customCoords` is scaled correctly.
- Near-singular: `v2 = [2+EPS/2, 0]` when `v1=[2,0]` → `basisIsValid=false`, `customCoords=null`.
- Exact singular: `v1=v2=[1,0]` → `basisIsValid=false`.
- Real-time wiring: changing v1 changes customCoords while leaving vec unchanged.

#### Components used

- `Scene` × 2 (`dim="2d"` for both)
- `VectorArrow` (the abstract vector in each panel)
- `DraggableHandle` (vector tip, v₁ tip, v₂ tip)
- `VectorInput` for vec, v1, v2
- `Callout` for basisIsValid=false (near-singular) and exact singular state
- `Panel`

#### Acceptance criteria

- Dragging the vector tip in the left panel updates the right panel's coordinate readout in real time.
- Dragging v₁ or v₂ updates the coordinate readout without moving the displayed vector.
- Dragging the vector tip in the right panel updates the left panel (bidirectional sync).
- When the basis is near-degenerate, a warning callout appears before coordinates blow up.
- When the basis is exactly degenerate, the right panel shows a "not a valid basis" message instead of coordinates.

#### Goal criteria

- `grep -r 'coordinates' src/concepts/registry.ts` returns a match.
- `grep -r 'basisIsValid\|customCoords' src/concepts/coordinates/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- Coordinates are not an intrinsic property of the vector — they depend on the
  chosen basis. The visualization makes this structural fact visible: the *abstract
  vector* (the arrow) does not change when the basis changes; only the numerical
  description changes.
- When v₁ and v₂ become linearly dependent, the coordinate system genuinely breaks —
  no valid coordinate expression exists. Show this as a "not a valid basis" state
  with a null display, not as a large or undefined number. Do not silently fudge
  the near-degenerate case into a seemingly valid coordinate pair.

---

### Card 7 — Isomorphic Spaces

**Registry ID:** `isomorphism`
**Title:** Isomorphic Spaces
**Blurb:** R² and the space of linear polynomials are structurally identical — the same abstract 2D space wearing different labels.
**Supports:** `[]` — fixed: R² on the left, P₁ on the right.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left | R3F Scene (`dim="2d"`) | Standard R² plane. One draggable vector (a, b). Arrow from origin. |
| Right (top) | R3F Scene (`dim="2d"`) | P₁ coefficient space (axes {1, x}). The corresponding polynomial b·1 + a·x shown as a point. Read-only (driven by left panel). |
| Right (bottom) | R3F Scene (`dim="2d"`) | Function graph: `FunctionGraph` of the polynomial f(x) = b + a·x. |

The mapping is labeled: "(a, b) ↦ b·1 + a·x" shown as a text label in the UI.

Note: the mapping sends the *x*-component (a) to the coefficient of x, and the
*y*-component (b) to the constant term. This is an explicit design choice from the
handoff: `x → x, y → constant`.

#### Store spec

```ts
interface IsomorphismState {
  a: number   // x-component of the R² vector → coefficient of x in the polynomial
  b: number   // y-component of the R² vector → constant term of the polynomial
  setA: (v: number) => void
  setB: (v: number) => void
}
// Initial: a=1.5, b=1
```

#### geometry.ts spec

```ts
interface IsomorphismGeo {
  vec: Vec2                           // (a, b)
  polyCoeffs: [number, number]        // [b, a] — (constant term, x coefficient)
  graphPoints: Array<[number, number]> // (x, f(x)) for f(x) = b + a*x
  isZero: boolean                     // |a| < EPS && |b| < EPS
  bIsZero: boolean                    // |b| < EPS — no constant term
  aIsZero: boolean                    // |a| < EPS — constant function
}

function computeIsomorphismGeo(
  a: number,
  b: number,
  xMin?: number,
  xMax?: number,
): IsomorphismGeo
```

#### geometry.test requirements

- Zero vector: `a=b=0` → `isZero=true`, all graphPoints y=0.
- b=0: `bIsZero=true`, graph passes through origin (f(0)=0).
- a=0: `aIsZero=true`, graph is horizontal at height b.
- Correctness: `a=2, b=1` → `polyCoeffs=[1,2]`, `graphPoints` at x=0 has y=1.
- Real-time wiring: changing a from 1 to 3 changes the slope of graphPoints.

#### Components used

- `Scene` (`dim="2d"`, left)
- `Scene` × 2 (`dim="2d"`, right — coefficient space + function graph)
- `VectorArrow` (left)
- `DraggableHandle` (left vector tip only; right panels are read-only)
- `FunctionGraph` (right bottom)
- `NumberInput` for a, b
- `Callout` for isZero, bIsZero, aIsZero
- Mapping label "(a, b) ↦ b·1 + a·x" as static text in the panel

#### Acceptance criteria

- Dragging the vector in the left panel updates both right sub-panels in real time.
- The mapping label is visible and correct.
- When b=0, a callout notes the polynomial has no constant term.
- When a=0, a callout notes the polynomial is a constant function.
- When at origin, a callout notes this is the zero polynomial.

#### Goal criteria

- `grep -r 'isomorphism' src/concepts/registry.ts` returns a match.
- `grep -r 'isZero\|bIsZero\|aIsZero' src/concepts/isomorphism/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The isomorphism is not "R² and P₁ look similar." They *are* the same abstract
  2D vector space. Every vector space fact (subspaces, span, independence) on the
  left has an exact counterpart on the right. The explanation panel must say this.
- The right sub-panels are deliberately read-only: the user drives from R², and the
  P₁ image follows. This direction reinforces that the map is a structural
  translation, not a two-way "comparison."
- Label the mapping formula clearly. Do not hide it or make it a tooltip — it is
  the central mathematical content of the card.

---

### Card 8 — The Complex Plane

**Registry ID:** `complex-plane`
**Title:** The Complex Plane
**Blurb:** Complex scalar multiplication rotates as well as scales — something real multiplication cannot do.
**Supports:** `[]` — single Argand plane view; no R²/R³ or PolyDeg toggle.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Main | `ArgandPlane` (full size) | Unit circle as persistent reference. Three labeled points: z (draggable, the vector), c (draggable, the scalar), c·z (computed, non-draggable). A curved arc shows the rotation angle arg(c). A line from origin to c·z shows the scale factor |c|. |

The arc sweeps from the direction of z to the direction of c·z, indicating
the rotation by arg(c). It is a `THREE.Line` following a circular arc path.

#### Store spec

```ts
interface ComplexPlaneState {
  z: Complex
  c: Complex
  setZ: (v: Complex) => void
  setC: (v: Complex) => void
}
// Initial: z=[1.5,0], c=[0.7,0.7]  (c ≈ unit circle at 45°)
```

#### geometry.ts spec

```ts
interface ComplexPlaneGeo {
  z: Complex
  c: Complex
  product: Complex          // c * z
  rotationAngle: number     // arg(c), in (-π, π]
  scaleFactor: number       // |c|
  isPureRotation: boolean   // ||c| - 1| < EPS
  cIsI: boolean             // ||c| - 1| < EPS && |arg(c) - π/2| < 0.05
  cMagIsZero: boolean       // |c| < EPS
  zIsZero: boolean          // |z| < EPS
}

function computeComplexPlaneGeo(
  z: Complex,
  c: Complex
): ComplexPlaneGeo
```

#### geometry.test requirements

- Identity: `c=[1,0]` → `product=z`, `rotationAngle=0`, `scaleFactor=1`, `isPureRotation=true`.
- c=i: `c=[0,1]` → `product=[-z[1],z[0]]` (90° rotation), `cIsI=true`.
- Scaling: `c=[2,0]` → `|product|=2*|z|`, `rotationAngle=0`.
- c=0: `cMagIsZero=true`, `product=[0,0]` regardless of z.
- General: `c=[1,1], z=[1,0]` → `product=[1,1]` (rotation by 45°, scale by √2).
- Real-time wiring: changing c changes product.

#### Components used

- `ArgandPlane` (full size)
- `DraggableHandle` × 2 (z and c; product is non-draggable)
- `VectorArrow` or `THREE.Line` for the three vectors
- Rotation arc renderer (inline `THREE.Line` following arc path of radius |z| from angle arg(z) to arg(c·z))
- `NumberInput` × 4 (Re/Im for z and c)
- `Slider` for |c| (magnitude) and arg(c) (angle), as an alternative input to dragging
- `Callout` for isPureRotation, cIsI, cMagIsZero
- `Panel`

**Note on magnitude/angle sliders:** These are an alternative (not primary) input path.
They must stay synchronized with the draggable point: dragging c updates the sliders;
moving a slider moves the c point. The store holds c as `Complex`; sliders derive
magnitude and angle on the fly (do not store them separately).

#### Acceptance criteria

- Dragging z or c updates the product c·z in real time.
- The rotation arc updates in real time as c is dragged around the unit circle.
- Magnitude and angle sliders are synchronized with the draggable c point.
- When |c|=1, a callout fires: "unit complex scalars rotate without scaling."
- When c=i (or near it), a callout fires: "multiplying by i is a quarter-turn."
- When |c|=0, the product is the origin regardless of z.

#### Goal criteria

- `grep -r 'complex-plane' src/concepts/registry.ts` returns a match.
- `grep -r 'isPureRotation\|cIsI\|rotationAngle' src/concepts/complex-plane/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- Complex scalar multiplication is not "like" rotation — it literally *is* a
  rotation-and-scaling. The arc shows the rotation geometrically as the angle swept
  from z to c·z.
- When c is a positive real number, there is no rotation (arg(c)=0); the product
  lies along the same ray as z. This is where real scalar multiplication "lives"
  inside complex scalar multiplication — state this in the explanation.
- The unit circle is not decorative: it marks the set of scalars that preserve
  magnitude (pure rotations). Label it "unit circle: |c|=1" in the scene.

---

### Card 9 — Vectors in Complex Space (ℂ²)

**Registry ID:** `complex-vectors`
**Title:** Vectors in ℂ²
**Blurb:** A vector in ℂ² has four real coordinates — shown honestly as two complex planes and a color-encoded point.
**Supports:** `[]` — fixed layout; no toggle.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left top | `ArgandPlane` (mini) | z₁ component. Draggable point. Unit circle. Labeled "z₁". |
| Left bottom | `ArgandPlane` (mini) | z₂ component. Draggable point. Unit circle. Labeled "z₂". |
| Right | R3F Scene (`dim="2d"`) | Combined view: single colored point at position (Re(z₁), Im(z₁)), hue=arg(z₂), brightness=|z₂|. Color legend anchored. |

All three displays are synchronized: drag in any view updates the others.

#### Store spec

```ts
interface ComplexVectorsState {
  vec: ComplexVec2     // [z1, z2]
  setVec: (v: ComplexVec2) => void
}
// Initial: vec=[[1,0],[0,1]]  (z1=1, z2=i — interesting starting state)
```

#### geometry.ts spec

```ts
interface ComplexVectorsGeo {
  z1: Complex
  z2: Complex
  z2Arg: number        // arg(z2), for hue encoding
  z2Mag: number        // |z2|, for brightness encoding
  z2IsZero: boolean    // |z2| < EPS
  vecIsZero: boolean   // |z1| < EPS && |z2| < EPS
  /** Point position in the combined view */
  combinedPos: [number, number]   // [Re(z1), Im(z1)]
}

function computeComplexVectorsGeo(
  vec: ComplexVec2
): ComplexVectorsGeo
```

#### geometry.test requirements

- z2=0: `z2IsZero=true`, `z2Arg` and `z2Mag` both 0.
- Both zero: `vecIsZero=true`.
- z1=[3,4]: `combinedPos=[3,4]`.
- z2=[0,1]: `z2Arg ≈ π/2`, `z2Mag=1`.
- Real-time wiring: changing z2 changes z2Arg without changing combinedPos.

#### Components used

- `ArgandPlane` × 2 (mini, left)
- `DraggableHandle` × 2 (one per plane)
- R3F `<mesh>` (right combined view: circle/point with computed hue/brightness material)
- Color legend (inline or via `ColorLegend` component)
- `NumberInput` × 4 (Re/Im for z1, Re/Im for z2)
- `Callout` for z2IsZero, vecIsZero

**Color encoding for the combined view point:** Use `THREE.MeshBasicMaterial` with
`color` set from HSL values computed from `z2Arg` and `z2Mag`. Update on store
change via a ref or imperative update inside `useFrame`. The point is rendered as a
circle at position `combinedPos`, with radius ~0.2 world units (large enough to see
clearly).

#### Acceptance criteria

- Dragging z₁ in the left-top plane updates the combined view position.
- Dragging z₂ in the left-bottom plane updates the combined view color (hue and brightness).
- Dragging the combined view point updates z₁ (position sync); z₂ is not controlled from the combined view (it is hue/brightness, not position).
- When z₂ = 0, the combined view point is black and a callout fires.
- Color legend is visible and legible.

#### Goal criteria

- `grep -r 'complex-vectors' src/concepts/registry.ts` returns a match.
- `grep -r 'z2IsZero\|vecIsZero\|z2Arg' src/concepts/complex-vectors/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- ℂ² has four real dimensions; no single geometric picture can show it directly.
  The component-plane + color-encoded view is honest precisely because it says this
  explicitly: "two views together describe what one view cannot." The explanation
  panel must state the four-real-dimension fact upfront.
- The combined view's color encoding uses hue=circular and arg=circular: this is a
  natural match, not an arbitrary choice. Label it clearly.
- The combined view is *not* draggable for z₂ — you cannot "drag" a hue. This
  limit is mathematically honest. The explanation panel should note it.

---

### Card 10 — Addition in Complex Space (ℂ²)

**Registry ID:** `complex-addition`
**Title:** Addition in ℂ²
**Blurb:** Adding two vectors in ℂ² adds each component independently — shown as two simultaneous tip-to-tail constructions.
**Supports:** `[]` — fixed layout.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left top | `ArgandPlane` (mini) | First components: z₁ and w₁ with tip-to-tail, sum z₁+w₁. Colors A, B, neutral. |
| Left bottom | `ArgandPlane` (mini) | Second components: z₂ and w₂ with tip-to-tail, sum z₂+w₂. Same color scheme. |
| Right | R3F Scene (`dim="2d"`) | Combined view: three colored points for u, v, and u+v. Callout noting combined view is less readable for addition. |

Color scheme: Color A = `--v1` (vermilion) for u's components, Color B = `--v2` (prussian) for v's components, neutral = `--ink-3` hex for sum's components.

#### Store spec

```ts
interface ComplexAdditionState {
  u: ComplexVec2     // [z1, z2] — first vector
  v: ComplexVec2     // [w1, w2] — second vector
  setU: (v: ComplexVec2) => void
  setV: (v: ComplexVec2) => void
}
// Initial: u=[[1,0],[0,0.5]], v=[[-0.5,0.5],[0.3,0.3]]
```

#### geometry.ts spec

```ts
interface ComplexAdditionGeo {
  u: ComplexVec2
  v: ComplexVec2
  sum: ComplexVec2           // [z1+w1, z2+w2]
  sumZ1: Complex
  sumZ2: Complex
  sumZ2Arg: number
  sumZ2Mag: number
  uZ2Arg: number; uZ2Mag: number
  vZ2Arg: number; vZ2Mag: number
  sumIsZero: boolean         // |sum[0]| < EPS && |sum[1]| < EPS
  uEqualsV: boolean          // |u[0]-v[0]| < EPS && |u[1]-v[1]| < EPS
}

function computeComplexAdditionGeo(
  u: ComplexVec2,
  v: ComplexVec2
): ComplexAdditionGeo
```

#### geometry.test requirements

- u+v=zero: `u=[[1,0],[0,1]], v=[[-1,0],[0,-1]]` → `sumIsZero=true`.
- u=v: `u=v=[[1,0],[0,1]]` → `uEqualsV=true`, `sum=[[2,0],[0,2]]`.
- Component correctness: `sum[0] = complexAdd(u[0], v[0])` and `sum[1] = complexAdd(u[1], v[1])`.
- Real-time wiring: changing u[0] changes sum[0].

#### Components used

- `ArgandPlane` × 2 (mini, left) with tip-to-tail construction (three `VectorArrow` instances per plane)
- R3F combined view (right) with three circle markers
- `NumberInput` × 8 (Re/Im for u[0], u[1], v[0], v[1])
- `Callout` for sumIsZero, uEqualsV, and the persistent "combined view limitation" note

#### Acceptance criteria

- Dragging any of the four component points updates both planes and the combined view in real time.
- Tip-to-tail construction is visible in each plane with correct color coding.
- The combined view shows three colored points without implying the color of the sum is a blend.
- The "combined view is less readable for addition" callout is always visible (not a special state).

#### Goal criteria

- `grep -r 'complex-addition' src/concepts/registry.ts` returns a match.
- `grep -r 'sumIsZero\|uEqualsV' src/concepts/complex-addition/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The combined view limitation for addition is mathematically real: hue does not
  add the way position does. Do not suppress this fact or hide the callout. Stating
  the limitation is more honest than pretending the combined view works for addition.
- The two tip-to-tail constructions in the left planes are the primary teaching
  tool here — they are the honest literal picture. The combined view is secondary.

---

### Card 11 — Scalar Multiplication in ℂ²

**Registry ID:** `complex-scalar-mul`
**Title:** Scalar Multiplication in ℂ²
**Blurb:** A complex scalar rotates and scales both components simultaneously — visible as spatial rotation and hue shift at once.
**Supports:** `[]` — fixed layout.

#### Panels

| Panel | Type | Description |
|---|---|---|
| Left top | `ArgandPlane` (mini) | z₁ component: input point and scaled c·z₁. Rotation arc shown. |
| Left bottom | `ArgandPlane` (mini) | z₂ component: input point and scaled c·z₂. Same rotation arc. |
| Right | R3F Scene (`dim="2d"`) | Combined view: two colored points — input vec and scaled c·vec. Spatial position, hue, and brightness all updated. |

The combined view is the primary teaching tool for this card (unlike Card 10 where it was secondary). The same scalar operation is visible simultaneously as:
- Spatial rotation/scale in both left planes (z₁ and z₂ components)
- Position rotation/scale + hue shift + brightness change in the right combined view

#### Store spec

```ts
interface ComplexScalarMulState {
  vec: ComplexVec2     // [z1, z2] — the input vector
  c: Complex           // the scalar
  setVec: (v: ComplexVec2) => void
  setC: (v: Complex) => void
}
// Initial: vec=[[1,0],[0,1]], c=[0.7,0.7]
```

#### geometry.ts spec

```ts
interface ComplexScalarMulGeo {
  vec: ComplexVec2
  c: Complex
  scaled: ComplexVec2       // [c*z1, c*z2]
  scaledZ1: Complex
  scaledZ2: Complex
  scaledZ2Arg: number
  scaledZ2Mag: number
  inputZ2Arg: number; inputZ2Mag: number
  rotationAngle: number     // arg(c), in (-π, π]
  scaleFactor: number       // |c|
  isPureRotation: boolean   // ||c| - 1| < EPS
  cIsI: boolean             // ||c| - 1| < EPS && |arg(c) - π/2| < 0.05
  cMagIsZero: boolean       // |c| < EPS
  cIsPositiveReal: boolean  // Im(c) < EPS && Re(c) > EPS
}

function computeComplexScalarMulGeo(
  vec: ComplexVec2,
  c: Complex
): ComplexScalarMulGeo
```

#### geometry.test requirements

- c=1: `isPureRotation=true` (trivially), `scaled=vec`, `rotationAngle≈0`.
- c=i: `cIsI=true`, `scaled[0]=complexMul(vec[0],[0,1])` (90° rotation), `rotationAngle≈π/2`.
- c=0: `cMagIsZero=true`, both components of scaled = [0,0].
- c=[2,0] (positive real): `cIsPositiveReal=true`, `rotationAngle≈0`, both components scaled by 2.
- |c|=1: `isPureRotation=true`, `scaledZ2Mag ≈ inputZ2Mag` within EPS.
- Real-time wiring: changing c changes scaled.

#### Components used

- `ArgandPlane` × 2 (mini, left) each with input + scaled point and rotation arc
- R3F combined view (right) with two colored circle markers (input and scaled)
- `Slider` for |c| (range 0..3)
- `Slider` or angle control for arg(c) (range 0..2π)
- `NumberInput` × 2 for Re(c), Im(c) — synchronized with magnitude/angle sliders
- `NumberInput` × 4 for Re(z₁), Im(z₁), Re(z₂), Im(z₂)
- `DraggableHandle` in each ArgandPlane (one per plane for input vector component)
- `Callout` for isPureRotation, cIsI, cMagIsZero, cIsPositiveReal

**Scalar input synchronization:** The store holds c as `Complex`. The magnitude
slider and angle slider derive their values from `complexMag(c)` and `complexArg(c)`
on render. When a slider changes, it computes the new c via `complexPolar(mag, angle)`
and calls `setC`. When the numeric inputs change, they call `setC` directly. All
three input paths are synchronized through the single `c: Complex` store field.

#### Acceptance criteria

- Dragging a vector component point updates the scaled result in real time in both planes and the combined view.
- Moving the magnitude slider updates both left planes and the combined view.
- Moving the angle slider rotates both scaled points and shifts the hue in the combined view.
- Numeric inputs for Re(c), Im(c) stay synchronized with the sliders.
- When |c|=1, a callout fires: "unit complex scalars rotate without changing magnitude."
- When arg(c)=π/2, a callout fires: "multiplying by i is a quarter-turn."
- When c is a positive real, a callout fires: "no rotation — only scaling."
- When |c|=0, both components collapse to origin and brightness collapses to zero.

#### Goal criteria

- `grep -r 'complex-scalar-mul' src/concepts/registry.ts` returns a match.
- `grep -r 'isPureRotation\|cIsI\|cIsPositiveReal\|cMagIsZero' src/concepts/complex-scalar-mul/geometry.test.ts` returns matches.
- `npm run test` exits 0.
- `npm run build && npm run lint` exit 0.

#### Honesty notes

- The combined view earns its place here: the *same* rotation angle is visible as a
  spatial rotation (position change) AND as a hue shift. The *same* scale factor is
  visible as distance from origin AND as brightness. These are two perceptual channels
  encoding the same operation — honest because both channels encode what is actually
  mathematically happening.
- Rotation arc in each Argand plane should sweep from input to scaled with radius =
  |input component|. When |input component| = 0, no arc is drawn (nothing to rotate).

---

## 4. Phase Plan

Three phases; Phase B groups are independent and can be parallelized.

```
Phase A — Foundations (sequential, complete before Phase B)
  ├─ Add Complex type to src/types.ts
  ├─ Add PolyDeg type to src/types.ts
  ├─ Add ComplexVec2 type to src/types.ts
  ├─ src/linalg/complex.ts + complex.test.ts
  ├─ src/scene/FunctionGraph.tsx
  ├─ src/scene/StackingIndicators.tsx
  ├─ src/scene/ArgandPlane.tsx
  ├─ src/scene/DomainColoringMesh.tsx
  └─ axisLabels prop for src/scene/Labels.tsx or Axes.tsx

Phase B — Cards (Phase A must be complete; Groups 1–4 are independent)
  ┌─ Group 1: Polynomial (sequential within group — each builds on Card 1's layout)
  │   Card 1 (poly-space) → Card 2 (poly-addition) → Card 3 (poly-scalar-mul)
  │
  ├─ Group 2: Complex Polynomial (independent of Groups 1, 3, 4)
  │   Card 4 (complex-poly)
  │
  ├─ Group 3: Cross-Space Maps (independent of Groups 1, 2, 4)
  │   Cards 5, 6, 7 can proceed in parallel
  │   (Card 7 uses FunctionGraph but not Cards 1–3's specific geometry)
  │
  └─ Group 4: Complex Spaces (sequential within group — Card 8 establishes ArgandPlane patterns)
      Card 8 (complex-plane) → Card 9 (complex-vectors) → Card 10 (complex-addition) → Card 11 (complex-scalar-mul)

Phase C — Verification gate
  Fresh independent verifier runs all objective gates and checks this document's
  Definition of Done (§5). Same procedure as dev/PROTOCOL.md.
```

### Parallelization table

| Group | Cards | Depends on | Can run in parallel with |
|---|---|---|---|
| A (foundations) | — | nothing | nothing (must be first) |
| B-Group 1 | 1, 2, 3 | Phase A | Groups 2, 3, 4 |
| B-Group 2 | 4 | Phase A | Groups 1, 3, 4 |
| B-Group 3 | 5, 6, 7 | Phase A | Groups 1, 2, 4 |
| B-Group 4 | 8, 9, 10, 11 | Phase A | Groups 1, 2, 3 |
| C (verification) | — | Phase B complete | nothing |

### Per-card ordering within groups

**Group 1 (sequential):** Card 1 establishes the `PolyDeg` toggle, the `FunctionGraph`
integration in a polynomial context, and the coefficient-space layout. Cards 2 and 3
extend this layout with additional points and stacking indicators. Implementing in
order avoids duplicating the foundational layout decisions.

**Group 4 (sequential):** Card 8 establishes the `ArgandPlane` usage pattern for a
single complex number (scalar multiplication, rotation arc). Cards 9–11 apply this
pattern to ℂ² (two stacked planes, combined view, color encoding). Implementing 8
first gives the team a resolved pattern to follow for 9–11.

**Groups 2 and 3** have no internal dependencies.

---

## 5. Definition of Done

The phase is done when **all** of the following hold.

**Objective gates:**

1. `npm install` succeeds from a clean checkout.
2. `npm run build` exits 0 (TypeScript type-check passes).
3. `npm run test` exits 0. All new `geometry.test.ts` files pass. All existing tests
   still pass (no regression). Coverage includes degenerate cases listed in each
   card's geometry.test requirements.
4. `npm run lint` exits 0.

**Functional requirements:**

5. All 11 new concepts appear in `concepts/registry.ts` with the registry IDs from §3.
6. All 11 new cards appear in the home gallery with live thumbnails.
7. Each card's concept page has a visualization area, a sandbox area, and an
   explanation panel (per `SPEC.md §5`).
8. All exposed variables satisfy the real-time requirement (G5): no apply/submit
   buttons anywhere.
9. All mathematical honesty notes in each card's "Honesty notes" section are
   satisfied (per `SPEC.md §3`).
10. Every `geometry.ts` is a pure function with no side effects, no React imports,
    and no Three.js imports.
11. The `src/linalg/complex.ts` module is dependency-free (no imports from `linalg/`
    or elsewhere; only internal types).
12. The five new scene primitives (`FunctionGraph`, `StackingIndicators`, `ArgandPlane`,
    `DomainColoringMesh`, axisLabels customization) are generic (not card-specific).
    Multiple cards can use each without modification.
13. All existing concepts (Vectors through Nullspace) continue to pass their tests
    and render correctly (no regression from shared primitive changes).
14. The domain coloring color legend is visible in Cards 4, 9, 10, and 11 wherever
    hue/brightness encoding is used.

**Verifier checklist additions:**

In addition to the existing `SPEC.md §7` items (which the verifier already checks),
this phase's verifier must explicitly confirm:

- `grep -r 'poly-space\|poly-addition\|poly-scalar-mul\|complex-poly\|differentiation\|coordinates\|isomorphism\|complex-plane\|complex-vectors\|complex-addition\|complex-scalar-mul' src/concepts/registry.ts`
  returns 11 distinct matches.
- `grep -r 'FunctionGraph' src/scene/FunctionGraph.tsx` returns a match.
- `grep -r 'ArgandPlane' src/scene/ArgandPlane.tsx` returns a match.
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results (no new hardcoded hex).
- `npm run test` exits 0 with at least the degenerate-case tests listed in §3 passing.

---

## 6. BACKLOG Entries

Ready to paste into `dev/BACKLOG.md`. These extend the existing B-08 item.
Number sequentially from the last existing item (B-08).

---

```
### [B-09] Phase A — New shared primitives
**Priority:** P1
**Category:** feature
**Status:** open
**Depends on:** none
**Description:** Implement the five new scene primitives and complex.ts linalg module
  required by all abstract-spaces cards. No card work should start until this item is done.
**Acceptance criteria:**
- `src/linalg/complex.ts` exports all functions listed in SPEC-abstract-spaces.md §1.1,
  with unit tests in `complex.test.ts` covering all degenerate cases in §1.1.
- `src/scene/FunctionGraph.tsx` renders a function curve as a THREE.Line inside a Scene.
- `src/scene/StackingIndicators.tsx` renders two-color vertical segment pairs at sampled x values.
- `src/scene/ArgandPlane.tsx` wraps Scene with unit circle and Re/Im axis labels.
- `src/scene/DomainColoringMesh.tsx` renders domain coloring of a ℂ→ℂ function as a
  flat 2D texture or 3D height-mapped surface.
- Axis label customization (axisLabels prop or equivalent) added to Labels.tsx or Axes.tsx
  without modifying any existing concept.
- `Complex`, `PolyDeg`, `ComplexVec2` added to src/types.ts.
- All existing concepts' tests still pass (no regression).
**Goal criteria:**
- `grep 'complexMul\|complexArg\|evalComplexPoly' src/linalg/complex.ts` returns matches.
- `grep -r 'IntersectionObserver\|FunctionGraph\|StackingIndicators\|ArgandPlane\|DomainColoringMesh' src/scene/` returns at least 4 distinct files.
- `grep 'PolyDeg\|ComplexVec2\|Complex' src/types.ts` returns matches.
- `npm run test && npm run build && npm run lint` all exit 0.
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results (no regressions from existing concepts).
```

---

```
### [B-10] Group 1 — Polynomial cards (Cards 1, 2, 3)
**Priority:** P1
**Category:** feature
**Status:** open
**Depends on:** [B-09]
**Description:** Implement the three polynomial concept cards: poly-space (Card 1),
  poly-addition (Card 2), and poly-scalar-mul (Card 3) in sequential order.
**Acceptance criteria:**
- Each card has a geometry.ts (pure), geometry.test.ts with all required cases,
  store.ts (Zustand), <Concept>.tsx, and <Concept>Thumbnail.tsx.
- Cards are registered in concepts/registry.ts with the slugs poly-space, poly-addition, poly-scalar-mul.
- Card 1: dual-labeling display (P₂ axes and R³ axes side-by-side) is implemented.
- Card 2: stacking indicators render correctly and the show/hide toggle works.
- Card 3: c=0 callout, c<0 downward segments, and scalar slider outside [-3,3] via numeric input.
- All three cards satisfy the acceptance criteria in SPEC-abstract-spaces.md §3 for their entries.
**Goal criteria:**
- `grep 'poly-space\|poly-addition\|poly-scalar-mul' src/concepts/registry.ts` returns 3 matches.
- `grep -r 'isZero\|a2IsZero' src/concepts/poly-space/geometry.test.ts` returns matches.
- `grep -r 'sumIsZero' src/concepts/poly-addition/geometry.test.ts` returns a match.
- `grep -r 'cIsZero\|cIsNegative' src/concepts/poly-scalar-mul/geometry.test.ts` returns matches.
- `npm run test && npm run build && npm run lint` all exit 0.
```

---

```
### [B-11] Group 2 — Complex Polynomial (Card 4)
**Priority:** P1
**Category:** feature
**Status:** open
**Depends on:** [B-09]
**Description:** Implement the complex-poly concept card with three stacked mini
  Argand planes for coefficients and domain coloring of p(z) in the right panel.
**Acceptance criteria:**
- geometry.ts computes zeros analytically (quadratic formula in ℂ) and the
  isDoubleZero flag.
- DomainColoringMesh is used in the right panel; the 3D/2D toggle works.
- Color legend is always visible alongside the domain coloring.
- Callouts fire for double-zero and for the number of zeros.
- Satisfies acceptance criteria in SPEC-abstract-spaces.md §3 Card 4 entry.
**Goal criteria:**
- `grep 'complex-poly' src/concepts/registry.ts` returns a match.
- `grep -r 'DomainColoringMesh' src/concepts/complex-poly/' returns a match.
- `grep -r 'isDoubleZero\|zeros' src/concepts/complex-poly/geometry.test.ts` returns matches.
- `npm run test && npm run build && npm run lint` all exit 0.
```

---

```
### [B-12] Group 3 — Cross-Space Maps (Cards 5, 6, 7)
**Priority:** P1
**Category:** feature
**Status:** open
**Depends on:** [B-09]
**Description:** Implement three cross-space mapping cards: differentiation (Card 5),
  coordinates (Card 6), and isomorphism (Card 7). Cards 5–7 are independent of each
  other and can be built in parallel within this item.
**Acceptance criteria:**
- Card 5 (differentiation): kernel line rendered with SubspaceMesh kind='line'; image
  point is read-only in the right panel; onKernel callout fires correctly.
- Card 6 (coordinates): bidirectional drag sync between left and right panels;
  basisIsValid=false shows "not a valid basis" state; near-degenerate warning fires.
- Card 7 (isomorphism): mapping label "(a, b) ↦ b·1 + a·x" visible in UI; right
  sub-panels are read-only and driven from the left panel.
- All three cards satisfy acceptance criteria in SPEC-abstract-spaces.md §3.
**Goal criteria:**
- `grep 'differentiation\|coordinates\|isomorphism' src/concepts/registry.ts` returns 3 matches.
- `grep -r 'onKernel' src/concepts/differentiation/geometry.test.ts` returns a match.
- `grep -r 'basisIsValid\|customCoords' src/concepts/coordinates/geometry.test.ts` returns matches.
- `grep -r 'isZero\|bIsZero\|aIsZero' src/concepts/isomorphism/geometry.test.ts` returns matches.
- `npm run test && npm run build && npm run lint` all exit 0.
```

---

```
### [B-13] Group 4 — Complex Spaces (Cards 8, 9, 10, 11)
**Priority:** P1
**Category:** feature
**Status:** open
**Depends on:** [B-09]
**Description:** Implement the four complex-space cards in sequential order:
  complex-plane (Card 8), complex-vectors (Card 9), complex-addition (Card 10),
  and complex-scalar-mul (Card 11).
**Acceptance criteria:**
- Card 8: magnitude/angle sliders synchronized with c draggable point; rotation arc
  rendered; isPureRotation, cIsI callouts fire.
- Card 9: three-way drag sync (left-top, left-bottom, combined view); z2=0 callout;
  color legend visible.
- Card 10: tip-to-tail in both Argand planes; "combined view is less readable"
  callout always visible.
- Card 11: magnitude and angle sliders synchronized with c; combined view shows
  spatial + hue + brightness changes simultaneously; all four named callout states fire.
- All four cards satisfy acceptance criteria in SPEC-abstract-spaces.md §3.
**Goal criteria:**
- `grep 'complex-plane\|complex-vectors\|complex-addition\|complex-scalar-mul' src/concepts/registry.ts` returns 4 matches.
- `grep -r 'isPureRotation\|cIsI\|rotationAngle' src/concepts/complex-plane/geometry.test.ts` returns matches.
- `grep -r 'z2IsZero\|vecIsZero\|z2Arg' src/concepts/complex-vectors/geometry.test.ts` returns matches.
- `grep -r 'sumIsZero\|uEqualsV' src/concepts/complex-addition/geometry.test.ts` returns matches.
- `grep -r 'isPureRotation\|cIsI\|cIsPositiveReal\|cMagIsZero' src/concepts/complex-scalar-mul/geometry.test.ts` returns matches.
- `npm run test && npm run build && npm run lint` all exit 0.
```

---

```
### [B-14] Phase C — Verification gate (abstract spaces)
**Priority:** P1
**Category:** infra
**Status:** open
**Depends on:** [B-10], [B-11], [B-12], [B-13]
**Description:** Fresh independent verification agent checks all 11 new cards against
  SPEC-abstract-spaces.md §5 Definition of Done. Same procedure as dev/PROTOCOL.md.
**Acceptance criteria:**
- Pre-gate checklist (dev/PROTOCOL.md): all five questions answered YES before spawning.
- Verifier runs npm install, npm run build, npm run test, npm run lint — all exit 0.
- Verifier checks all 14 items in SPEC-abstract-spaces.md §5.
- Verifier checks all grep-based goal criteria from the §5 verifier checklist.
- Verifier returns PASS, or gaps are fixed and another fresh verifier is spawned.
- Cycle repeats until PASS (cap 5 cycles); remaining gaps go to STATUS.md Blockers.
**Goal criteria:**
- `grep 'poly-space\|poly-addition\|poly-scalar-mul\|complex-poly\|differentiation\|coordinates\|isomorphism\|complex-plane\|complex-vectors\|complex-addition\|complex-scalar-mul' src/concepts/registry.ts` returns 11 distinct matches.
- `npm run build && npm run test && npm run lint` all exit 0.
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results.
- This BACKLOG entry is marked done and an entry is appended to dev/DONE.md.
```
