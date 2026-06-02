# Phase: Abstract Vector Space Representations

Exploratory ideas for extending the visualizer to vector spaces beyond Rⁿ. The
goal is to give genuine intuition without resorting to metaphor — the
visualizations should show the *actual structure* of each space, not an analogy
for it.

---

## Standing design defaults

**Domain coloring for complex-valued representations:** when a design question
arises about how to encode a complex number visually — as a color, as a field, or
as a fourth dimension — default to the domain coloring convention: hue encodes
argument (angle), brightness encodes magnitude. This is an established
mathematical technique, not an invented one, and using it consistently means the
same visual language appears wherever complex values appear in the application.
Depart from it only when there is a specific reason to do so, and document the
reason.

---

## Polynomial Space (Pₙ)

### Core idea

Polynomials of degree ≤ n form a vector space. For P₂ (degree ≤ 2), the space is
three-dimensional: a polynomial a₀ + a₁x + a₂x² is fully described by the
coefficient triple (a₀, a₁, a₂), making P₂ isomorphic to R³.

The risk of showing only a coordinate system is that it looks indistinguishable
from R³ — the student sees axes and points and has no felt sense that they are
working in a *different* space. The risk of showing only a graph is the opposite
error: the graph is what the polynomial *evaluates to*, not what it *is*. The
polynomial-as-vector lives in coefficient space.

The design addresses this by showing both representations simultaneously, with
a live link between them.

### Dual-window layout

**Left window — coefficient space:**
A standard 3D (or 2D for P₁) coordinate system. The axes are labeled by the
basis elements: **1**, **x**, **x²** (not x, y, z). A movable selector — a
draggable point — lives in this space. Its position (a₀, a₁, a₂) is the
polynomial.

**Right window — functional graph:**
A standard x-y plot of the function f(x) = a₀ + a₁x + a₂x² corresponding to the
current selector position. Updates in real time as the selector moves.

The two windows are synchronized: dragging the selector in coefficient space
updates the graph immediately, and numeric inputs for (a₀, a₁, a₂) drive both.

### What this makes visible

- A point in the left window *is* the polynomial. The graph is a consequence —
  the evaluation map — not the object itself.
- Moving along the a₀ axis shifts the graph vertically. Moving along a₁ changes
  slope. Moving along a₂ adds or removes curvature. The geometric motion in
  coefficient space has a direct, readable effect in function space.
- The basis vectors {1, x, x²} can be shown as labeled coordinate-axis directions
  in the left window, with their graphs (a constant, a line through the origin, a
  parabola) shown alongside for reference — grounding the abstract basis in
  something concrete.

### Degenerate cases to surface explicitly

- If a₂ = 0: the point lies in the a₀–a₁ plane, and the graph is a line. The
  student is still in P₂ — the space includes lower-degree polynomials as special
  cases. This is worth making explicit in a callout rather than letting the
  coincidence pass silently.
- If a₁ = a₂ = 0: the polynomial is a constant function. The graph is a
  horizontal line.
- The zero polynomial (origin of coefficient space): graphs to the x-axis itself.

### Vector addition

**Left window:** two draggable points p and q in coefficient space, with their
sum p + q shown via a standard tip-to-tail construction. Color-coded: p in color
A, q in color B, p + q in a third neutral color.

**Right window:** three curves — f(x), g(x), and h(x) = f(x) + g(x) — in the
same three colors. The challenge is that three curves alone don't visually
communicate addition; without a construction to follow, the viewer just sees
three curves and has to take the relationship on faith.

**Proposed visual — vertical stacking indicators:**
At a set of evenly-spaced x-values (approximately 5–7), draw two stacked
vertical segments at each sample point:

- A segment from y = 0 up to y = f(x), in color A
- A segment from y = f(x) up to y = f(x) + g(x), in color B
- The tip of the second segment touches the sum curve h(x)

This makes pointwise addition visible: the eye sees, at each sampled x, that the
sum curve's height is literally the two contributions placed end to end. It is
the function-space analog of the tip-to-tail construction on the left — same
operation, each window showing it honestly in its own geometry.

