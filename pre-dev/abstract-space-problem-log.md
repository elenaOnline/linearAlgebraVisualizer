# Abstract Space Problem Log

Problems, edge cases, and open questions that arise during development of the
abstract vector space cards. Organized from most to least general.

---

## App-wide

- **Remove "arg" notation:** Any use of "arg" (as the complex angle function) in
  labels, callouts, axis annotations, or UI text should be replaced with "angle."
  Applies across all cards and any shared components that render complex-valued
  output. The term is unnecessarily opaque for the target audience.

---

## Affects many cards

- **Polynomial graph render distance (Cards 1, 2, 3, 4, 7):** All cards that
  render a polynomial curve must extend the curve well beyond the visible viewport
  bounds. The x-domain sampled for drawing should be significantly wider than the
  visible window so the graph never appears to end at the edge of the screen.
  Applies to both the real-axis function graph and any complex surface renderings
  that include a slice view.

- **Hue/brightness visual key (Cards 4, 9, 10, 11):** Every card that uses hue
  and brightness as encoding dimensions must include a persistent visual key
  showing what hue corresponds to what angle and what brightness corresponds to
  what magnitude. The key should label reference points (e.g. 0, π/2, π, 3π/2
  for angle; 0 and max for magnitude) and be anchored within its panel rather than
  floating. Without it the encoding is opaque to a first-time viewer.

---

## Affects multiple cards

- **Stacking indicators removed → shading (Cards 2, 3):** The vertical segment
  indicators at sample x-values add visual noise without aiding comprehension.
  Replace with shaded regions between curves. Note: the original design doc
  rejected shading on the grounds that it could imply integration — that concern
  is overridden here in favor of legibility. Shading should make clear it
  represents the additive or scalar contribution of each polynomial, not area.

- **Points rendered instead of vectors (Cards 4, 9):** Coefficient inputs in the
  Argand planes (Card 4) and the combined view in Card 9 render as points. Both
  should render as vectors — arrows from the origin to the point. Consistent with
  how vectors are displayed throughout the rest of the app.

---

## Card-specific

### Card 4 — Complex Polynomial

- **Surface and coloring render distance:** Both the 3D surface (height = |p(z)|,
  color = angle of p(z)) and the flat 2D domain coloring are not rendered far
  enough out. Extend the domain over which both representations are sampled so
  neither appears to end abruptly at a visible boundary.

- **Axis labels missing:** The complex input plane axes (Re and Im) and, in the
  3D surface view, the vertical magnitude axis should all be labeled. Currently
  unlabeled.

### Card 5 — Differentiation as a Linear Map

- **Add shared functional graph:** In addition to the two coefficient-space panels
  (3D P₂ on the left, 2D P₁ on the right), render both polynomials as curves on a
  single shared functional graph. The domain polynomial f(x) = a₀ + a₁x + a₂x²
  appears as a parabola; the codomain polynomial f′(x) = a₁ + 2a₂x appears as a
  line. On this shared graph the derivative line reads as tangent to the curve,
  giving a concrete geometric sense of what differentiation does — the map's output
  is visible not just as a point in an abstract coefficient space but as the
  geometric object that touches and tracks the original curve. Both curves update
  in real time as the domain point is dragged.

### Card 7 — Isomorphic Spaces

- **Space change: R² ≅ P₁ → R³ ≅ P₂.** Replace the R²/P₁ pairing with R³ and
  P₂. The isomorphism maps (a, b, c) ↦ a·1 + b·x + c·x². The left panel becomes
  a 3D Cartesian space with a draggable vector (a, b, c); the right panel shows P₂
  with the dual-window layout (3D coefficient space + functional graph), updating
  in real time as the left panel vector moves. Layout, synchronization behavior,
  and all other functionality are preserved.

### Card 9 — Vectors in Complex Space (ℂ²)

- **Combined view undersized:** The combined right-side view (position encodes z₁,
  hue/brightness encode z₂) renders too small and does not fill its panel. It
  should occupy the full available space of the right panel.

### Card 10 — Addition in Complex Space (ℂ²)

- **Grey out this tile.** The page does not have a clear or satisfying
  visualization and no fix has been identified. Render the gallery tile greyed out
  (visually disabled) to signal that it is not ready. Do not remove it from the
  registry — keep it as a placeholder — but do not link to a functional page until
  the design problem is resolved.
