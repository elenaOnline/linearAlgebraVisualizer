# CLAUDE.md

Operating guide for any agent working in this repository. Read this file **and**
`SPEC.md` in full before writing code. `SPEC.md` is the source of truth for *what*
to build and how it will be judged; this file covers *how* to build it.

---

## 1. Project

A browser-based **Linear Algebra Visualizer**: an interactive web application that
renders the core concepts of linear algebra and lets the user manipulate them in
real time. The seven concepts, in gallery/registry order (see `SPEC.md` §6), are:

1. Vectors
2. Vector spaces
3. Span
4. Basis
5. Dimension
6. Matrices as linear maps
7. Nullspace

The home screen is a gallery of seven **cards**, each with a live-rendered
thumbnail. Clicking a card opens that concept's page, which contains a
**visualization** and a **sandbox** of manipulable variables. Every visualization
is computed and rendered in the browser — never a pre-made image or video — and
updates in real time as the user changes any exposed variable.

## 2. Current status

**Phases 1 and 2 are complete.** The application exists and all seven concept
modules are implemented. Phase 3 (integration & polish) is in progress.

- Phase 1 (foundation scaffold, `src/linalg/`, shared `scene/`/`ui/` primitives,
  routing, registry): complete — gates pass, 115 tests.
- Phase 2 (all seven concept modules with geometry, stores, and thumbnails):
  complete.
- Phase 3 (visual polish, style guide migration, performance): in progress.
- Phase 4 (verification gate): not yet run.

For the running decisions log and gate results by phase, see `STATUS.md`.
For completed milestone details, see `dev/DONE.md`.
For pending and in-flight work, see `dev/BACKLOG.md` and `dev/ACTIVE.md`.

## 3. Resolved decisions

These were settled with the product owner before development. Do not relitigate
them; if a decision genuinely blocks progress, leave a note in `STATUS.md` rather
than silently diverging.

- **Ambient spaces:** support both R² and R³. Every concept that is meaningful in
  both dimensions exposes a 2D/3D toggle (see `SPEC.md` for per-concept detail).
- **Deployment:** local only. The deliverable is a project that runs with
  `npm run dev` and builds cleanly with `npm run build`. Do not add deployment
  config or deploy anything.
- **Audience:** newcomers to linear algebra. Each concept page carries guided,
  scaffolded explanation alongside the visualization — but explanation never
  replaces mathematical precision (see §6).
- **Stack:** chosen for robustness and for easy extension with future concepts —
  see §4.

## 4. Tech stack

Use this stack. It is chosen so that new concepts can be added later as isolated
modules without touching existing ones.

- **Language:** TypeScript, `strict` mode on. No `any` in committed code.
- **Framework:** React 18.
- **Build/dev server:** Vite.
- **Routing:** React Router (v6+).
- **Rendering:** Three.js via `@react-three/fiber`, with `@react-three/drei`
  helpers. One canvas abstraction serves both modes: an orthographic camera with
  locked rotation for 2D (R²), an orbit-controlled perspective camera for 3D (R³).
  This keeps a single rendering pipeline rather than two.
- **State:** Zustand. Each concept owns an isolated store module. Concepts must
  not share or read each other's stores.
- **Math notation:** KaTeX (for rendering formal definitions in explanation
  panels).
- **Math/geometry core:** a hand-written, dependency-free module in
  `src/linalg/` (see §5 and §6.3). Do not pull in a heavyweight math library;
  the operations needed are small and must be exactly correct and unit-tested.
- **Testing:** Vitest. The `src/linalg/` core and every pure geometry-derivation
  function must have unit tests. React Testing Library may be used for component
  logic.
- **Lint/format:** ESLint (with `@typescript-eslint`) and Prettier.
- **Styling:** plain CSS with CSS custom properties as design tokens
  (`src/styles/tokens.css`) plus per-component CSS Modules. Keep the dependency
  surface small; do not add a component/UI library.

Pin major versions only; let the package manager resolve minors/patches.

## 5. Architecture

```
src/
  main.tsx                 # entry
  App.tsx                  # router + layout shell
  routes/
    Home.tsx               # gallery of concept cards
    ConceptPage.tsx        # generic shell: resolves a concept by :id from the registry
  concepts/
    registry.ts            # ordered array of ConceptMeta — the single source of concepts
    <concept>/             # one self-contained folder per concept
      index.ts             # exports ConceptMeta (id, title, blurb, supports, Component, Thumbnail)
      <Concept>.tsx        # the concept page body: visualization + sandbox + explanation
      geometry.ts          # PURE: derives renderable geometry from sandbox state
      geometry.test.ts     # unit tests for geometry.ts
      store.ts             # Zustand store for this concept's sandbox state
      Thumbnail.tsx        # live-rendered mini preview for the gallery card
  scene/                   # shared rendering primitives (concept-agnostic)
    Scene.tsx              # R3F <Canvas> wrapper; 2D/3D camera modes; axes; grid
    Axes.tsx  Grid.tsx
    VectorArrow.tsx        # renders a vector as an arrow from the origin
    SubspaceMesh.tsx       # renders a point / line / plane / volume subspace
    DraggableHandle.tsx    # direct-manipulation handle (drag a vector tip, etc.)
    Labels.tsx             # in-scene numeric/coordinate labels
  ui/                      # shared 2D UI primitives
    NumberInput.tsx  Slider.tsx
    VectorInput.tsx        # edit a vector's components
    MatrixInput.tsx        # edit a matrix's entries
    DimensionToggle.tsx    # R² / R³ switch
    Panel.tsx              # sandbox / explanation panel container
    MathText.tsx           # KaTeX wrapper
    Callout.tsx            # state-aware explanatory note
  linalg/                  # PURE math core, no React, no Three
    vector.ts  matrix.ts
    subspace.ts            # rref, rank, nullspace basis, span dimension, independence
    index.ts
    *.test.ts
  styles/
    tokens.css  global.css
  types.ts                 # shared types: ConceptMeta, Dim, Vec, Mat, ...
```

