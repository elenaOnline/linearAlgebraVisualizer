# Backlog

Prioritized list of pending work. See `dev/README.md` for item format and rules.

Items are ordered by priority within each group. Move an item's status to
`active` when you start it and `done` when complete; also move it to DONE.md.

---

## P1 — Blocking / High Impact

### [B-01] Style guide migration
**Priority:** P1
**Category:** style
**Status:** done
**Depends on:** none
**Description:** `src/styles/tokens.css` currently uses a dark theme with
`--color-*` naming that does not match the authoritative design system in
`Style Guide.html`. All CSS custom properties must be migrated to the
bone-paper light theme and Plate vector palette defined there.
**Acceptance criteria:**
- `tokens.css` exports the neutral tokens (`--bg`, `--bg-2`, `--bg-3`, `--panel`,
  `--panel-2`, `--ink`, `--ink-1` through `--ink-4`, `--line`, `--line-2`,
  `--line-3`, `--radius`, `--radius-lg`) matching the style guide hex values
- Vector accent tokens present: `--v1` (vermilion), `--v2` (prussian),
  `--v3` (ochre), `--vp` (forest) with `-wash` and `-edge` variants
- Type-scale tokens present (`--t-display`, `--t-h1`, `--t-h2`, `--t-body`,
  `--t-meta`, `--t-micro`) matching the style guide sizes/weights
- Font stack tokens use Geist, Geist Mono, STIX Two Text (loaded via Google
  Fonts in `index.html`)
- All existing component CSS Modules updated to use the new token names
- `npm run build` and `npm run lint` still exit 0 after migration
- Visual result inspected in browser with `npm run dev` (human sign-off)
**Goal criteria:**
- `grep -r 'var(--color-' src/` returns 0 results
- `grep 'var(--bg' src/styles/tokens.css` returns a match
- `grep 'var(--v1' src/styles/tokens.css` returns a match
- `npm run build && npm run lint` exit 0

### [B-02] Verification gate run (Phase 4)
**Priority:** P1
**Category:** infra
**Status:** done
**Depends on:** [B-01]
**Description:** Phase 4 (the independent verification gate per `CLAUDE.md §9`
and `dev/PROTOCOL.md`) has not been run yet. All seven concepts are implemented
but have not been verified against `SPEC.md §7`.
**Acceptance criteria:**
- A fresh verification subagent runs all objective gates (install/build/test/lint)
  with exit 0
- Verifier checks every item in SPEC.md §7 Definition of Done
- Verifier returns PASS, or gaps are fixed and another fresh verifier is spawned
- Cycle repeats until PASS (cap 5 cycles)
- If PASS not reached after 5 cycles, remaining gaps written to STATUS.md Blockers
**Goal criteria:**
- B-01 status is `done` in BACKLOG.md before the gate is spawned
- All four objective gates (`npm install`, `npm run build`, `npm run test`,
  `npm run lint`) exit 0
- Verifier agent returns PASS with no numbered gaps

---

## P2 — Important Polish / Correctness

### [B-03] Thumbnail lazy mounting
**Priority:** P2
**Category:** performance
**Status:** done
**Depends on:** none
**Description:** All 7 gallery thumbnails mount simultaneously, each creating a
WebGL context. This degrades gallery performance as noted in STATUS.md. Add
IntersectionObserver-based lazy mounting so thumbnails only create their canvas
when scrolled into view.
**Acceptance criteria:**
- Thumbnails outside the viewport do not mount a WebGL canvas
- Thumbnails mount within one intersection observer tick of entering the viewport
- No visual flash or layout shift when a thumbnail mounts
- Existing `frameloop="demand"` setting is retained on each thumbnail Scene
- `npm run build` and `npm run test` still exit 0
**Goal criteria:**
- `grep -r 'IntersectionObserver' src/concepts/` returns at least 7 matches
  (one per Thumbnail file)
- `npm run build && npm run test` exit 0

### [B-04] Vite chunk splitting
**Priority:** P2
**Category:** performance
**Status:** done
**Depends on:** none
**Description:** Vite produces a single large bundle (three.js + katex + R3F are
each large). Split into manual chunks to improve load time.
**Acceptance criteria:**
- `vite.config.ts` has a `manualChunks` entry separating at minimum three.js,
  katex, and react-three-fiber into their own chunks
- `npm run build` exits 0 with no chunk-size warnings (or warnings are for chunks
  below 1MB)
- `npm run dev` still works
**Goal criteria:**
- `grep 'manualChunks' vite.config.ts` returns a match
- `npm run build` exits 0

