# Verification Protocol

This is the standing procedure for the verification gate described in
`CLAUDE.md §9`. It applies to any significant change: a new concept module,
shared primitive changes, style system overhauls, or the first delivery.

A change is **not complete** until this gate passes.

---

## Update cycle

Every significant change follows this sequence:

1. **Scope** — read `BACKLOG.md` and `ACTIVE.md`; pick up a task or define a new
   one; move it to ACTIVE.
2. **Implement** — write code following `CLAUDE.md §6` (math/rendering split,
   no apply buttons, mathematical honesty). Keep `src/linalg/` pure and tested.
3. **Run objective gates** (see below). Fix anything that fails before continuing.
4. **Spawn a fresh verifier** (see Verification loop below).
5. **Fix any blocking gaps**; repeat the verifier until PASS or cap is reached.
6. **Mark done** — update ACTIVE → DONE; commit.

---

## Objective gates

Run these in order. Any failure is blocking — do not proceed to verification
until all four pass.

```
npm install          # install / reconcile dependencies
npm run build        # TypeScript type-check + Vite production build; must exit 0
npm run test         # Vitest suite; must exit 0
npm run lint         # ESLint; must exit 0
```

---

## Pre-gate checklist

Before spawning the verifier, answer YES to all five questions. If any answer is
NO, resolve it first — do not spawn the verifier to "see what happens" while known
prerequisites are unresolved.

1. Are all items listed in the task's `**Depends on:**` field marked `done` in
   BACKLOG.md?
2. Is ACTIVE.md clear of other in-flight items whose changes would affect the gate
   result?
3. Have objective gates (build/test/lint) passed on the *current working tree*,
   including all uncommitted changes?
4. Are there any STATUS.md Blockers that remain unresolved and fall within this
   task's scope?
5. Does `git diff` include only changes that belong to this task's scope — no
   unintended edits from other work?

---

## Verification loop

### Step 1 — Spawn a fresh verifier

Spawn a **new** subagent that did NOT write any of the code being reviewed.
Give it:
- The verbatim contents of `SPEC.md` (the full file).
- The product description from `SPEC.md §1`.
- The instruction below (copy verbatim):

> You are an independent verifier. Evaluate the Linear Algebra Visualizer
> application strictly against the SPEC.md provided and the product description.
> Do not invent new requirements. Do not move goalposts. Separate blocking spec
> violations from non-blocking subjective preferences.
>
> Run the following commands and treat any non-zero exit as a blocking failure:
>   npm install
>   npm run build
>   npm run test
>   npm run lint
>
> Then check every item in SPEC.md §7 (Definition of Done), with explicit
> attention to:
>   - All seven concept cards present with live-rendered thumbnails
>   - Each concept page has visualization + sandbox + explanation panel
>   - Real-time updates — no apply/submit/recompute button anywhere
>   - Mathematical honesty: literal depictions, not metaphorical
>   - R²/R³ coverage per concept as specified
>   - Rendered-not-pre-baked visuals (no static images or video)
>
> For each item in scope, read its **Goal criteria** in `dev/BACKLOG.md` and
> confirm each criterion is satisfied.
>
> Return either: PASS
> Or: a numbered list of concrete, spec-referenced gaps. For each gap, cite the
> SPEC.md section it violates and state exactly what is wrong.

### Step 2 — Act on the verdict

- **PASS**: the change is done. Update ACTIVE → DONE. Commit.
- **Non-PASS**: fix every gap in the numbered list. Return to Step 1 with a
  completely new verifier agent (not the same one).

### Step 3 — Cycle cap

Cap at **5 verify-fix cycles**. If the gate still has not passed after 5 rounds:
- Stop. Do not declare completion.
- Write the remaining gaps to `STATUS.md` under "Blockers".
- Leave the relevant BACKLOG item with `**Status:** active` and a **Blocked:**
  note in ACTIVE.md.

---

## Agent coordination rules

These rules prevent shared-code conflicts when parallel subagents are working:

- Concept module folders (`src/concepts/<id>/`) are isolated. A concept agent
  owns its folder completely and must not modify anything outside it.
- Shared code (`src/scene/`, `src/ui/`, `src/linalg/`, `src/styles/`,
  `src/types.ts`, `concepts/registry.ts`) is modified only by the main agent.
  If a concept agent needs a new shared capability, it must request it from the
  main agent rather than editing shared files directly.
- `CONTRACTS.md` is the frozen interface spec for shared components. If a shared
  component changes its props interface, `CONTRACTS.md` must be updated at the
  same time. Do not silently diverge from it.
- When in doubt about whether a change is "shared", assume it is and route
  through the main agent.

---

## What the verifier cannot do

The verifier runs code, builds, and tests. It **cannot see rendered pixels**.
This means:
- Visual correctness of geometry must be enforced through unit-tested pure
  functions (`geometry.ts` per concept + `src/linalg/`), not visual inspection.
- Real-time wiring must be enforced through tests that assert a store change
  produces changed geometry output.
- Final visual judgment (layout, color, typography, feel) is the human
  operator's, done by running `npm run dev` and inspecting the browser.