The color correspondence between left and right reinforces that the same objects
are being combined in both views.

**Why not shaded areas:** filling between curves (0 to f, f to h) would also
show the stacking, but risks implying something about area or integration — a
different and unrelated operation. The discrete segment approach makes no such
claim.

**Interaction:** the indicators update in real time as either vector is dragged.
A toggle to hide them keeps the view from feeling cluttered once the concept is
understood.

### Scalar multiplication

**Left window:** a single draggable point p in coefficient space, with a scalar
slider c. The scaled point c·p is shown — it moves along the line through the
origin and p, which is the correct geometric picture of scalar multiplication.

**Right window:** two curves — f(x) and c·f(x) — in matching colors. The same
stacking indicator approach applies: at each sampled x-value, draw a segment
from 0 up to f(x), then a second segment from f(x) up to c·f(x), with the tip
touching the scaled curve.

The c < 0 case is worth foregrounding rather than treating as an edge case: the
second segment points downward, the scaled curve is a vertical reflection, and
the left window shows the point on the opposite side of the origin. This is a
natural demonstration of subtraction as scaling by −1, and of the full range of
what scalar multiplication means geometrically.

At c = 0: the scaled curve collapses to the x-axis, and the point in coefficient
space moves to the origin. Worth surfacing in a callout — this is the zero vector,
reachable by scalar multiplication.

### Polynomials over ℂ

When the underlying field is ℂ rather than ℝ, a polynomial p(z) = a₀ + a₁z + a₂z²
takes a complex input z and produces a complex output — a map ℂ → ℂ. The
coefficient space becomes ℂ³ (each aₙ is now complex), which as a real space is
6-dimensional and cannot be shown directly. Instead the split view foregrounds the
*evaluation* representation, where domain coloring makes the 4D input-output
relationship readable as a 2D image.

**Left side — coefficient controls:**
Three stacked Argand planes, one per coefficient (a₀, a₁, a₂). The user drags
each coefficient point in its mini-plane. This is honest about the structure: six
real degrees of freedom, presented as three complex ones.

**Right side — domain coloring of p(z):**
A grid of points in the complex input plane, each colored by the value of p(z) at
that point using the domain coloring convention: hue = arg(p(z)), brightness =
|p(z)|. The result is a colored 2D surface that encodes the full complex output
at every input simultaneously.

What this makes visible:
- **Zeros** of p appear as dark points (brightness → 0) with hue completing full
  rotations around them. A simple zero produces one full hue cycle; a double zero
  produces two. For a degree-2 polynomial the total number of hue-winds across all
  zeros equals 2 — a visual instance of the fundamental theorem of algebra.
- Changing a coefficient in the left panel deforms the coloring in real time,
  making the sensitivity of the polynomial to each coefficient tangible.
- When two zeros merge (a discriminant-zero configuration), the double hue-wind
  collapses into a single point — a degenerate case worth surfacing.

The right panel defaults to a **3D surface** where height = |p(z)| and color =
arg(p(z)). Zeros appear as wells descending to the floor — visually unambiguous
and immediately legible as something structurally significant. A toggle switches
to the flat 2D domain coloring for a cleaner read when the surface geometry
becomes noisy at high magnitudes or near poles.

### P₁ / P₂ toggle

A toggle switches between P₁ (2D coefficient space) and P₂ (3D coefficient
space), mirroring the R²/R³ toggle in the existing app. Default is P₂.

### Isomorphism with R³

The isomorphism between P₂ and R³ is shown as a side-by-side panel within the
left window: the same point displayed twice — once with axes labeled {1, x, x²}
(polynomial coordinates) and once with axes labeled {x, y, z} (standard R³
coordinates). The same draggable point drives both. This makes the structural
identity explicit while keeping the distinction in view: same point, different
meanings attached to the axes.

### Span and basis