### [B-05] Cross-concept visual consistency pass
**Priority:** P2
**Category:** polish
**Status:** done
**Depends on:** [B-01]
**Description:** After Phase 2, concept pages may have diverged in axis colors,
vector accent colors, panel layout, and spacing. Apply a consistency pass so all
seven concepts share the same visual conventions.
**Acceptance criteria:**
- All concept pages use vector colors from the Plate palette (`--v1`/`--v2`/`--v3`/`--vp`)
  for rendered vectors — no ad-hoc hex values in concept TSX files
- Axis colors match the convention in `Axes.tsx` (x: `--v1`, y: `--v2`, z: `--v3`)
- Panel layout (sandbox left/right, explanation panel position) is consistent
  across all seven concept pages
- Spacing inside panels follows a shared scale from `tokens.css`
- `npm run lint` exits 0
**Goal criteria:**
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results
- `npm run lint` exits 0

### [B-06] Keyboard accessibility pass
**Priority:** P2
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** All controls (NumberInput, Slider, VectorInput, MatrixInput,
DimensionToggle) must be fully keyboard-navigable per `SPEC.md §G11`.
**Acceptance criteria:**
- Tab order is logical on every concept page
- All sliders are operable with arrow keys
- DimensionToggle can be operated with keyboard (tab + enter/space)
- NumberInput fields accept keyboard input without focus traps
- `aria-label` or visible label is present on every form control
- No keyboard traps in the scene canvas area
**Goal criteria:**
- `grep -rn 'aria-label\|htmlFor\|aria-labelledby' src/ui/NumberInput.tsx src/ui/Slider.tsx src/ui/VectorInput.tsx src/ui/MatrixInput.tsx src/ui/DimensionToggle.tsx` returns at least one match per file
- `npm run lint` exits 0

---

## P3 — Nice to Have / Deferred

### [B-07] README.md with setup instructions
**Priority:** P3
**Category:** docs
**Status:** open
**Depends on:** none
**Description:** The repository has no README for new contributors or operators.
**Acceptance criteria:**
- `README.md` at the project root with: project description, prerequisites
  (Node 18+), setup steps (`npm install`, `npm run dev`), available commands,
  brief architecture overview pointing to CLAUDE.md and SPEC.md
**Goal criteria:**
- `test -f README.md` exits 0
- `grep 'npm install' README.md` returns a match
- `grep 'npm run dev' README.md` returns a match

### [B-08] Dark mode support
**Priority:** P3
**Category:** style
**Status:** open
**Depends on:** none
**Description:** Add a dark mode variant using `prefers-color-scheme` or a manual
toggle. The style guide defines the light (bone-paper) theme; dark values are
not yet specified and would need design input before implementation.
**Acceptance criteria:**
- (Requires design spec for dark token values before implementation can begin)
- `prefers-color-scheme: dark` media query or manual toggle switches themes
- All seven concept pages remain legible and visually correct in dark mode
- Mathematical honesty not compromised by color changes in dark mode
**Goal criteria:**
- `grep -r 'prefers-color-scheme' src/styles/` returns matches
- `npm run build` exits 0
- (Full visual correctness requires human sign-off via `npm run dev`)

---

## P1 — Abstract Spaces Phase

### [B-09] Phase A — New shared primitives
**Priority:** P1
**Category:** feature
**Status:** done
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
- `grep 'complexMul\|complexArg\|evalComplexPoly' src/linalg/complex.ts` returns matches
- `grep -r 'FunctionGraph\|StackingIndicators\|ArgandPlane\|DomainColoringMesh' src/scene/` returns at least 4 distinct files
- `grep 'PolyDeg\|ComplexVec2\|Complex' src/types.ts` returns matches
- `npm run test && npm run build && npm run lint` all exit 0
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results (no regressions from existing concepts)

### [B-10] Group 1 — Polynomial cards (Cards 1, 2, 3)
**Priority:** P1
**Category:** feature
**Status:** done
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
- `grep 'poly-space\|poly-addition\|poly-scalar-mul' src/concepts/registry.ts` returns 3 matches
- `grep -r 'isZero\|a2IsZero' src/concepts/poly-space/geometry.test.ts` returns matches
- `grep -r 'sumIsZero' src/concepts/poly-addition/geometry.test.ts` returns a match
- `grep -r 'cIsZero\|cIsNegative' src/concepts/poly-scalar-mul/geometry.test.ts` returns matches
- `npm run test && npm run build && npm run lint` all exit 0

