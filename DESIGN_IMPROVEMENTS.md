# Technical Design — UX Improvements

## Issue 1 — Drag vs Orbit conflict in R3

**Root cause.** `OrbitControls` (drei) adds native DOM event listeners directly to `gl.domElement` (the canvas). `DraggableHandle` also adds native listeners via `setPointerCapture`. `e.stopPropagation()` only stops R3F's synthetic event system; it has no effect on OrbitControls' native DOM listeners. So both fire simultaneously during a drag.

**Fix.** Create `src/scene/DragContext.tsx` — a React context with `{ isDragging, setDragging }`. Wrap `Scene.tsx`'s outer div with `DragProvider`. In `Scene.tsx`, read `isDragging` and pass `enabled={!isDragging}` to OrbitControls. In `DraggableHandle.tsx`, call `setDragging(true/false)` on pointer down/up. React context propagates into R3F Canvas children normally.

## Issue 2 — NumberInput can't delete last digit

**Root cause.** `value={value}` makes it a fully controlled input. Deleting the last digit leaves `""`, `parseFloat("")` → `NaN`, so `onChange` is never called and the render resets the input.

**Fix.** Switch to local-string state. Maintain `localValue: string` and `focused: boolean`. When not focused, sync `localValue` from the `value` prop via `useEffect`. On change: always update `localValue`; if `""` call `onChange(0)`; if a valid number call `onChange(parsed)`; if partial (e.g. `"-"` or `"1."`) hold off. On blur: snap `localValue` back to `String(value)`.

## Issue 3 — 'space' kind invisible in R3

**Root cause.** `BackSide` on a large box is nearly invisible at low opacity.

**Fix.** Render two meshes for `kind='space'`:
1. Fill: `boxGeometry` with `DoubleSide`, translucent (opacity 0.07)
2. Outline: `EdgesGeometry` of the same box as `lineSegments`, same color, full opacity

This gives a clearly bounded translucent volume with a visible wireframe edge — honest (it's a viewport clip, not the actual boundary of R³) and visually distinct.

## Issue 4 — Shift+drag integer snapping

**Fix.** In `DraggableHandle.tsx`'s native `handleMove` listener, after computing `newPos`, check `e.shiftKey`. If true, round each component to `Math.round()`.

## Issue 5 — Integer sliders below input boxes

**Fix.** Add `showIntSlider?: boolean` (default `false`) to `NumberInput`. When `true`, render an `<input type="range" min="-20" max="20" step="1">` below the text input, clamped and synchronized with `value`. Enable this flag in `VectorInput.tsx` for all x/y/z components. Exclude from `MatrixInput` (too many entries) to avoid clutter.
