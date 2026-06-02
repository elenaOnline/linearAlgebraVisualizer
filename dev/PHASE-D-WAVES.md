# Phase D — Execution Waves

Parallel execution plan for B-15 through B-25 (the problem-log fix items).
All ordering is driven by **file-edit conflicts only** — there are no functional
dependencies between items. Items in the same wave share no files and can be
executed by parallel agents simultaneously.

Reference: `dev/BACKLOG.md` for per-item acceptance and goal criteria.

---

## Wave 1 — Fully parallel, zero file conflicts

Start all four simultaneously. Each item touches a completely disjoint set of files.

| Item | Title | Files in scope |
|------|-------|----------------|
| **B-18** | Replace stacking indicators with shading | `src/scene/ShadedArea.tsx` *(new)*, `poly-addition/geometry.ts`, `poly-addition/PolyAddition.tsx`, `poly-scalar-mul/geometry.ts`, `poly-scalar-mul/PolyScalarMul.tsx` |
| **B-22** | Add shared functional graph to Differentiation | `differentiation/geometry.ts`, `differentiation/geometry.test.ts`, `differentiation/Differentiation.tsx`, `differentiation/Differentiation.module.css` |
| **B-24** | Combined view undersized (Card 9) | `complex-vectors/ComplexVectors.module.css` |
| **B-25** | Grey out complex-addition gallery tile | `src/types.ts`, `complex-addition/index.ts`, `src/routes/Home.tsx`, `src/routes/Home.module.css` |

**Gate before Wave 2:** `npm run build && npm run test && npm run lint` must all exit 0.

---

## Wave 2 — Parallel, after Wave 1

Start all four simultaneously once Wave 1 gates pass.

| Item | Title | Files in scope | Notes |
|------|-------|----------------|-------|
| **B-15** | Replace "arg" with "angle" in all UI text | `complex-poly/ComplexPoly.tsx`, `complex-vectors/ComplexVectors.tsx`, `complex-addition/ComplexAddition.tsx`, `complex-scalar-mul/ComplexScalarMul.tsx`, `complex-plane/ComplexPlane.tsx` | Text-only changes; leaves structural edits for Wave 3 |
| **B-16** | Extend polynomial/complex curve render distance | `poly-space/geometry.ts`, `poly-space/PolySpace.tsx`, `poly-addition/geometry.ts`, `poly-addition/PolyAddition.tsx`, `poly-scalar-mul/geometry.ts`, `poly-scalar-mul/PolyScalarMul.tsx`, `complex-poly/ComplexPoly.tsx` (BOUNDS only) | **Excludes isomorphism** — folded into B-23 |
| **B-20** | Combined view → vector arrow (Card 9) | `complex-vectors/ComplexVectors.tsx` | B-15 and B-20 both touch `ComplexVectors.tsx`: assign to the **same agent** or ensure they edit different lines (B-15: legend string on line ~130; B-20: mesh/circle in combined view) |
| **B-23** | Isomorphism R³ ≅ P₂ | `isomorphism/store.ts`, `isomorphism/geometry.ts`, `isomorphism/geometry.test.ts`, `isomorphism/Isomorphism.tsx`, `isomorphism/Isomorphism.module.css` | Absorbs the isomorphism xMin/xMax extension from B-16 — do not apply that part separately |

> **B-15 + B-20 conflict note:** Both touch `ComplexVectors.tsx`. Either assign both to
> one agent, or ensure they operate on non-overlapping line ranges and merge cleanly.
> The safest approach is a single agent handling both.

**Gate before Wave 3:** `npm run build && npm run test && npm run lint` must all exit 0.

---

## Wave 3 — Batched, after Wave 2

B-17, B-19, and B-21 all write to `ComplexPoly.tsx`. They **must not run simultaneously**.
Execute as a single agent or in strict sequence.

**Recommended order within the batch:** B-21 → B-19 → B-17
(B-21 and B-19 are additive to existing structure; B-17 creates a new component and
replaces legend text that B-15 has already cleaned up.)

| Item | Title | Files in scope |
|------|-------|----------------|
| **B-21** | Axis labels for complex-poly (Card 4) | `complex-poly/ComplexPoly.tsx` |
| **B-19** | Coefficient Argand panels → vectors (Card 4) | `complex-poly/ComplexPoly.tsx` |
| **B-17** | Hue/brightness visual color key (Cards 4, 9, 10, 11) | `src/ui/ComplexColorKey.tsx` *(new)*, `src/ui/ComplexColorKey.module.css` *(new)*, `complex-poly/ComplexPoly.tsx`, `complex-vectors/ComplexVectors.tsx`, `complex-addition/ComplexAddition.tsx`, `complex-scalar-mul/ComplexScalarMul.tsx` |

**Final gate:** `npm run build && npm run test && npm run lint` must all exit 0.
On pass, run the Phase D verification gate per `dev/PROTOCOL.md`.

---

## Quick-reference diagram

```
WAVE 1 (parallel)
├── B-18  stacking → shading          [poly-addition, poly-scalar-mul]
├── B-22  differentiation graph        [differentiation/*]
├── B-24  combined view CSS fix        [ComplexVectors.module.css]
└── B-25  grey out complex-addition    [types.ts, Home.*, complex-addition/index.ts]
          │
          ▼ gate: build + test + lint
WAVE 2 (parallel, with B-15+B-20 assigned to one agent)
├── B-15 + B-20  arg→angle + vector arrow  [Complex*.tsx, ComplexPlane.tsx]
├── B-16  render distance              [poly-space, poly-addition, poly-scalar-mul, ComplexPoly.tsx]
└── B-23  isomorphism R³≅P₂           [isomorphism/*]
          │
          ▼ gate: build + test + lint
WAVE 3 (single agent, sequential within)
└── B-21 → B-19 → B-17               [ComplexPoly.tsx (shared), ComplexColorKey.tsx (new),
                                       ComplexVectors.tsx, ComplexAddition.tsx, ComplexScalarMul.tsx]
          │
          ▼ final gate + Phase D verification
```

---

## Deviation protocol

If an agent discovers that an item requires editing a file listed in another wave's
scope, it must **stop, record the conflict in `STATUS.md` under "Blockers"**, and
wait for the conflicting wave to complete before continuing. Do not silently expand
scope into another wave's files.