### Concept registry pattern

`concepts/registry.ts` exports an ordered array of `ConceptMeta`. `Home.tsx` maps
over it to render cards; `ConceptPage.tsx` looks a concept up by `:id`. **Adding a
future concept must mean: create one new folder under `concepts/` and add one line
to the registry — nothing else.** Keep concepts decoupled so this stays true.

## 6. Non-negotiable principles

### 6.1 Mathematical honesty

This is the heart of the product. Read `SPEC.md` §"Mathematical honesty" too.

- Visual depictions are **literal**, not metaphorical or analogical. A span that
  is a plane is drawn as a plane; a nullspace that is a line is drawn as a line.
  Never substitute an evocative picture for the actual object.
- Do not invent visual flourishes that imply false mathematics. Do not, for
  example, draw a "fuzzy boundary" on an unbounded subspace, or cap an infinite
  line/plane in a way that suggests it ends.
- Subspaces are unbounded. Render them large enough to read as unbounded within
  the viewport, and make clear (via consistent styling and explanation) that the
  drawn extent is a viewport clip, not the object's edge.
- Floating-point reality must be handled honestly. Use a single shared tolerance
  (`EPS` in `src/linalg`) for rank/independence/zero decisions, surface the
  exact/near-degenerate distinction in the UI when it matters, and never let a
  tiny numerical error silently change a reported dimension without indication.
- Color is permitted **only** to distinguish objects or to highlight what is
  changing. It must never carry mathematical meaning that is not otherwise stated.
- Degenerate cases are first-class. When vectors become linearly dependent, when a
  matrix becomes singular, when a span collapses — the visualization must show the
  true collapsed object, in real time, not freeze or hide it.

### 6.2 Real-time interactivity

- Every exposed variable updates the visualization **immediately** on change.
  There is no "apply", "submit", "recompute", or "render" button anywhere.
