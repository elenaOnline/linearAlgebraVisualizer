# Linear Algebra Visualizer

An interactive browser-based visualizer for core linear algebra concepts. Every visualization is computed and rendered live in the browser — no pre-made images or video. Variables update the scene in real time.

## Concepts

**Classical linear algebra (R² / R³)**

| Concept | What you can explore |
|---|---|
| Vectors | Components, addition, scalar multiplication |
| Vector spaces | Candidate subspaces and the closure axioms |
| Span | How a set of vectors fills out a subspace |
| Basis | Independence and spanning via direct manipulation |
| Dimension | How rank changes as vectors become dependent |
| Linear maps | Matrix transformations and their geometric effect |
| Nullspace | The kernel of a linear map as a draggable subspace |

**Abstract vector spaces**

| Concept | What you can explore |
|---|---|
| Polynomial space | P₂ as a vector space; the graph updates as you edit coefficients |
| Polynomial addition | f + g visualized as graph arithmetic |
| Polynomial scalar multiplication | c·f as vertical stretch/flip with shaded area |
| Complex polynomial | Degree-2 polynomial with complex coefficients; domain coloring in 2D, magnitude surface in 3D |
| Differentiation | The derivative as a linear map from P₂ to P₁, with f and f′ graphed |
| Coordinates | Coordinate vectors relative to a basis |
| Isomorphism | R³ ≅ P₂: the structural equivalence made concrete |
| Complex plane | Complex numbers as vectors; rotation and scaling |
| Complex vectors | ℂ² vectors; position encodes z₁, color encodes z₂ |
| Complex scalar multiplication | Component-wise multiplication as rotation + scaling in ℂ |

## Setup

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
```

## Commands

```bash
npm run dev        # development server with hot reload
npm run build      # type-check + production build
npm run test       # run the Vitest suite (334 tests)
npm run lint       # ESLint; exits 0 on a clean pass
npm run preview    # preview the production build locally
```

## Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** — build tool and dev server
- **Three.js** via `@react-three/fiber` and `@react-three/drei` — all 3D rendering
- **Zustand** — per-concept isolated state stores
- **KaTeX** — math notation in explanation panels
- **Vitest** — unit tests for all math and geometry functions

## Architecture

```
src/
  linalg/          # pure math core (vectors, matrices, subspaces, complex arithmetic)
  scene/           # shared Three.js primitives (axes, grid, arrows, handles, meshes)
  ui/              # shared 2D controls (inputs, sliders, panels, callouts)
  concepts/        # one self-contained folder per concept
    registry.ts    # ordered list of all concepts — add one entry to register a new one
  routes/          # Home gallery + ConceptPage shell
  styles/          # design tokens and global CSS
```

All mathematics lives in pure, unit-tested functions (`src/linalg/` and each concept's `geometry.ts`). React/Three components are a thin rendering layer — they take already-computed geometry and draw it, with no math of their own.

Adding a new concept means creating one folder under `src/concepts/` and adding one line to `registry.ts`.
