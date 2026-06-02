# Active Work

Items currently in flight. Update this file when starting or pausing work so
the next session can resume without re-deriving context.

See `dev/README.md` for format and rules.

---

## In progress

### [B-18] Replace stacking indicators with shaded regions (Cards 2, 3)
**Started:** 2026-06-01
**Files in scope:** `src/scene/ShadedArea.tsx` (new), `src/concepts/poly-addition/geometry.ts`, `src/concepts/poly-addition/PolyAddition.tsx`, `src/concepts/poly-scalar-mul/geometry.ts`, `src/concepts/poly-scalar-mul/PolyScalarMul.tsx`
**Acceptance criteria:** Both cards show filled shaded region between curves; no StackingIndicators import; build+test+lint exit 0.

### [B-22] Card 5: add shared functional graph to Differentiation
**Started:** 2026-06-01
**Files in scope:** `src/concepts/differentiation/geometry.ts`, `src/concepts/differentiation/geometry.test.ts`, `src/concepts/differentiation/Differentiation.tsx`, `src/concepts/differentiation/Differentiation.module.css`
**Acceptance criteria:** Third panel shows f(x) and f′(x) as two curves; both update live; build+test exit 0.

### [B-24] Card 9: combined view undersized
**Started:** 2026-06-01
**Files in scope:** `src/concepts/complex-vectors/ComplexVectors.module.css`
**Acceptance criteria:** Combined view Scene canvas fills its card; build exits 0.

### [B-25] Card 10: grey out complex-addition gallery tile
**Started:** 2026-06-01
**Files in scope:** `src/types.ts`, `src/concepts/complex-addition/index.ts`, `src/routes/Home.tsx`, `src/routes/Home.module.css`
**Acceptance criteria:** complex-addition tile renders at reduced opacity; clicking does not navigate; all other tiles unaffected; build+lint exit 0.

---

## Paused / blocked

_None currently._

Format when blocked:
```
### [B-NN] Title
**Blocked:** One sentence describing what is needed to unblock.
(See STATUS.md Blockers for the same entry with date.)
```

---

## Slots

When the current in-progress work is finished, check `dev/BACKLOG.md` for the
next highest-priority `open` item and move it here.