- Exposed variables are manipulable through clear controls (numeric inputs and
  sliders) and, wherever it is natural, through **direct manipulation in the
  scene** (dragging a vector's tip, a basis vector, a handle). The two input
  paths stay synchronized: dragging updates the numbers and vice versa.
- Interaction stays responsive (target 60fps). If a computation is heavy, it must
  still not introduce an explicit user-triggered apply step.

### 6.3 Separate mathematics from rendering

This principle is what makes correctness testable and the real-time guarantee
structural.

- All mathematics and all geometry derivation are **pure functions** —
  `src/linalg/` for general math, `concepts/<concept>/geometry.ts` for the
  per-concept step that turns sandbox state into renderable geometry data.
- React/Three components are a thin rendering layer: they take already-computed
  geometry and draw it. They contain no mathematics.
- Because pure functions are unit-tested and the render layer simply maps state →
  pure recompute → re-render, "the visualization is correct" and "the
  visualization updates in real time" both reduce to checkable code, not to
  inspecting pixels. Maintain this separation strictly.

## 7. Commands

After scaffolding, these must all work:

```
npm install        # install dependencies
npm run dev        # start the Vite dev server
npm run build      # type-check + production build; must exit 0
npm run test       # run the Vitest suite; must exit 0
npm run lint       # ESLint; must exit 0
```

Wire `build`, `test`, and `lint` so they are usable as objective gates.

## 8. Development workflow

### Starting any work session

Before writing code, read `dev/BACKLOG.md` to understand pending work and
`dev/ACTIVE.md` to see what is already in flight. When you begin a task, move it
from BACKLOG to ACTIVE with a note on what you are doing and which files are in
scope. When done, move it to `dev/DONE.md`. See `dev/README.md` for the full
protocol.

### Phasing for the initial build (or a major rework)

Decompose large changes and use subagents/subagent teams where they add value.
The initial build followed four phases; the same pattern applies to any large
change set:

**Phase 1 — Foundation (sequential, do not parallelize).**
Scaffold the Vite/React/TS project. Build and fully unit-test `src/linalg/`.
Build the `scene/` and `ui/` shared primitives. Stand up routing, the `Home`
shell, and the concept registry pattern. Establish `styles/tokens.css`.
Freeze the shared component contracts (props of `Scene`, `VectorArrow`,
`SubspaceMesh`, `MatrixInput`, etc.) before Phase 2.

**Phase 2 — Concepts (parallelizable).**
The seven concepts are isolated module folders depending only on the now-frozen
foundation. They may be built by parallel subagents or subagent teams. If you
parallelize, give each agent the relevant `SPEC.md` section, the frozen component
contracts, and explicit instructions not to modify shared code (foundation
changes must be funneled back through the main agent to avoid conflicts).

**Phase 3 — Integration & polish.**
Live thumbnails on the Home cards; consistent 2D/3D toggle behavior; responsive
layout; a cross-concept consistency pass (shared styling, axis conventions,
colors); a basic keyboard-accessibility pass on all controls.

**Phase 4 — Verification gate.** See §9.

### General rules

Commit at the end of each completed phase or concept so a long autonomous run has
rollback points. If you become blocked, write the blocker into `STATUS.md` under
"Blockers" and continue with unblocked work rather than stopping.

## 9. Verification gate

**This gate applies to any significant change** — a new concept module, a change
to shared primitives, a style system overhaul, or the initial delivery. It is a
standing operating procedure, not a one-time completion condition.

A change is **not done** until a fresh, independent verification subagent is
satisfied. The procedure:

- Spawn a **new** subagent for verification — one with no involvement in writing
  the code being reviewed, so its verdict is independent.
- Give it only `SPEC.md` and the product description, and instruct it to judge
  the application **solely against them** — critically but fairly. It must not
  invent new requirements or move goalposts, and it must distinguish a real spec
  violation (blocking) from a subjective nice-to-have (note, non-blocking).
- It must run the objective gates itself — `npm install`, `npm run build`,
  `npm run test`, `npm run lint` — and treat any failure as blocking.
- It must check every item of the `SPEC.md` Definition of Done, with explicit
  attention to: all seven concepts present as cards with live thumbnails;
  visualization + sandbox on each concept page; real-time updates with no apply
  step; mathematical honesty (no metaphorical/analogical representation); R²/R³
  coverage; rendered-not-pre-baked visuals.
- It returns a verdict: **PASS**, or a numbered list of concrete, spec-referenced
  gaps.
- On a non-PASS verdict, fix the listed gaps, then spawn **another** fresh
  verification subagent and repeat. Loop until PASS, up to a cap of 5 cycles.
  If still not passing at the cap, stop and write the remaining gaps to
  `STATUS.md` under "Blockers" — do not declare completion.

The verifier reviews code, builds, and tests; it cannot see rendered pixels.
Compensate by keeping math and geometry in tested pure functions (§6.3) and by
writing tests that assert real-time wiring (a store change produces changed
geometry output). Visual judgment is the human operator's; structural and
mathematical correctness must be verifiable from code and tests.

The full verification protocol, including step-by-step instructions for running
the gate, is in `dev/PROTOCOL.md`.

## 10. Conventions

- TypeScript `strict`; no `any`; prefer precise shared types from `src/types.ts`.
- Pure functions are pure: no side effects, no hidden globals, deterministic.
- One concept per folder; concepts never import from each other.
- Components render; they do not compute mathematics.
- No "apply" buttons; no pre-baked images/video for visualizations.
- Keep the dependency surface minimal — justify any package beyond §4.
- Run `lint`, `test`, and `build` before considering any phase complete.

## 11. Extensibility

Future concepts and features are expected. Protect these properties:

- The registry pattern (§5): a new concept is one folder plus one registry line.
- The `scene/` and `ui/` primitives are general, not concept-specific. If a
  concept needs a new primitive, add it to `scene/`/`ui/` generically rather than
  inline, so later concepts can reuse it.
- The math/rendering split (§6.3) holds for every new concept.
- 2D/3D handling lives in `Scene`/`DimensionToggle`, not duplicated per concept.

When `SPEC.md` and this file disagree, `SPEC.md` wins on *what* to build and this
file wins on *how*. If something is genuinely unspecified, choose the option that
is most mathematically honest and leave a note in `STATUS.md`.

## 12. Dev tracking

The `dev/` directory is the informational hub for ongoing development. Agents
must read and update it as part of normal work.

| File | Purpose | When to read | When to write |
|---|---|---|---|
| `dev/README.md` | How to use the tracker | At start of any session | Never (human-maintained) |
| `dev/PROTOCOL.md` | Verification loop procedure | Before running the gate | Never (human-maintained) |
| `dev/BACKLOG.md` | Prioritized pending work | At start of any session | Add items; move to ACTIVE when starting |
| `dev/ACTIVE.md` | In-flight work | At start of any session | Update when starting/pausing/finishing |
| `dev/DONE.md` | Completed milestone log | For context on past decisions | Append when a task is fully complete |

**Rules:**
- Check BACKLOG and ACTIVE before picking up any work so you don't duplicate effort.
- When you start a task: move the item from BACKLOG to ACTIVE, fill in files-in-scope and acceptance criteria.
- When you finish a task: remove it from ACTIVE and append a brief entry to DONE.
- Do not delete from DONE.md.
- When a non-obvious decision is made (a workaround, a spec ambiguity, a choice between valid options), record it in `STATUS.md` under "Decisions log" with a date.
