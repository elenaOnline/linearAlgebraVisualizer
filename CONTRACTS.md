# Phase 1 Component Contracts

These prop interfaces are **frozen**. Phase 2 concept agents must not modify these
shared components. If a concept genuinely requires a new capability, open a request
to the foundation maintainer rather than modifying these files.

All types are imported from `src/types.ts` unless noted otherwise.

---

## Scene primitives (`src/scene/`)

### `Scene`

```ts
// src/scene/Scene.tsx
interface SceneProps {
  dim: Dim                                     // '2d' | '3d'
  children?: React.ReactNode                   // Three.js objects rendered inside the canvas
  frameloop?: 'always' | 'demand' | 'never'   // default: 'always'
  className?: string                           // extra CSS class on wrapper div
}
```

**Behaviour:**
- `dim='2d'`: OrthographicCamera (position [0,0,10], zoom 50), no OrbitControls.
- `dim='3d'`: PerspectiveCamera (position [5,4,7], fov 50) + OrbitControls (pan/zoom/rotate enabled).
- Always renders `<Axes dim={dim} />` and `<Grid dim={dim} />` as background layers.
- Wraps an R3F `<Canvas>` in a sized `div` using `Scene.module.css`.

---

### `Axes`

```ts
// src/scene/Axes.tsx
interface AxesProps {
  dim: Dim
}
```

**Behaviour:**
- Draws x-axis (red `#e74c3c`), y-axis (green `#2ecc71`) as Lines extending ±20 units.
- `dim='3d'`: also draws z-axis (blue `#3498db`).
- Renders a small white sphere at the origin.

---

### `Grid`

```ts
// src/scene/Grid.tsx
interface GridProps {
  dim: Dim
}
```

**Behaviour:**
- `dim='2d'`: `gridHelper` in the XY plane (rotated).
- `dim='3d'`: standard `gridHelper` in the XZ plane.
- 40×40 unit grid with 40 divisions.

---

### `VectorArrow`

```ts
// src/scene/VectorArrow.tsx
interface VectorArrowProps {
  vector: Vec3                // tip position (tail is always origin)
  color?: string              // CSS color string; default '#e67e22'
  opacity?: number            // 0–1; default 1
  label?: string              // text label rendered near tip
  showLabel?: boolean         // whether to render the label; default true
}
```

**Behaviour:**
- Renders a Three.js `ArrowHelper` from the origin to `vector`.
- When `vector` has near-zero norm (< 1e-6), renders a small sphere at the origin instead
  (zero vector is an honest point, not an invisible object).
- Head length is `min(0.3, length * 0.25)`; head width is `headLength * 0.5`.
- Label uses drei `Html` and is positioned at `vector * 1.1 + [0.1, 0.1, 0.1]`.

---

### `SubspaceMesh`

```ts
// src/scene/SubspaceMesh.tsx
interface SubspaceMeshProps {
  geometry: SubspaceGeometry  // { kind, directions? }
  color?: string              // CSS color; default '#1abc9c'
  opacity?: number            // 0–1; default 0.35
  dim: Dim
}

// SubspaceGeometry (from src/types.ts):
interface SubspaceGeometry {
  kind: 'point' | 'line' | 'plane' | 'space'
  directions?: Vec3[]   // line: 1 direction; plane: 2 directions
}
```

**Behaviour by kind:**
- `'point'`: small sphere (radius 0.1) at origin.
- `'line'`: `lineSegments` extending ±25 units along `normalize(directions[0])`. Visually unbounded.
- `'plane'`: `DoubleSide` mesh quad ±25 units in both `normalize(directions[0])` and
  `normalize(directions[1])` directions. Visually unbounded.
- `'space'`: large transparent box (25³) with `BackSide` rendering and `opacity=0.05`.
- Returns `null` if `kind` is unsatisfied (e.g. `'line'` with no directions).

---

### `DraggableHandle`

```ts
// src/scene/DraggableHandle.tsx
interface DraggableHandleProps {
  position: Vec3                     // current position in scene space
  onDrag: (newPosition: Vec3) => void // called on every pointer-move during drag
  color?: string                     // default '#ffffff'
  radius?: number                    // sphere radius; default 0.15
  dim: Dim                           // '2d' forces z=0 in drag output
}
```

**Behaviour:**
- Renders a sphere that can be pointer-captured and dragged.
- Drag plane is perpendicular to the camera at the initial grab point.
- `dim='2d'`: `newPosition[2]` is always 0.
- Emissive highlight when dragging.

---

### `Labels`

```ts
// src/scene/Labels.tsx
interface LabelItem {
  position: Vec3
  text: string
}

interface LabelsProps {
  items: LabelItem[]
}
```

**Behaviour:**
- Renders each item as a drei `Html` element at the given 3D position.
- Non-interactive (`pointerEvents: 'none'`).
- Semi-transparent dark background for readability.

---

## UI primitives (`src/ui/`)

### `NumberInput`

