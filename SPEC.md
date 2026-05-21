# SPEC.md — Linear Algebra Visualizer

This is the source of truth for **what** to build and how it will be judged. Pair
it with `CLAUDE.md` (which covers **how** to build). The verification subagent
(see §8 and `CLAUDE.md` §9) judges the finished application against this document
and the product description below — nothing more, nothing less.

---

## 1. Product description (verbatim)

> Create a web application that can be used to visualize, in an intuitive way, the
> linear algebra concepts of vector spaces, vectors, basis, dimension, span,
> nullspace, and matrices as linear maps. The visualizations should be rendered,
> not pre-created, and should update in real time to changes the user makes (for
> example, if I am exploring the span of a set of vectors and I update one of the
> vectors, then the span should update in real time. It should be as
> mathematically honest as possible while still highlighting the important details
> (for example, although this is not necessary, it'd be fine to color the span a
> different color to make it clear what's changing, but we want to avoid
> analogical or metaphorical representations). Where applicable, variables should
> be exposed to users in a way that can easily be manipulated and played around
> with to see how the representation changes. Each of the concepts listed should
> be a card with a thumbnail that, when clicked, shows the user the visualization
> and 'sandbox' area.

## 2. Resolved decisions

- **Ambient spaces:** R² and R³ both supported; a 2D/3D toggle on every concept
  where both are meaningful.
- **Deployment:** local only — runs with `npm run dev`, builds with
  `npm run build`. No deployment.
- **Audience:** newcomers to linear algebra. Guided, scaffolded explanation
  accompanies every visualization (§5).
- **Stack:** see `CLAUDE.md` §4.

## 3. Mathematical honesty (the core constraint)

The product description names this twice. It governs every visual decision.

- **Literal, not metaphorical.** Every depicted object is the actual mathematical
  object. A span that is a plane is a plane; a nullspace that is a line is a line.
  No analogies, no metaphors, no evocative stand-ins.
- **No false implications.** Do not add visuals that imply mathematics that is not
  true: no decorative boundaries on unbounded sets, no caps that make an infinite
  line or plane look finite, no animation that implies a canonical process where
  none exists (interpolations must be labeled as visualization aids).
- **Subspaces are unbounded.** Lines, planes, and volumes that represent
  subspaces extend to the viewport edge; styling and explanation make clear the
  drawn extent is a viewport clip, not the object's edge.
- **Degeneracy is shown, not hidden.** When a set becomes linearly dependent, a
  matrix becomes singular, or a span/nullspace changes dimension, the
  visualization shows the true collapsed object in real time. Nothing freezes,
  hides, or pretends.
- **Honest numerics.** `src/linalg` defines a single tolerance `EPS`. All
  rank / independence / zero decisions use it. Near-degenerate states are not
  silently rounded into a false dimension; when a state is numerically ambiguous,
  the UI indicates it.
- **Color is for clarity only.** Color may distinguish objects or highlight what
  is changing (e.g. the span in its own color, as the description explicitly
  permits). It must never encode mathematics that is not also stated in text.
- **Honest framing of scope.** The visualizations live in R² and R³. Where a
  concept is more general (vector spaces include polynomial and function spaces;
  linear maps need not be square), the explanation panel says so in words, so a
  newcomer does not conclude "vector space = arrows in space."

## 4. Global requirements

Identifiers G1–G12 are referenced by the Definition of Done (§7).

- **G1 — Gallery.** The home screen shows a gallery of **seven** concept cards,
  one per concept in §6. Each card has a title, a one-line blurb, and a
  **thumbnail**.
- **G2 — Live thumbnails.** Thumbnails are rendered by the app at runtime (a real
  mini-visualization), not static image or video files. They may be simplified
  and non-interactive. Manage WebGL context count (e.g. `frameloop="demand"`,
  unmount off-screen) so the gallery stays performant.
- **G3 — Card navigation.** Clicking a card opens that concept's page, which
  contains a **visualization area** and a **sandbox area**.
- **G4 — Rendered, not pre-created.** Every visualization is computed and rendered
  in the browser (WebGL via Three.js). No pre-made images or videos stand in for
  a visualization anywhere.
- **G5 — Real-time updates.** Changing any exposed variable updates the
  visualization immediately. There is no apply / submit / recompute / render
  button anywhere in the app.
- **G6 — Manipulable variables.** Every exposed variable is editable through clear
  controls (numeric inputs and/or sliders). Where direct manipulation is natural
  (vector tips, basis vectors, probe points, handles), the scene also supports
  dragging, and drag input and numeric input stay synchronized in both
  directions.
- **G7 — R² and R³.** Every concept for which both are meaningful offers a 2D/3D
  toggle and works correctly in both. (For linear maps, "2D/3D" means 2×2 and
  3×3.)
- **G8 — Mathematical honesty.** The application satisfies every point of §3.
- **G9 — Newcomer explanation.** Every concept page has an explanation panel as
  specified in §5.
- **G10 — Runs and builds.** `npm install`, `npm run dev`, `npm run build`,
  `npm run test`, and `npm run lint` all succeed (exit 0).
- **G11 — Tested pure core.** All mathematics and geometry derivation are pure
  functions (`src/linalg/` and `concepts/<concept>/geometry.ts`) with Vitest unit
  tests covering correctness and degenerate cases. Tests also assert real-time
  wiring: a change to sandbox state produces correspondingly changed geometry
  output.
- **G12 — Consistency.** Shared conventions across all concepts: a right-handed
  coordinate frame, consistent axis colors, a marked origin, a unit reference
  grid, and consistent control styling from `src/ui`.

## 5. Concept page layout & explanation panel

Each concept page has three regions (responsive; on narrow viewports they stack):

1. **Visualization area** — the rendered R²/R³ scene. Contains the 2D/3D toggle,
   camera controls (orbit/zoom in 3D), and in-scene labels/readouts.
2. **Sandbox area** — the exposed variables for that concept as numeric inputs
   and sliders, grouped and labeled, plus any per-concept toggles.
3. **Explanation panel** — for the newcomer audience, containing:
   - an **informal definition** in plain language;
   - a **formal definition** rendered with KaTeX;
   - **"Try this"** — 2–4 short guided prompts that suggest manipulations and say
     what to watch for;
   - **state-aware callouts** — at least one `Callout` per concept that reads the
     current sandbox state and describes what is true *right now* (e.g. "These
     two vectors are linearly dependent, so their span is a line, not a plane").
     Callouts update in real time with the visualization.

## 6. The seven concepts

Order below is the gallery/registry order. Each concept is a self-contained module
(`CLAUDE.md` §5). Each lists its exposed sandbox variables; all of them obey
G5/G6 (real-time, manipulable, draggable where natural).

### 6.1 Vectors — `vectors`

**Definition.** A vector is an element of a vector space; in Rⁿ it is an ordered
n-tuple of real numbers, depicted as an arrow from the origin to the point with
those coordinates.

**Visualization.** R²/R³ scene with axes and a unit grid. Vectors **u** and **v**
drawn as arrows from the origin. On demand: their sum **u + v** shown via the
literal tip-to-tail (parallelogram) construction; the scalar multiple **c·v**.

**Sandbox / exposed variables.** Components of **u** and **v** (inputs + sliders +
draggable tips); scalar **c** for scalar multiplication (slider spanning negative
through positive); toggles to show/hide the sum, the tip-to-tail construction, and
the scalar multiple. Readouts: components and Euclidean norm of each vector.

**Honesty notes.** Addition is the actual tip-to-tail construction, not a
metaphor. The norm is the true Euclidean length. A negative scalar literally
reverses direction; `c = 0` yields the zero vector, drawn honestly as a point at
the origin. No fake minimum arrow length.

**Acceptance.** Editing components or dragging a tip updates the arrow live; the
sum and scalar multiple recompute live; norm readouts update live; works in R²
and R³.

### 6.2 Vector spaces — `vector-spaces`

**Definition.** A vector space is a set closed under addition and scalar
multiplication and satisfying the vector-space axioms. This page explores
**subspaces** of R²/R³: which subsets are themselves vector spaces. A subspace
must contain **0** and be closed under addition and scalar multiplication. The
subspaces of R³ are exactly {0}, every line through the origin, every plane
through the origin, and R³ itself.

**Visualization.** Ambient R²/R³. The user selects a candidate subset, which is
drawn, and the three subspace conditions are tested live: contains **0**; closed
under addition (place **a**, **b** in/near the subset, show **a + b**); closed
under scalar multiplication (show **c·a**). The app highlights whether each result
lands back in the subset and reports a verdict. Candidate types offered: {0}; a
line through the origin; a plane through the origin; the whole space; and a
deliberate **non-example** — a line or plane *not* through the origin (offset).

**Sandbox / exposed variables.** Candidate type; the defining vector(s) of the
candidate; an offset parameter for the non-example; test vectors **a**, **b** and
scalar **c**.

**Honesty notes.** The non-example must fail honestly: show that **0** is not in
an offset line/plane and that **a + b** leaves it. Do not fudge a near-miss into a
pass. The explanation panel states that vector spaces also include non-geometric
examples (polynomial and function spaces) which this page does not draw.

**Acceptance.** Changing the candidate or test vectors updates the drawn results
and the pass/fail verdict immediately; the non-example genuinely fails; works in
R² and R³.

### 6.3 Span — `span`

**Definition.** The span of a set of vectors is the set of all their linear
combinations — the smallest subspace containing them.

**Visualization.** R²/R³ scene with a user-controlled set of 1–3 vectors. The span
is rendered as the literal object it is: the origin (all vectors zero); a line
(one independent direction); a plane (two independent directions); all of R³
(three independent directions in R³). It is drawn in its own distinct color. A
coefficient explorer (sliders c₁, c₂, c₃) shows the specific combination
c₁**v₁** + c₂**v₂** + c₃**v₃** as a point moving within the span. A probe point
reports whether it lies in the span.

**Sandbox / exposed variables.** Number of vectors (1–3); each vector's components
(inputs + sliders + draggable tips); coefficients c₁, c₂, c₃; the probe point.
Readout: the span's dimension.

**Honesty notes.** This is the description's worked example: editing a vector must
update the span — including its **dimension** — in real time. When vectors become
linearly dependent the span visibly drops dimension. The span is unbounded and
rendered as such.

**Acceptance.** Editing/dragging any vector updates the span object, its color
region, and its reported dimension instantly; dependent configurations collapse
correctly; the probe verdict updates live; works in R² and R³.

### 6.4 Basis — `basis`

**Definition.** A basis of a vector space is a linearly independent set that spans
it. A basis of Rⁿ has exactly n vectors. Every vector has **unique** coordinates
with respect to a given basis.

**Visualization.** R²/R³. The user supplies n candidate vectors. The app reports
whether they are independent, whether they span, and therefore whether they form
a basis. When they do, it renders the **lattice of integer linear combinations**
they induce (the literal coordinate grid in that basis) alongside the standard
grid. A point **p** displays its coordinates in the standard basis and in the
chosen basis (change of basis).

**Sandbox / exposed variables.** The n basis-candidate vectors (inputs + draggable
tips); the point **p**. Readouts: independent? / spans? / basis?; coordinates of
**p** in both bases.

**Honesty notes.** The induced grid is exactly the set of integer combinations,
not decoration. If the candidates fail (dependent, or wrong count), state exactly
why and do not draw a false grid. The standard basis is presented as one basis
among many. Uniqueness of coordinates is the honest payoff and is stated.

**Acceptance.** Dragging a basis vector deforms the induced grid live; **p**'s
coordinates in the chosen basis update live; the basis verdict updates live; works
in R² and R³.

### 6.5 Dimension — `dimension`

**Definition.** The dimension of a vector space is the number of vectors in any
basis — a well-defined invariant: every basis of a given space has the same size.

**Visualization.** R²/R³. The user builds a set of 0–4 vectors (add / remove /
edit). The app renders the span of the set and reports its dimension (0/1/2/3).
For each vector it indicates whether that vector is independent of the others; as
a vector is added, the visualization shows whether the span grew (the vector was
independent) or not (it was dependent — shown lying within the existing span).
Adding more than 3 vectors in R³ cannot raise the dimension past 3, and this is
shown.

**Sandbox / exposed variables.** Add/remove vectors; each vector's components;
per-vector visibility/contribution toggles. Readouts: dimension of the span; the
running rank; per-vector independent/dependent status.

**Honesty notes.** Dimension is the rank of the set, computed honestly via RREF.
Distinguish "number of vectors in the set" from "dimension of the span." The
invariance claim is stated and demonstrated (which independent vectors you pick
does not change the count).

**Acceptance.** Adding, removing, or editing a vector updates the span, the
dimension readout, and every per-vector verdict instantly; dimension is capped by
the ambient dimension; works in R² and R³.

### 6.6 Matrices as linear maps — `linear-maps`

**Definition.** An m×n matrix represents a linear map from Rⁿ to Rᵐ, fully
determined by where it sends the standard basis vectors — its columns. This page
treats square maps: 2×2 (R² → R²) and 3×3 (R³ → R³).

**Visualization.** Render the standard grid and standard basis vectors, then apply
matrix **A**: show the transformed grid and the transformed basis vectors (the
columns of **A**). A user-chosen vector **v** is shown together with its image
**Av**. An interpolation control continuously morphs from the identity to **A**
(parameter **t** exposed; labeled explicitly as a visualization aid, not a
canonical process). The **determinant** of **A** is displayed and shown as the
signed area (2×2) or signed volume (3×3) scaling factor, via the unit square/cube
and its image, with orientation reversal shown by an actual flip when det < 0.

**Sandbox / exposed variables.** Entries of **A** (a 2×2 or 3×3 `MatrixInput`
selected by the dimension toggle); the probe vector **v**; the interpolation
parameter **t**; toggles for the transformed grid, the unit square/cube + det
region, and the column space. Readout: det(**A**), and a singular/invertible flag.

**Honesty notes.** det is literally the signed area/volume scale factor — not a
metaphor. A singular matrix genuinely collapses the grid onto a line or plane; the
image grid is shown truly degenerate, not nudged to look invertible. The columns
of **A** are exactly the transformed basis vectors and must remain consistent if
the user drags those vectors directly. The interpolation is one continuous family
of maps among many possible — labeled as such.

**Acceptance.** Editing any entry of **A** updates the transformed grid, **Av**,
and det immediately; singular matrices collapse honestly; the interpolation
parameter animates continuously; works for 2×2 and 3×3.

### 6.7 Nullspace — `nullspace`

**Definition.** The nullspace (kernel) of a matrix **A** is the set of all vectors
**x** with **Ax = 0**. It is a subspace of the domain. Its dimension is the
nullity, and rank + nullity = n (the rank–nullity theorem).

**Visualization.** Domain space R²/R³ with matrix **A** (2×2 or 3×3). The
nullspace is rendered as the literal subspace it is — the origin point {0}, a
line, or a plane through the origin — in its own distinct color, updating as **A**
changes. A probe vector **x** is shown with its image **Ax**; when **Ax = 0** the
app highlights that **x** is in the nullspace. rank, nullity, and the identity
rank + nullity = n are displayed.

**Sandbox / exposed variables.** Entries of **A**; the probe vector **x** (inputs
+ draggable), including a mode that constrains **x** to the nullspace so the user
can watch **Ax** stay **0**; the dimension toggle. Readouts: rank, nullity, their
sum, and an invertible/singular flag.

**Honesty notes.** The nullspace is computed via RREF with the shared `EPS`. When
**A** is invertible the nullspace is exactly {0} and is drawn as the single origin
point — no faked structure. When **A** becomes singular the nullspace jumps
dimension; this is shown live. rank + nullity = n is displayed and always holds.

**Acceptance.** Editing **A** updates the nullspace subspace, its dimension, rank,
and nullity instantly; the {0} case renders honestly; the constrained-probe mode
keeps **Ax = 0**; works for 2×2 and 3×3.

## 7. Definition of Done

The application is done when **all** of the following hold. The verifier checks
each item explicitly and cites this list by number.

**Objective gates (any failure is blocking):**

1. `npm install` succeeds from a clean checkout.
2. `npm run build` succeeds (exit 0), including the TypeScript type-check.
3. `npm run test` succeeds (exit 0) with meaningful coverage of `src/linalg/` and
   every `concepts/<concept>/geometry.ts`, including degenerate cases and
   real-time-wiring assertions (G11).
4. `npm run lint` succeeds (exit 0).
5. `npm run dev` starts the app and the home gallery renders.

**Functional requirements:**

6. All twelve global requirements G1–G12 (§4) are satisfied.
7. All seven concepts (§6.1–6.7) exist, each as a registry entry, a card with a
   live thumbnail, and a concept page with a visualization area and a sandbox
   area.
8. Each concept satisfies its own Visualization, Sandbox, Honesty, and Acceptance
   clauses in §6.
9. Real-time updates (G5) hold everywhere: there is no apply/submit/recompute
   button anywhere in the app.
10. Mathematical honesty (§3) holds throughout: no metaphorical or analogical
    representation; degenerate cases shown truthfully; subspaces unbounded;
    honest numerics.
11. Every concept page has the newcomer explanation panel of §5, including at
    least one real-time state-aware callout.
12. The architecture matches `CLAUDE.md` §5: math/rendering separation held,
    concepts decoupled, registry pattern intact so a future concept is one folder
    plus one registry line.

**Non-goals (out of scope — not required, and absence is not a gap):**

- Eigenvalues / eigenvectors / diagonalization (det as a scaling factor *is* in
  scope; an eigen-decomposition page is not).
- Inner products / orthogonality as their own concept page.
- Non-Rⁿ vector spaces rendered as visualizations (they are mentioned in text
  only — see §3).
- Deployment, backend, accounts, or persistence.
- Non-square linear maps as interactive visualizations (mentioned in text only).

## 8. Verifier instructions (summary)

A fresh, independent subagent (see `CLAUDE.md` §9) judges the build against this
document and the §1 description, critically but fairly. It runs the objective
gates itself, checks every Definition-of-Done item, and returns **PASS** or a
numbered list of concrete, spec-referenced gaps. It does not add requirements
beyond this document, and it separates blocking spec violations from
non-blocking subjective preferences. Non-PASS verdicts trigger a fix-and-reverify
loop until PASS.
