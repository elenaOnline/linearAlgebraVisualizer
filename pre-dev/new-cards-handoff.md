# New Visualization Cards — Product Handoff

Eleven new cards for the abstract vector spaces phase. Each card is described
as a self-contained unit: what the user sees, what they can interact with, and
how the visualization responds. Cards are grouped by concept family but should
be treated as independent deliverables.

No architectural or technical decisions are made here. A separate technical
specification will handle implementation.

---

## Guiding principle

Every visualization shows the actual mathematical object, not a metaphor for it.
Where a space cannot be drawn directly (e.g. 4-dimensional spaces), the display
uses an honest combination of views that together describe it completely — not
a simplified stand-in. This principle should inform any ambiguous design
decisions during development.

---

## Card 1 — Polynomial Space

**What it demonstrates:** A polynomial of degree ≤ 2 is a vector. This card
shows what it means to treat polynomials as points in a coordinate space, and
how moving through that space changes the shape of the corresponding function.

### Layout

The screen is divided into two panels side by side.

**Left panel — coefficient space:**
A 3D coordinate system (or 2D when P₁ mode is active — see Controls). The three
axes are labeled **1**, **x**, and **x²** — not x, y, z. These labels are
essential: they name the basis of the polynomial space and distinguish it from
ordinary R³. A single draggable point sits in this space. Its position along
the three axes gives the coefficients (a₀, a₁, a₂) of the polynomial.

Below or beside the 3D view, a secondary side-by-side display shows the same
point in two labelings simultaneously: once with axes labeled {1, x, x²} and
once with axes labeled {x, y, z}. This makes the isomorphism between polynomial
space and R³ explicit — same point, different meanings attached to the axes.

**Right panel — polynomial graph:**
A standard x-y plot showing the graph of f(x) = a₀ + a₁x + a₂x².

### Controls

- **Draggable point** in the coefficient space. Dragging it updates the graph
  in real time.
- **Numeric inputs** for a₀, a₁, a₂ — editing any one moves the point and
  updates the graph.
- **P₁ / P₂ toggle** — switches between 2D coefficient space (P₁, one
  coefficient for x and one constant) and 3D coefficient space (P₂). Defaults
  to P₂.

### Special states to handle

- When a₂ = 0: the point is constrained to the a₀–a₁ plane; the graph is a
  straight line. A label or callout should note that this is still a valid
  polynomial in P₂ — the space includes lower-degree polynomials.
- When a₁ = a₂ = 0: the graph is a horizontal line (constant function).
- When the point is at the origin: the graph is the x-axis. This is the zero
  vector of the space.

---

## Card 2 — Polynomial Addition

**What it demonstrates:** Adding two polynomials is adding their coefficient
vectors. The sum is computed pointwise — at every x value, the sum curve's
height is the height of the two input curves combined.

### Layout

**Left panel — coefficient space:**
Two draggable points p and q in the same 3D coordinate space as Card 1 (axes
labeled 1, x, x²). Their vector sum p + q is shown using a tip-to-tail
construction, the same way vector addition is shown in R³. Each point and the
sum are in distinct colors: color A for p, color B for q, a neutral color for
p + q.

**Right panel — polynomial graph:**
Three curves: f(x) in color A, g(x) in color B, and h(x) = f(x) + g(x) in the
neutral color.

At a set of evenly spaced x-values (approximately 5–7 sample points across the
visible range), vertical stacking indicators are drawn:
- A segment from y = 0 up to y = f(x), in color A
- A segment from y = f(x) up to y = f(x) + g(x), in color B
- The top of the second segment touches the sum curve h(x)

These indicators make the pointwise nature of polynomial addition visible: at
each sampled x, the sum curve's height is the two contributions stacked end to
end. They are the function-space equivalent of the tip-to-tail construction
shown on the left.

### Controls

- **Two draggable points** in coefficient space, one for p and one for q.
- **Numeric inputs** for each polynomial's coefficients.
- **Toggle to show/hide stacking indicators** — for users who find them
  visually noisy once the concept is understood.
- **P₁ / P₂ toggle**, defaulting to P₂.

### Special states to handle

- When p + q = 0: the sum point is at the origin; the sum curve is the x-axis.
- When p and q are collinear with the origin: the sum lies on the same line;
  worth noting without special treatment.

---

## Card 3 — Polynomial Scalar Multiplication

**What it demonstrates:** Multiplying a polynomial by a real scalar scales all
its coefficients uniformly. In the graph view, this stretches or compresses the
curve vertically — and flips it when the scalar is negative.

### Layout