### [B-11] Group 2 — Complex Polynomial (Card 4)
**Priority:** P1
**Category:** feature
**Status:** done
**Depends on:** [B-09]
**Description:** Implement the complex-poly concept card with three stacked mini
Argand planes for coefficients and domain coloring of p(z) in the right panel.
**Acceptance criteria:**
- geometry.ts computes zeros analytically (quadratic formula in ℂ) and the isDoubleZero flag.
- DomainColoringMesh is used in the right panel; the 3D/2D toggle works.
- Color legend is always visible alongside the domain coloring.
- Callouts fire for double-zero and for the number of zeros.
- Satisfies acceptance criteria in SPEC-abstract-spaces.md §3 Card 4 entry.
**Goal criteria:**
- `grep 'complex-poly' src/concepts/registry.ts` returns a match
- `grep -r 'DomainColoringMesh' src/concepts/complex-poly/` returns a match
- `grep -r 'isDoubleZero\|zeros' src/concepts/complex-poly/geometry.test.ts` returns matches
- `npm run test && npm run build && npm run lint` all exit 0

### [B-12] Group 3 — Cross-Space Maps (Cards 5, 6, 7)
**Priority:** P1
**Category:** feature
**Status:** done
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
- `grep 'differentiation\|coordinates\|isomorphism' src/concepts/registry.ts` returns 3 matches
- `grep -r 'onKernel' src/concepts/differentiation/geometry.test.ts` returns a match
- `grep -r 'basisIsValid\|customCoords' src/concepts/coordinates/geometry.test.ts` returns matches
- `grep -r 'isZero\|bIsZero\|aIsZero' src/concepts/isomorphism/geometry.test.ts` returns matches
- `npm run test && npm run build && npm run lint` all exit 0

### [B-13] Group 4 — Complex Spaces (Cards 8, 9, 10, 11)
**Priority:** P1
**Category:** feature
**Status:** done
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
- `grep 'complex-plane\|complex-vectors\|complex-addition\|complex-scalar-mul' src/concepts/registry.ts` returns 4 matches
- `grep -r 'isPureRotation\|cIsI\|rotationAngle' src/concepts/complex-plane/geometry.test.ts` returns matches
- `grep -r 'z2IsZero\|vecIsZero\|z2Arg' src/concepts/complex-vectors/geometry.test.ts` returns matches
- `grep -r 'sumIsZero\|uEqualsV' src/concepts/complex-addition/geometry.test.ts` returns matches
- `grep -r 'isPureRotation\|cIsI\|cIsPositiveReal\|cMagIsZero' src/concepts/complex-scalar-mul/geometry.test.ts` returns matches
- `npm run test && npm run build && npm run lint` all exit 0

### [B-14] Phase C — Verification gate (abstract spaces)
**Priority:** P1
**Category:** infra
**Status:** done
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
- `grep 'poly-space\|poly-addition\|poly-scalar-mul\|complex-poly\|differentiation\|coordinates\|isomorphism\|complex-plane\|complex-vectors\|complex-addition\|complex-scalar-mul' src/concepts/registry.ts` returns 11 distinct matches
- `npm run build && npm run test && npm run lint` all exit 0
- `grep -rn '#[0-9a-fA-F]\{6\}' src/concepts/` returns 0 results
- This BACKLOG entry is marked done and an entry is appended to dev/DONE.md

---

## P1 — Phase D: Problem Log Fixes

Items drawn from `pre-dev/abstract-space-problem-log.md`. Each item targets a concrete
gap identified after initial delivery. B-21 is folded into B-16 (same root cause).

### [B-15] App-wide: replace "arg" with "angle" in all UI text
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** Every label, callout, slider annotation, and legend that uses "arg"
as the complex angle function must be changed to "angle." The term is opaque to the
target audience (newcomers to linear algebra).
**Plan of attack:**
- `grep -rn 'arg' src/` to enumerate all occurrences in UI strings
- In `ComplexScalarMul.tsx`: slider label `"arg(c) — …"` → `"angle(c) — …"`
- In `ComplexVectors.tsx`, `ComplexAddition.tsx`, `ComplexPoly.tsx`: color legend
  strings `"Hue = arg(z…)"` → `"Hue = angle(z…)"`
- In `ComplexPlane.tsx`: check any axis annotation or callout using "arg"
- In explanation-panel `<MathText>` strings: replace `\arg` with `\text{angle}`
  (or the Unicode angle character where appropriate for readability)