Defaulting to the standard basis {1, x, x²}. No span representation in this
view — the card-level controls offer sufficient scope management and span in
function space is not a priority for this phase.

---

## Cross-space mappings via split view

The split view is well-suited to showing linear maps between vector spaces, where
the left panel shows the domain and the right shows the codomain. A draggable
vector in the domain drives its image in the codomain in real time. Three families
of examples, in increasing conceptual depth:

### 1. Maps between spaces of different dimensions

**Primary example — differentiation D: P₂ → P₁**

D(a₀ + a₁x + a₂x²) = a₁ + 2a₂x

Left panel: the 3D coefficient space of P₂, axes labeled {1, x, x²}. A draggable
point (a₀, a₁, a₂).

Right panel: the 2D coefficient space of P₁, axes labeled {1, x}. The image point
(a₁, 2a₂) updates in real time.

What this makes visible:
- The map is dimension-reducing (3D → 2D) in a motivated, non-arbitrary way.
- The kernel — constant polynomials, where a₁ = a₂ = 0 — appears as the full
  "1" axis in the left panel, an entire line collapsing to the origin. Dragging
  anywhere along it leaves the right panel fixed at the origin.
- The image is all of P₁: every linear polynomial is the derivative of something.
- Rank-nullity is directly visible: a 3D domain, a 1D kernel, a 2D image.

### 2. Invertible map between spaces with different bases

**Example — change of basis in R²**

Left panel: R² with the standard basis {e₁ = (1,0), e₂ = (0,1)}. A draggable
vector shown with its standard coordinates.

Right panel: R² with a user-adjustable non-standard basis {v₁, v₂}. The same
abstract vector shown with its coordinates in the new basis.

The invertible map is the change-of-basis matrix. Dragging the vector in either
panel updates the coordinates shown in the other. Adjusting v₁ or v₂ changes the
coordinate display without moving the abstract vector.

What this makes visible:
- Coordinates are a choice, not an intrinsic property of the vector.
- The abstract vector exists independently of either basis — it is the same object
  in both panels.
- When v₁ and v₂ are moved toward linear dependence, the basis degenerates and
  coordinates blow up — a natural demonstration of why basis vectors must be
  independent.

### 3. Isomorphism between structurally different spaces

**Example — R² ≅ P₁**

The map (a, b) ↦ a·1 + b·x is an isomorphism between the Cartesian plane and
the space of linear polynomials. Both are 2-dimensional; they share all vector
space structure.

Left panel: R² with the standard Cartesian plane and a draggable vector (a, b).

Right panel: P₁ with the dual-window layout (coefficient space + polynomial
graph). The corresponding polynomial a + bx updates in real time.

What this makes visible:
- Two spaces that look completely different are, as vector spaces, the same object.
  Every geometric fact on the left (subspaces, span, linear independence) has an
  exact counterpart on the right.
- The isomorphism is a *labeling* — it assigns meaning to structure that was
  already there.
- Subspaces correspond: the line through (1,0) in R² corresponds to constant
  polynomials; the line through (0,1) corresponds to polynomials with no constant
  term.
- This example pairs naturally with the polynomial isomorphism-with-R³ open
  question from the Pₙ section, and with the ℂ¹ ≅ R² note in the complex section.

---

## Complex Vector Space (ℂⁿ)

### Core idea

Complex vector spaces use ℂ (the complex numbers) as their scalar field. This
introduces two layers of structure: vectors have complex components, and scalars
are complex, meaning scalar multiplication can rotate as well as scale.

- **ℂ¹**: A one-dimensional complex vector space. Each vector is a single complex
  number z = a + bi. As a real vector space this is 2-dimensional, so ℂ¹ maps
  cleanly onto the complex plane (the Argand plane) — a familiar 2D picture.
- **ℂ²**: A two-dimensional complex vector space. Each vector is a pair (z₁, z₂),
  each component complex, requiring four real coordinates in total: (a₁, b₁, a₂, b₂).
  This cannot be drawn directly.

### Layout

