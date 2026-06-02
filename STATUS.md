# Project Status

Running journal for the Linear Algebra Visualizer. Agents append to the
"Decisions log" when making a non-obvious choice and update "Blockers" when
blocked. Gate results are recorded after each phase.

---

## Current snapshot

**Phase 3 (integration & polish) is in progress.**

| Phase | Status | Gate results |
|-------|--------|-------------|
| Phase 1 — Foundation | Complete | build ✅ test ✅ (115 tests) lint ✅ |
| Phase 2 — Seven concepts | Complete | build ✅ test ✅ lint ✅ |
| Phase 3 — Polish | In progress | — |
| Phase 4 — Verification gate | Not started | — |

For pending and in-flight tasks, see `dev/BACKLOG.md` and `dev/ACTIVE.md`.

---

## Decisions log

Each entry: **date · topic · decision · rationale**.

### 2026-05-23 · linalg barrel name collisions

Both `vector.ts` and `matrix.ts` export `lerp`; both `vector.ts` and
`subspace.ts` export `EPS`. Resolved in `linalg/index.ts` by re-exporting
matrix's `lerp` as `matLerp` and subspace's `EPS` as `SUBSPACE_EPS`. Primary
`lerp` (vector) and `EPS` (vector) export directly. Phase 2+ agents should import
from specific submodule paths to avoid ambiguity, or use the named re-exports.

### 2026-05-23 · CSS module declarations

Added `src/declarations.d.ts` with a wildcard `*.module.css` declaration so
TypeScript recognises CSS Module imports. Standard pattern for Vite + TypeScript.

### 2026-05-23 · VectorArrow Three.js material typing

`ArrowHelper.line.material` is typed as `Material | Material[]`. Applied a helper
`setMaterialProps` that narrows to `LineBasicMaterial | MeshBasicMaterial` before
setting `opacity`/`transparent`. Preserves strict TypeScript without casting to
`any`.

### 2026-05-23 · DraggableHandle R3F pointer event typing

Used `ThreeEvent<PointerEvent>` (from `@react-three/fiber`) for Three.js mesh
pointer handlers. `ThreeEvent` wraps the native event and adds Three.js-specific
fields like `pointerId` and `stopPropagation`.

### 2026-05-23 · linalg barrel selective re-export

Only `matMat`, `matVec`, `det2`, `det3`, `transpose`, `identity`, and `matLerp`
are re-exported from `matrix.ts` to avoid the `lerp` collision. All matrix
functions are still accessible via direct submodule import.

### 2026-05-23 · SubspaceMesh 'space' kind rendering

For `kind === 'space'` (all of R³): two meshes — a translucent `DoubleSide`
`boxGeometry` (opacity 0.07) plus an `EdgesGeometry` wireframe outline. This
replaced the earlier `BackSide`-only approach, which was nearly invisible at low
opacity. The wireframe makes clear this is a viewport clip, not the actual
boundary of R³.

### 2026-05-23 · EPS value

Set to `1e-9`. Well above machine epsilon (~2.2e-16) and well below typical
user-facing coordinate values. Canonical `EPS` exported from `src/linalg/vector.ts`,
re-exported as `SUBSPACE_EPS` from `src/linalg/subspace.ts`.

### 2026-05-23 · Thumbnail WebGL frame loop

All 7 thumbnails use `frameloop="demand"` on their `Scene` to minimise GPU usage
in the gallery. Gallery performance may still degrade with many simultaneous
canvases; `dev/BACKLOG.md` item B-03 tracks adding IntersectionObserver-based
lazy mounting in Phase 3.

### 2026-05-23 · Drag vs orbit conflict (R3)

`OrbitControls` adds native DOM listeners to `gl.domElement`; `DraggableHandle`
uses `setPointerCapture`. `e.stopPropagation()` only stops R3F's synthetic event
system. Fixed by adding `DragContext` — a React context with `{ isDragging,
setDragging }` — and passing `enabled={!isDragging}` to OrbitControls.

### 2026-05-23 · NumberInput controlled-input fix

Fully controlled `value={value}` caused the input to reset when the user deleted
the last digit (`""` → `NaN` → no onChange → rerender). Fixed with local string
state: maintain `localValue: string` and `focused: boolean`; sync from prop only
when not focused; call `onChange(0)` for empty string, hold off on partial strings
(`"-"`, `"1."`), snap back on blur.

---

## Blockers

_None currently._

When a blocker is recorded, format: **date · description · what would unblock it**.
Clear the entry when resolved (note the resolution inline rather than deleting).
