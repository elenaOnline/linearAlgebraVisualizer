# Done

Reverse-chronological log of completed milestones. Append-only — never delete.

Format per entry:
```
## YYYY-MM-DD · [ID or milestone name]
**Summary:** One sentence.
**Gates:** build ✅/❌ · test ✅/❌ (N tests) · lint ✅/❌
**Commit:** short hash
**Notes:** (optional) anything non-obvious worth preserving
```

---

## 2026-06-01 · [B-14] Verification gate — PASS (abstract spaces)
**Summary:** Fresh independent verifier confirmed all 14 SPEC-abstract-spaces.md §5 Definition of Done items satisfied: 326 tests pass, all 11 new concepts in registry with live thumbnails, no apply buttons, all geometry.ts files pure, complex.ts dependency-free, color legends present in Cards 4/9/10/11, zero hardcoded hex in src/concepts/.
**Gates:** build ✅ · test ✅ (326) · lint ✅
**Commit:** (pending — uncommitted)
**Notes:** One non-blocking note: unit circle in complex-plane has no in-scene text label; explanation panel describes it. Verifier judged as reasonable implementation choice.

## 2026-06-01 · [B-10] through [B-13] — Abstract Spaces Cards (Phase B)
**Summary:** Implemented all 11 new concept cards (poly-space, poly-addition, poly-scalar-mul, complex-poly, differentiation, coordinates, isomorphism, complex-plane, complex-vectors, complex-addition, complex-scalar-mul); added PolyDegToggle UI component; updated registry.ts to include all 18 concepts.
**Gates:** build ✅ · test ✅ (326 tests, 62 new) · lint ✅
**Commit:** (pending)
**Notes:** All cards follow math/rendering split, IntersectionObserver lazy thumbnails, CSS custom properties only (0 hardcoded hex in src/concepts/).

## 2026-06-01 · [B-09] Phase A — New shared primitives
**Summary:** Created `src/linalg/complex.ts` (pure complex arithmetic + polynomial evaluation, 32 tests), `src/scene/FunctionGraph.tsx`, `src/scene/StackingIndicators.tsx`, `src/scene/ArgandPlane.tsx`, `src/scene/DomainColoringMesh.tsx`; added `axisLabels` prop to `Axes`/`Scene`; added `Complex`, `PolyDeg`, `ComplexVec2` to `src/types.ts`.
**Gates:** build ✅ · test ✅ (264 tests, 32 new) · lint ✅
**Commit:** (pending)

## 2026-06-01 · [B-02] Verification gate — PASS
**Summary:** Fresh independent verifier confirmed all 12 SPEC.md §7 Definition of Done
items satisfied: 232 tests pass, all 7 concepts present with live thumbnails and
explanation panels, no apply buttons, math/rendering separation holds, G1–G12 all met.
**Gates:** build ✅ · test ✅ (232) · lint ✅
**Commit:** (pending — uncommitted)
**Notes:** Verifier explicitly confirmed B-01 style migration and B-04 chunk splitting
goal criteria as part of the gate run.

## 2026-06-01 · [B-05] Cross-concept visual consistency pass
**Summary:** Replaced all hardcoded hex color strings in src/concepts/ with named
imports from colors.ts; added 6 VectorSpaces-specific color exports to colors.ts.
`grep '#[0-9a-fA-F]{6}' src/concepts/` now returns 0 results.
**Gates:** build ✅ · test ✅ (232 tests) · lint ✅
**Commit:** (pending — uncommitted)
**Notes:** VectorSpaces needed 6 distinct colors (more than the 4-color Plate palette)
to distinguish candidate subspace, test vectors a/b, sum, scalar multiple, and offset
marker. These are now named constants in colors.ts (CANDIDATE, VEC_A, VEC_B, VEC_SUM,
VEC_SCALAR, OFFSET) rather than inline hex.

## 2026-06-01 · [B-06] Keyboard accessibility pass
**Summary:** Added aria-label/htmlFor to all 5 ui controls: useId+htmlFor in NumberInput
and Slider, role=group+aria-label on VectorInput/MatrixInput wrappers, aria-label on
MatrixInput cells, role=group+aria-label="Dimension" on DimensionToggle.
**Gates:** build ✅ · lint ✅
**Commit:** (pending — uncommitted)

## 2026-06-01 · [B-03] Thumbnail lazy mounting
**Summary:** Added IntersectionObserver-based lazy mounting to all 7 Thumbnail components;
WebGL canvas only mounts when the thumbnail enters the viewport (rootMargin 100px).
**Gates:** build ✅ · test ✅ (232 tests)
**Commit:** (pending — uncommitted)

## 2026-06-01 · [B-04] Vite chunk splitting
**Summary:** Added manualChunks to vite.config.ts splitting three.js, r3f/drei, and
katex into separate chunks; main app bundle reduced to 100 kB (was 1.35 MB).
**Gates:** build ✅ · lint ✅
**Commit:** (pending — uncommitted)
**Notes:** three.js chunk is 666 kB (still triggers the 500 kB Vite warning but well
under 1 MB); this is expected and acceptable per B-04 acceptance criteria.

## 2026-06-01 · [B-01] Style guide migration
**Summary:** Migrated tokens.css to bone-paper light theme (Plate vector palette),
added type-scale tokens, created colors.ts for Three.js material usage, and updated
all CSS Modules to use the new token names — replacing the old dark `--color-*` scheme.
**Gates:** build ✅ · test ✅ (232 tests) · lint ✅
**Commit:** (pending — uncommitted)
**Notes:** colors.ts mirrors the vector palette constants for Three.js materials,
which cannot read CSS custom properties. Type-scale tokens (--t-display through
--t-micro) added to tokens.css for future use; display/h1/body/micro from style guide,
h2/meta derived from component usage patterns.

## 2026-05-23 · UX improvements (Phase 2 polish)
**Summary:** Drag/orbit separation via DragContext, NumberInput local-string fix,
SubspaceMesh 'space' kind double-mesh rendering, shift+drag integer snapping,
integer sliders in VectorInput.
**Gates:** build ✅ · test ✅ · lint ✅
**Commit:** 4d8cf2e
**Notes:** All five fixes described in DESIGN_IMPROVEMENTS.md are now
implemented. That file is now historical reference.

## 2026-05-23 · Phase 2 — All seven concept modules complete
**Summary:** Vectors, Vector Spaces, Span, Basis, Dimension, Linear Maps, and
Nullspace concept modules implemented — each with geometry.ts (pure), geometry
tests, Zustand store, full concept page (visualization + sandbox + explanation),
and live thumbnail.
**Gates:** build ✅ · test ✅ · lint ✅
**Commit:** ab02127

## 2026-05-23 · Phase 1 — Foundation scaffold complete
**Summary:** Vite/React/TS project scaffolded; src/linalg/ built and
unit-tested (115 tests across vector.ts, matrix.ts, subspace.ts); shared
scene/ and ui/ primitives frozen; routing, concept registry, and
styles/tokens.css in place; CONTRACTS.md written.
**Gates:** build ✅ · test ✅ (115 tests) · lint ✅
**Commit:** b3f3033
**Notes:** Key decisions recorded in STATUS.md decisions log (name collisions,
CSS module declarations, VectorArrow typing, DraggableHandle typing, EPS value,
thumbnail frameloop). CONTRACTS.md freezes all shared component prop interfaces
for Phase 2 agent use.
