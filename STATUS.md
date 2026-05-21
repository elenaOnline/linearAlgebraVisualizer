# Phase 1 Status

## Gate results

| Command | Status |
|---------|--------|
| `npm run build` | PASS (tsc + vite build, exit 0) |
| `npm run test` | PASS (115 tests across 3 test files, exit 0) |
| `npm run lint` | PASS (0 warnings, 0 errors, exit 0) |

## Decisions made

### linalg/index.ts — name collision resolution
Both `vector.ts` and `matrix.ts` export a function named `lerp`, and both `vector.ts` and `subspace.ts` export a constant named `EPS`. The barrel `index.ts` resolves this by re-exporting matrix's `lerp` as `matLerp` and subspace's `EPS` as `SUBSPACE_EPS`. The primary `lerp` (vector) and `EPS` (vector) are exported directly. Phase 2 concept agents should import math directly from their specific submodule paths (`../../linalg/vector`, etc.) to avoid ambiguity, or use the named re-exports from `../../linalg/index`.

### CSS module declarations
Added `src/declarations.d.ts` with a wildcard `*.module.css` declaration so TypeScript recognises CSS Module imports throughout the project. This is the standard pattern for Vite + TypeScript projects.

### VectorArrow — Three.js material typing
`ArrowHelper.line.material` is typed as `Material | Material[]` in Three.js typedefs. Applied a helper function `setMaterialProps` that narrows to `LineBasicMaterial | MeshBasicMaterial` before setting `opacity`/`transparent`. This preserves strict TypeScript compliance without casting to `any`.

### DraggableHandle — R3F pointer event typing
Used `ThreeEvent<PointerEvent>` (from `@react-three/fiber`) as the event type for Three.js mesh pointer handlers. `ThreeEvent` correctly wraps the native `PointerEvent` and adds Three.js-specific fields like `pointerId` and `stopPropagation`.

### linalg/index.ts barrel — intentional selective re-export
Only `matMat`, `matVec`, `det2`, `det3`, `transpose`, `identity`, and `matLerp` are re-exported from `matrix.ts` to avoid the `lerp` collision. All other matrix functions are still accessible directly.

### SubspaceMesh 'space' kind
For `kind === 'space'` (all of R³), renders a large transparent box using `BackSide` rendering. This gives a visual indication of the full ambient space without obstructing the interior. A note for Phase 2: concept pages should prefer not to use `kind === 'space'` in 3D where the effect is subtle; prefer narrative text in the explanation panel instead.

### Thumbnail WebGL contexts
All 7 thumbnails use `frameloop="demand"` on their `Scene` to minimise GPU usage in the gallery. Gallery performance may still degrade with many simultaneous canvases; Phase 3 should add IntersectionObserver-based lazy mounting.

### EPS value
Set to `1e-9` per spec. This is well above machine epsilon (~2.2e-16) and well below typical user-facing coordinate values. The single constant is exported from `src/linalg/vector.ts` as the canonical `EPS`, and re-exported (as `SUBSPACE_EPS`) from `src/linalg/subspace.ts` where it is also used internally.

## What is NOT done in Phase 1 (by design)

- The 7 concept modules show placeholder components. Full implementations are Phase 2.
- Live thumbnails exist (each renders a Three.js canvas scene) but are simplified static scenes, not interactive.
- No Zustand stores created yet — those belong to individual concept modules.
- No geometry.ts per concept — those are Phase 2 deliverables.
- No cross-concept consistency pass — Phase 3.
- Chunk size warning from Vite is expected (three.js + katex + r3f are large); Phase 3 can split chunks.