```ts
// src/ui/NumberInput.tsx
interface NumberInputProps {
  value: number
  onChange: (v: number) => void
  label?: string
  min?: number
  max?: number
  step?: number               // default 0.1
}
```

**Behaviour:** Controlled `<input type="number">` with mono font. Calls `onChange` only on valid parses (skips `NaN`). No spinner arrows.

---

### `Slider`

```ts
// src/ui/Slider.tsx
interface SliderProps {
  value: number
  onChange: (v: number) => void
  min: number                 // required
  max: number                 // required
  step?: number               // default 0.01
  label?: string
}
```

**Behaviour:** Styled `<input type="range">`. Shows current value as formatted string (2 decimal places) next to label.

---

### `VectorInput`

```ts
// src/ui/VectorInput.tsx
interface VectorInputProps {
  value: Vec                  // Vec2 when dim='2d', Vec3 when dim='3d'
  onChange: (v: Vec) => void
  dim: Dim
  label?: string
}
```

**Behaviour:** Renders 2 `NumberInput` fields (x, y) for `dim='2d'`, or 3 (x, y, z) for `dim='3d'`. Preserves immutability: creates new Vec on each change.

---

### `MatrixInput`

```ts
// src/ui/MatrixInput.tsx
interface MatrixInputProps {
  value: Mat                  // Mat2x2 when dim='2d', Mat3x3 when dim='3d'
  onChange: (m: Mat) => void
  dim: Dim
  label?: string
}
```

**Behaviour:** Renders a CSS grid of `NumberInput` fields — 2×2 for `dim='2d'`, 3×3 for `dim='3d'`. Preserves immutability: creates a new Mat on each change.

---

### `DimensionToggle`

```ts
// src/ui/DimensionToggle.tsx
interface DimensionToggleProps {
  value: Dim
  onChange: (d: Dim) => void
}
```

**Behaviour:** Two-button toggle (R² / R³). Active button highlighted with accent color. `aria-pressed` set correctly on each button.

---

### `Panel`

```ts
// src/ui/Panel.tsx
interface PanelProps {
  title?: string
  children: React.ReactNode
  className?: string
}
```

**Behaviour:** Styled container div with optional title. Applies `panel.module.css` styles. Accepts extra `className` for layout overrides.

---

### `MathText`

```ts
// src/ui/MathText.tsx
interface MathTextProps {
  tex: string       // LaTeX source string
  display?: boolean // block-level display mode; default false (inline)
}
```

**Behaviour:** Renders `tex` via `katex.renderToString`. Errors are caught and displayed in red. KaTeX CSS is imported via `src/styles/global.css`.

---

### `Callout`

```ts
// src/ui/Callout.tsx
interface CalloutProps {
  variant?: 'info' | 'warning' | 'success'  // default 'info'
  children: React.ReactNode
}
```

**Behaviour:** Styled callout div with a left border and variant-specific background tint.
- `'info'` — blue tint, blue border
- `'warning'` — amber tint, amber border
- `'success'` — green tint, green border

---

## Registry pattern

### `concepts/registry.ts`

```ts
export const concepts: ConceptMeta[]  // 7 entries in gallery order
```

**Adding a concept (Phase 2):** create a folder under `src/concepts/<id>/` with an
`index.ts` that exports a default `ConceptMeta`, then add it to this array. No other
files need to change.

### `ConceptMeta` (from `src/types.ts`)

```ts
interface ConceptMeta {
  id: string                    // matches folder name and URL param
  title: string
  blurb: string
  supports: ('2d' | '3d')[]
  Component: React.ComponentType // full concept page body
  Thumbnail: React.ComponentType // mini live-rendered preview for gallery card
}
```

---

## Shared types (`src/types.ts`)

```ts
type Dim = '2d' | '3d'
type Vec2 = [number, number]
type Vec3 = [number, number, number]
type Vec = Vec2 | Vec3
type Mat2x2 = [[number,number],[number,number]]
type Mat3x3 = [[number,number,number],[number,number,number],[number,number,number]]
type Mat = Mat2x2 | Mat3x3
type SubspaceKind = 'point' | 'line' | 'plane' | 'space'
interface SubspaceGeometry { kind: SubspaceKind; directions?: Vec3[] }
```

---

## Math library (`src/linalg/`)

Import directly from the submodule path to avoid barrel ambiguities:

```ts
import { add, sub, scale, dot, cross, norm, normalize, lerp, isZero, toVec3, EPS } from '../../linalg/vector'
import { matVec, matMat, det2, det3, transpose, identity, lerp as matLerp } from '../../linalg/matrix'
import { rref, rank, nullspaceBasis, spanDimension, isLinearlyIndependent, isInSpan, changeOfBasis, EPS as SUBSPACE_EPS } from '../../linalg/subspace'
```

All functions are pure (no React, no Three.js, no side effects). `EPS = 1e-9` is the single shared tolerance for all zero/rank/independence decisions.