- Verify no occurrence of bare `arg(` remains in non-TeX UI strings
**Acceptance criteria:**
- `grep -rn "arg(" src/concepts/` returns 0 results in non-TeX UI strings
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- Manual scan of all complex-related cards shows "angle" not "arg" in every label

### [B-16] Extend polynomial curve and complex domain render distance
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** Polynomial function graphs are sampled over [-4, 4] and appear to end
within the visible viewport. The complex-poly domain coloring is bounded to ±2 and also
ends abruptly. Both must extend well past the visible viewport edge. (Covers the
Card 4 domain extension originally listed as a separate item.)
**Plan of attack:**
- In `poly-space/geometry.ts`, `poly-addition/geometry.ts`, `poly-scalar-mul/geometry.ts`:
  change `xMin = -4, xMax = 4` to `xMin = -10, xMax = 10`
- In the corresponding TSX files: update the `<FunctionGraph xMin={…} xMax={…}>`
  props to match
- In `isomorphism/geometry.ts`: extend `graphPoints` sampling range from [-4,4] to
  [-10, 10] and update FunctionGraph props in `Isomorphism.tsx`
- In `ComplexPoly.tsx`: change the `BOUNDS` constant from `{ xMin: -2, xMax: 2,
  yMin: -2, yMax: 2 }` to `{ xMin: -3.5, xMax: 3.5, yMin: -3.5, yMax: 3.5 }`
**Acceptance criteria:**
- Polynomial curves extend visually beyond the scene edges at any reasonable coefficient value
- Complex-poly domain coloring fills a noticeably larger area of the Argand plane
- `npm run build && npm run test` exit 0
**Goal criteria:**
- `grep 'xMin.*-10\|xMax.*10' src/concepts/poly-space/geometry.ts` returns a match
- `grep 'xMin.*-10\|xMax.*10' src/concepts/isomorphism/geometry.ts` returns a match
- `grep 'xMin.*-3\|xMax.*3' src/concepts/complex-poly/ComplexPoly.tsx` returns a match

### [B-17] Add hue/brightness visual color key (Cards 4, 9, 10, 11)
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** Cards that encode angle as hue and magnitude as brightness describe
the encoding only in text. A first-time viewer cannot decode the visualization without
a visual reference key.
**Plan of attack:**
- Create `src/ui/ComplexColorKey.tsx` and `ComplexColorKey.module.css`
- The component renders two anchored strips:
  1. Hue strip: a CSS `linear-gradient` sweeping through `hsl(0…360, 85%, 50%)`
     with tick labels 0, π/2, π, 3π/2 at the correct positions
  2. Brightness strip: gradient from `hsl(0, 0%, 10%)` to `hsl(0, 0%, 90%)`
     with labels "0" (dark) and "∞" (bright)
- Replace the existing plain-text legend in each of the four affected cards with
  `<ComplexColorKey />`
- Cards: `ComplexPoly.tsx`, `ComplexVectors.tsx`, `ComplexAddition.tsx`,
  `ComplexScalarMul.tsx`
**Acceptance criteria:**
- A visual key with labeled reference hues (0, π/2, π, 3π/2) is anchored in the
  panel of each affected card
- A magnitude brightness strip is also shown alongside
- All four cards show the key
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- `test -f src/ui/ComplexColorKey.tsx` exits 0
- `grep 'ComplexColorKey' src/concepts/complex-poly/ComplexPoly.tsx` returns a match

### [B-18] Replace stacking indicators with shaded regions (Cards 2, 3)
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** The vertical bar stacking indicators in poly-addition and poly-scalar-mul
add visual noise without aiding comprehension. Replace with a shaded area between the
base curve and the result curve.
**Plan of attack:**
- Create `src/scene/ShadedArea.tsx`: takes `lower: [number, number][]` and
  `upper: [number, number][]` (x,y pairs, same length), builds a triangle-strip
  `THREE.BufferGeometry` filling the area between the two curves; accepts `color`
  and `opacity` props
- `poly-addition`: shade between `p(x)` and `(p+q)(x)` in V2 color; shows q's
  additive contribution; remove `StackingIndicators` and the checkbox
- `poly-scalar-mul`: shade between `f(x)` and `c·f(x)` in VP color; remove
  `StackingIndicators` and the checkbox