**Left panel — coefficient space:**
A single draggable point p in the 3D coefficient space (axes labeled 1, x, x²).
The scaled point c·p is shown simultaneously, connected to p by a line through
the origin. As c changes, the scaled point moves along this line.

**Right panel — polynomial graph:**
Two curves: f(x) in the original color, c·f(x) in a second color.

Vertical stacking indicators at the same sample x-values as Card 2:
- A segment from y = 0 to y = f(x)
- A segment from y = f(x) to y = c·f(x), with the tip touching the scaled curve

When c < 0 the second segment points downward, making the reflection visible
as a natural consequence of the indicator construction rather than a separate
explanation.

### Controls

- **Draggable point** for p in coefficient space.
- **Scalar slider** for c, ranging at minimum from −3 to 3 with the ability to
  type a value outside that range.
- **Numeric inputs** for the polynomial's coefficients.
- **Toggle to show/hide stacking indicators.**
- **P₁ / P₂ toggle**, defaulting to P₂.

### Special states to handle

- When c = 0: the scaled point is at the origin; the scaled curve is the
  x-axis. A callout should note this is the zero vector, reachable by scalar
  multiplication.
- When c = 1: the two curves are identical; no stacking indicators needed.
- When c < 0: the second stacking segment points downward; both the spatial
  flip in the left panel and the curve reflection in the right panel should
  be visible simultaneously.

---

## Card 4 — Complex Polynomial

**What it demonstrates:** When a polynomial's coefficients are complex numbers,
evaluating it at complex inputs produces a map from the complex plane to itself.
Domain coloring makes this four-dimensional relationship visible as a single
colored image.

### Layout

**Left panel — coefficient controls:**
Three stacked miniature Argand planes (complex planes), one per coefficient:
a₀ at the top, a₁ in the middle, a₂ at the bottom. Each plane has a draggable
point representing that coefficient's complex value. The axes of each mini-plane
are labeled Re and Im.

**Right panel — visualization of p(z):**
Default view: a **3D surface** over the complex input plane. The height at each
point z is |p(z)| (the magnitude of the output). The color at each point is
arg(p(z)) (the argument/angle of the output), encoded using the domain coloring
convention: hue represents angle (cycling through the full color wheel over 0
to 2π), brightness represents magnitude (brighter = larger).

A toggle switches this to a flat **2D domain coloring** view — the same color
encoding, displayed as a flat image rather than a surface, for a cleaner read
when the surface geometry becomes complex.

A **color legend** is anchored to the right panel: a circular hue ring labeled
with angles (0, π/2, π, 3π/2, 2π) and a brightness gradient labeled with
magnitude.

### Controls

- **Three draggable points**, one per Argand plane, setting each complex
  coefficient.
- **Numeric inputs** for the real and imaginary parts of each coefficient
  (Re(a₀), Im(a₀), Re(a₁), Im(a₁), Re(a₂), Im(a₂)).
- **3D surface / 2D coloring toggle**, defaulting to 3D surface.

### Special states to handle

- **Zeros of p(z):** wherever p(z) = 0, brightness collapses to zero (a dark
  point or well in the surface). Hue completes one full rotation around each
  simple zero, two full rotations around a double zero. A callout should note
  this behavior and its connection to the degree of the polynomial.
- **Double zero (discriminant = 0):** when two zeros merge, the double
  rotation collapses into a single point. This should be shown in real time as
  coefficients are adjusted.

---

## Card 5 — Differentiation as a Linear Map

**What it demonstrates:** The derivative is a linear map from the space of
degree-≤-2 polynomials to the space of degree-≤-1 polynomials. This card shows
that map in action: a 3D space on the left, a 2D space on the right, with a
draggable input driving its image in real time.

### Layout

**Left panel — P₂ (domain):**
The 3D coefficient space of P₂, axes labeled {1, x, x²}. A single draggable
point represents the input polynomial a₀ + a₁x + a₂x².

**Right panel — P₁ (codomain):**
The 2D coefficient space of P₁, axes labeled {1, x}. The image point — the
derivative a₁ + 2a₂x — updates in real time as the input point moves.

A line or highlighted region in the left panel shows the **kernel**: the set of
all input polynomials whose derivative is zero. This is the set of constant
polynomials, a₁ = a₂ = 0 — a line along the "1" axis. Dragging the input point
along this line should leave the right panel fixed at the origin.

### Controls

- **Draggable point** in the left panel.
- **Numeric inputs** for a₀, a₁, a₂.
- A **kernel indicator** (toggleable) highlighting the kernel line in the
  left panel.

### Special states to handle