**Left side — two stacked complex planes:**
Two 2D Argand planes stacked vertically, one per component. The upper plane shows
z₁ = (a₁, b₁); the lower shows z₂ = (a₂, b₂). A draggable point in each plane
sets that component. This is honest: it shows ℂ² as ℂ × ℂ — a pair of complex
numbers, each with its own plane — without pretending to render 4D directly.

**Right side — 2D plane with color as fourth dimension:**
A single 2D plane where:
- Position (x, y) encodes z₁ = (Re(z₁), Im(z₁))
- **Hue** encodes arg(z₂) — the argument (angle) of z₂
- **Brightness** encodes |z₂| — the magnitude of z₂

A vector in ℂ² appears as a single colored point. The encoding is geometrically
honest: hue is circular (wraps at 360°) and complex argument is circular (wraps
at 2π) — they are a natural match. This is adjacent to **domain coloring**, a
real technique used in complex analysis where hue and brightness encode a complex
output at each point of the plane. Using a known convention is preferable to
inventing a new one.

### Scalar multiplication

Complex scalar multiplication is richer than real: multiplying by c = ρe^(iθ)
scales by ρ *and* rotates by θ. This is the centerpiece demonstration for ℂⁿ.

**Controls:** a magnitude slider (ρ ≥ 0) and an angle control (θ ∈ [0, 2π]),
or alternatively real/imaginary inputs for c directly.

**Left side:** both points rotate by θ and scale by ρ in their respective planes,
simultaneously and in real time. The rotation is the key thing to see — it is
absent from real scalar multiplication entirely.

**Right side:** the same operation lands on the colored point in two perceptual
channels at once:
- The point rotates by θ and scales by ρ in the plane (z₁ component)
- The hue shifts by θ and the brightness scales by ρ (z₂ component)

The same scalar rotation θ is visible simultaneously as a spatial rotation and as
a hue shift. The same scale ρ is visible as spatial movement and as a brightness
change. Both perceptual dimensions respond to the same operation in parallel —
the color encoding earns its place here in a way it cannot for simpler spaces.

Notable values to foreground with callouts:
- c = i (θ = π/2, ρ = 1): pure rotation by 90°, no scaling; hue shifts a quarter
  turn; point traces a circle in each plane as θ increases
- |c| = 0: all components collapse to origin, color collapses to black (zero
  brightness encodes the zero vector)
- |c| = 1 (unit complex numbers): pure rotation — length is preserved, structure
  is transformed

### Vector addition

Addition in ℂ² is component-wise: (z₁, z₂) + (w₁, w₂) = (z₁ + w₁, z₂ + w₂).

**Left side:** standard tip-to-tail construction in each plane independently —
two simultaneous 2D additions, one per component. This reads cleanly.

**Right side:** the color encoding is less readable for addition. Hue does not
add the way position does; the color of the sum point is not a straightforward
blend of the two input colors. The right panel is weaker here and should not be
the primary teaching tool for addition — the left side carries that load. The
right panel is best reserved for scalar multiplication, where it is strongest.
This limitation is worth stating explicitly in the UI rather than hiding it.

### ℂ¹ view

ℂ¹ gets its own dedicated view before ℂ² is introduced. The rotation behavior of
complex scalar multiplication is already striking in one dimension and warrants
space on its own — absorbing it there makes the two-component ℂ² view much easier
to enter.

### Color legend

The right panel includes a persistent color legend: a circular hue ring encoding
argument (0 to 2π) and a brightness gradient encoding magnitude (0 to max). Both
are anchored to the panel and labeled. This is a usability necessity given that
the encoding is not self-evident to a newcomer.

### Unit circle

The unit circle is shown as a persistent, subtle reference line in each Argand
plane on the left side. It marks the set of complex numbers with |z| = 1 —
equivalently, the set of vectors preserved in magnitude under multiplication by
any unit complex scalar. It earns its place as a structural reference rather than
decoration.

All open questions in this section resolved — see Pₙ section for decisions on
toggle, isomorphism display, and span/basis scope.