- Remove `stackingSamples` from both `geometry.ts` return types (no longer needed)
- Update `geometry.test.ts` files to remove stacking-related test cases
**Acceptance criteria:**
- Both cards show a filled shaded region between the relevant curves, always visible
- The "Show stacking indicators" checkbox is absent from both cards
- No `StackingIndicators` import remains in either card
- `npm run build && npm run test && npm run lint` exit 0
**Goal criteria:**
- `test -f src/scene/ShadedArea.tsx` exits 0
- `grep 'StackingIndicators' src/concepts/poly-addition/PolyAddition.tsx` returns empty
- `grep 'StackingIndicators' src/concepts/poly-scalar-mul/PolyScalarMul.tsx` returns empty

### [B-19] Card 4: coefficient Argand panels render vectors not points
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** The three mini Argand panels for a₀, a₁, a₂ in the complex-poly card
render only a DraggableHandle sphere. Each should also render a VectorArrow from the
origin to the coefficient position, consistent with how vectors are shown elsewhere.
**Plan of attack:**
- In `ComplexPoly.tsx`, locate the scene content rendered inside each coefficient
  mini ArgandPlane
- Add `<VectorArrow vector={[coeff[0], coeff[1], 0]} color={…} showLabel={false} />`
  alongside the existing `<DraggableHandle>` for each of the three coefficient panels
- Use a distinguishing color per coefficient (e.g. V1 for a₀, V2 for a₁, V3 for a₂)
**Acceptance criteria:**
- Each of the three mini panels shows an arrow from the origin to the coefficient point
- The DraggableHandle sphere is still present for interactivity
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- `grep 'VectorArrow' src/concepts/complex-poly/ComplexPoly.tsx` returns at least 3 matches

### [B-20] Card 9: combined view renders as vector not point
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** The combined view in ComplexVectors renders z₁ as a colored circle
(circleGeometry). It should render as a vector arrow from the origin, consistent with
the rest of the application.
**Plan of attack:**
- In `ComplexVectors.tsx`, locate the combined view Scene content (the `<mesh>` with
  `<circleGeometry>` at position z₁)
- Replace with `<VectorArrow vector={[z1[0], z1[1], 0]} color={complexToColor(z2)} />`
  where `complexToColor` is the existing HSL encoding function in the same file
- Keep the `<DraggableHandle>` for interactivity
**Acceptance criteria:**
- The combined view shows an arrow from the origin to the z₁ point, colored by z₂
- Dragging the handle in the combined view still updates z₁
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- `grep 'circleGeometry' src/concepts/complex-vectors/ComplexVectors.tsx` returns empty

### [B-21] Card 4: add Re/Im and magnitude axis labels
**Priority:** P1
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** The main domain-coloring panel in complex-poly lacks Re/Im axis labels.
In 3D surface mode, the vertical height axis (representing |p(z)|) is also unlabeled.
**Plan of attack:**
- Verify whether the center panel uses bare `<Scene>` or `<ArgandPlane>`. If bare
  `<Scene>`, add `axisLabels={['Re', 'Im']}` prop (or switch to `<ArgandPlane>`)
- For the 3D height surface: add a `<Text>` element from @react-three/drei near the
  positive z-axis tip, reading "|p(z)|", rendered only when in 3D mode
**Acceptance criteria:**
- Re and Im labels are visible on the complex-plane axes in the center panel
- In 3D mode a height axis label "|p(z)|" is visible
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- `grep "axisLabels\|ArgandPlane" src/concepts/complex-poly/ComplexPoly.tsx` returns a match
  for the center panel usage

### [B-22] Card 5: add shared functional graph to Differentiation
**Priority:** P1
**Category:** feature
**Status:** done
**Depends on:** none
**Description:** Differentiation currently shows domain and image only as points in
coefficient space. Adding a shared functional-graph panel (f and f′ on the same axes)
gives the map a concrete geometric sense — the derivative line tracks the original curve.
**Plan of attack:**
- In `differentiation/geometry.ts`: add `fPoints` and `dfPoints` arrays (sample
  f(x) = a₀ + a₁x + a₂x² and f′(x) = a₁ + 2a₂x at 200 points over [-10, 10]);
  add them to the `DifferentiationGeo` interface
- In `differentiation/geometry.test.ts`: add tests asserting fPoints and dfPoints
  are sampled correctly at known coefficients
- In `Differentiation.tsx`: add a third panel below the existing two-column row;
  render `<FunctionGraph fn={…} xMin={-10} xMax={10} color={V1} />` for f and
  `<FunctionGraph fn={…} xMin={-10} xMax={10} color={V2} />` for f′ on a shared
  `<Scene dim="2d">`