- When the input is on the kernel line: the right panel shows the origin; a
  callout should note that constant polynomials have zero derivative.
- The image of the map is all of P₁ (every linear polynomial is the derivative
  of something). This surjectivity can be noted in a callout but does not
  require special visual treatment.

---

## Card 6 — Coordinates and Bases

**What it demonstrates:** The coordinates of a vector depend on the choice of
basis. This card shows the same abstract vector expressed in two different bases
simultaneously, making clear that the vector itself does not change when the
basis does — only its numerical description changes.

### Layout

**Left panel — standard basis:**
R² with the standard basis {e₁ = (1, 0), e₂ = (0, 1)}. A draggable vector is
shown with its coordinates in this basis.

**Right panel — custom basis:**
R² with a user-defined basis {v₁, v₂}. The same abstract vector is shown with
its coordinates expressed in this basis. The basis vectors v₁ and v₂ are
themselves draggable.

The vector's coordinates update in the right panel whenever the vector is moved
in the left panel, or whenever v₁ or v₂ are adjusted. Dragging the vector in
the right panel should also update the left panel (bidirectional sync).

### Controls

- **Draggable vector** (its tip) in either panel.
- **Draggable basis vectors** v₁ and v₂ in the right panel.
- **Numeric inputs** for the vector's components and for v₁, v₂.

### Special states to handle

- When v₁ and v₂ approach linear dependence: the coordinate representation
  in the right panel becomes unstable (coordinates grow very large or
  undefined). A warning callout should appear noting that a valid basis
  requires linearly independent vectors. The vector itself should remain
  visible and correct in the left panel.
- When v₁ and v₂ are exactly dependent: the right panel should display a
  clear "not a valid basis" state rather than showing erroneous numbers.

---

## Card 7 — Isomorphic Spaces

**What it demonstrates:** Two vector spaces that look completely different can
be structurally identical. This card shows R² and P₁ (the space of linear
polynomials) as two faces of the same abstract 2-dimensional vector space,
linked by an isomorphism.

### Layout

**Left panel — R²:**
The standard Cartesian plane. A draggable vector (a, b) shown as an arrow from
the origin.

**Right panel — P₁:**
A dual-window view showing the polynomial a + bx: a 2D coefficient space on
the left side of the panel (axes labeled {1, x}) and the polynomial's graph on
the right side. Both update as the vector in the left panel is dragged.

The correspondence is: the x-component of the vector maps to the coefficient of
x in the polynomial; the y-component maps to the constant term. This mapping
should be labeled clearly — e.g., (a, b) ↦ b·1 + a·x.

### Controls

- **Draggable vector** in the left panel.
- **Numeric inputs** for a and b.

### Special states to handle

- When the vector is on the x-axis (b = 0): the polynomial has no constant
  term; the graph passes through the origin.
- When the vector is on the y-axis (a = 0): the polynomial is a constant
  function.
- When the vector is at the origin: the polynomial is the zero polynomial;
  the graph is the x-axis.

---

## Card 8 — The Complex Plane

**What it demonstrates:** The complex numbers form a 1-dimensional complex
vector space. This card focuses on what complex scalar multiplication does that
real scalar multiplication cannot: it rotates as well as scales. This is the
conceptual foundation for the ℂ² cards that follow.

### Layout

A single Argand plane (complex plane) filling most of the screen. The
horizontal axis is the real axis (Re), the vertical axis is the imaginary axis
(Im). A **unit circle** is shown as a persistent reference line.

A draggable point represents a vector z in ℂ¹. A second draggable point
represents the scalar c. The product c·z is shown as a third point, with a
curved arc indicating the rotation angle and a line showing the scale change.

### Controls

- **Draggable point** for the vector z.
- **Draggable point** for the scalar c (alternatively, a magnitude slider
  and an angle slider for |c| and arg(c)).
- **Numeric inputs** for the real and imaginary parts of both z and c.

### Special states / callouts

- When |c| = 1 (c is on the unit circle): pure rotation, no scaling. The
  result has the same magnitude as z. Callout: "Unit complex scalars rotate
  without scaling."
- When c = i: rotation by exactly 90°. Callout: "Multiplying by i is a
  quarter-turn."
- When |c| = 0: the result is the origin regardless of z.
- As the angle of c is swept continuously, the result z' traces a circle
  around the origin — this continuous rotation should be visually apparent
  from dragging c around the unit circle.

---

## Card 9 — Vectors in Complex Space (ℂ²)