- In `Differentiation.module.css`: add layout for the third panel
**Acceptance criteria:**
- A third panel shows f(x) and f′(x) as two curves on the same axes
- Both curves update in real time as coefficients change
- The derivative line is visually distinguishable from the polynomial curve
- `npm run build && npm run test` exit 0
**Goal criteria:**
- `grep 'fPoints\|dfPoints' src/concepts/differentiation/geometry.ts` returns matches
- `grep 'FunctionGraph' src/concepts/differentiation/Differentiation.tsx` returns a match

### [B-23] Card 7: Isomorphism R² ≅ P₁ → R³ ≅ P₂
**Priority:** P1
**Category:** feature
**Status:** done
**Depends on:** none
**Description:** The current isomorphism φ: R² → P₁ maps (a,b) ↦ b + a·x. Replace with
φ: R³ → P₂ mapping (a,b,c) ↦ a·1 + b·x + c·x². The left panel becomes a 3D R³ scene;
the right top panel shows the P₂ coefficient space (3D); the right bottom panel shows
the updated polynomial graph.
**Plan of attack:**
1. `isomorphism/store.ts`: add state variable `c` (default 0) and `setC` action
2. `isomorphism/geometry.ts`: update mapping — codomain point is `[a, b, c]`;
   `graphPoints` samples `a + b*x + c*x²`; update zero-condition flags for 3-variable case
3. `isomorphism/geometry.test.ts`: update tests to use 3-variable mapping
4. `Isomorphism.tsx`:
   - Left panel: change `<Scene dim="2d">` to `<Scene dim="3d">`, update
     `<DraggableHandle dim="3d">`, add numeric input for `c`
   - Right top: update from 2D P₁ point to 3D P₂ point (Vec3 [a,b,c])
   - Right bottom: FunctionGraph already used — no change needed if graphPoints updated
   - Mapping label: `(a, b, c) ↦ a·1 + b·x + c·x²`
5. `Isomorphism.module.css`: verify layout still works with 3D left panel
**Acceptance criteria:**
- Left panel is a 3D scene; the draggable vector has three components (a, b, c)
- Right top shows the P₂ coefficient space as a 3D point/vector
- Right bottom shows the graph of a + b·x + c·x² updating live
- Mapping label in the UI reads `(a, b, c) ↦ a·1 + b·x + c·x²`
- `npm run build && npm run test` exit 0
**Goal criteria:**
- `grep 'setC\b' src/concepts/isomorphism/store.ts` returns a match
- `grep 'c \* x \* x\|c\*x\*x' src/concepts/isomorphism/geometry.ts` returns a match

### [B-24] Card 9: combined view undersized
**Priority:** P2
**Category:** polish
**Status:** done
**Depends on:** none
**Description:** The combined right-side panel in ComplexVectors is smaller than its
container. It should occupy the full available panel space.
**Plan of attack:**
- In `ComplexVectors.module.css`, inspect `.combinedCanvas` and `.combinedCard` rules
- Add `flex: 1`, `min-height: 0`, `height: 100%` as needed so the Scene canvas
  fills the parent container
- Verify in browser at `npm run dev` that the panel fills correctly
**Acceptance criteria:**
- The combined view Scene canvas fills its card without empty space above/below
- `npm run build` exits 0
**Goal criteria:**
- Visual verification in browser

### [B-25] Card 10: grey out complex-addition gallery tile
**Priority:** P1
**Category:** ux
**Status:** done
**Depends on:** none
**Description:** The complex-addition card has no satisfying visualization and should
be visually disabled in the gallery. The registry entry and page remain; only the
home card is greyed out and unclickable.
**Plan of attack:**
1. `src/types.ts`: add `disabled?: boolean` to `ConceptMeta`
2. `src/concepts/complex-addition/index.ts`: add `disabled: true` to the exported
   `ConceptMeta` object
3. `src/routes/Home.tsx`: when `concept.disabled`, render the card without a `<Link>`
   wrapper and apply a `.cardDisabled` CSS class
4. `src/routes/Home.module.css`: add `.cardDisabled` rule with `opacity: 0.4`,
   `pointer-events: none`, `cursor: default`
**Acceptance criteria:**
- The complex-addition tile renders at reduced opacity with no hover/click effect
- Clicking the tile does not navigate
- All other tiles are unaffected
- `npm run build && npm run lint` exit 0
**Goal criteria:**
- `grep 'disabled' src/types.ts` returns a match
- `grep 'disabled.*true' src/concepts/complex-addition/index.ts` returns a match
- `grep 'cardDisabled' src/routes/Home.module.css` returns a match