**What it demonstrates:** A vector in ℂ² is a pair of complex numbers. Because
four real dimensions are needed to describe it, no single geometric picture can
show it directly. This card uses two complementary views together: a component
view (two complex planes) and a combined view (position + color) that encodes
all four dimensions simultaneously.

### Layout

**Left side — two stacked Argand planes:**
Two complex planes arranged vertically. The upper plane shows the first
component z₁ = (Re(z₁), Im(z₁)); the lower plane shows the second component
z₂ = (Re(z₂), Im(z₂)). Each plane has a draggable point and is labeled with
its component name. A unit circle is shown in each plane.

**Right side — combined view:**
A single 2D plane where:
- The position of a point encodes z₁ (horizontal = Re(z₁), vertical = Im(z₁))
- The **hue** of the point encodes arg(z₂) — the angle of z₂ in the complex
  plane, following the domain coloring convention
- The **brightness** of the point encodes |z₂| — the magnitude of z₂

A color legend is anchored to this panel: a circular hue ring (labeled 0 to 2π)
and a brightness scale (labeled 0 to max magnitude).

All three displays — upper plane, lower plane, right panel — are synchronized.
Dragging a point in any view updates the others.

### Controls

- **Draggable points** in each Argand plane.
- **Numeric inputs** for Re(z₁), Im(z₁), Re(z₂), Im(z₂).

### Special states to handle

- When z₂ = 0: the point in the right panel has zero brightness (appears
  black) regardless of position. A callout should note that black encodes
  z₂ = 0, not the zero vector.
- When z₁ = z₂ = 0: the zero vector. The right panel point is at the origin
  and black.

---

## Card 10 — Addition in Complex Space (ℂ²)

**What it demonstrates:** Adding two vectors in ℂ² adds their components
independently — the first components add, and the second components add. This
card shows both additions simultaneously in the component view. The combined
view is present but is not the primary teaching tool for addition.

### Layout

**Left side — two stacked Argand planes:**
Each plane shows two vectors and their sum via a tip-to-tail construction —
the same construction used in R². Color A for the first vector's components,
color B for the second vector's components, a neutral color for the sum's
components. Both planes update together.

**Right side — combined view:**
Three colored points: one for each input vector and one for the sum. Because
hue does not add the way position does, the color of the sum point is not a
blend of the input colors. A callout should acknowledge this explicitly: "The
combined view is less readable for addition — the component planes on the left
are the primary display for this operation."

### Controls

- **Two draggable points per Argand plane** (four total) — one for each
  input vector's component.
- **Numeric inputs** for all four components of both vectors.

### Special states to handle

- When the two vectors are equal: the sum is exactly twice the first vector.
  Both planes show identical tip-to-tail constructions; the right panel shows
  the sum point at double the distance from the origin with the same hue.
- When the sum is the zero vector: all sum indicators point to the origin in
  both planes.

---

## Card 11 — Scalar Multiplication in Complex Space (ℂ²)

**What it demonstrates:** Multiplying a vector in ℂ² by a complex scalar
rotates and scales both components by the same amount. This is where the
combined view earns its place: the same rotation is simultaneously visible as
a spatial rotation in the component planes and as a hue shift in the combined
view.

### Layout

**Left side — two stacked Argand planes:**
A single draggable point in each plane representing the input vector's
components. The scaled result c·z is shown in each plane: the point rotates
by arg(c) and its distance from the origin scales by |c|. Both planes
transform simultaneously under the same scalar.

**Right side — combined view:**
The input vector as a colored point, and the scaled vector as a second colored
point. The spatial position rotates and scales (reflecting the z₁ component);
the hue shifts by arg(c) and the brightness scales by |c| (reflecting the z₂
component). The same scalar operation is visible in two perceptual channels
at once.

### Controls

- **Draggable point** in each Argand plane for the input vector.
- **Magnitude slider** for |c|, ranging from 0 to at least 3.
- **Angle control** for arg(c), ranging 0 to 2π. A draggable point on or
  near the unit circle in a small scalar display is an alternative to a
  slider.
- **Numeric inputs** for Re(c) and Im(c), and for the vector components.

### Special states / callouts

- When |c| = 1: pure rotation in both planes; the point traces a circle in
  each plane as arg(c) is swept. Hue shifts continuously; brightness is
  unchanged. Callout: "Unit complex scalars rotate without changing magnitude."
- When arg(c) = π/2 (c = i): each component rotates 90°; hue shifts a
  quarter of the way around the color wheel.
- When |c| = 0: both components collapse to the origin; brightness collapses
  to zero in the right panel.
- When c is a positive real number: no rotation, only scaling. Both planes
  scale outward; hue does not change; brightness scales.
