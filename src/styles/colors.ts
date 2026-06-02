/** Plate vector palette — mirrors the CSS custom properties in tokens.css.
 *  Use these constants for Three.js materials, which cannot read CSS variables. */

export const V1 = '#b14233' // vermilion — first basis vector / primary vector
export const V1_WASH = 'rgba(177,66,51,0.11)'
export const V1_EDGE = 'rgba(177,66,51,0.40)'

export const V2 = '#1f4a73' // prussian — second basis vector
export const V2_WASH = 'rgba(31,74,115,0.11)'
export const V2_EDGE = 'rgba(31,74,115,0.40)'

export const V3 = '#a07321' // ochre — third basis vector
export const V3_WASH = 'rgba(160,115,33,0.12)'
export const V3_EDGE = 'rgba(160,115,33,0.40)'

export const VP = '#3d5e2b' // forest — derived result / subspace
export const VP_WASH = 'rgba(61,94,43,0.12)'
export const VP_EDGE = 'rgba(61,94,43,0.42)'

export const INK = '#1f1f1c' // primary text / origin marker
export const INK_3 = '#7c7a72' // label color
export const BG = '#f2f1ef' // page surface

// Vector Spaces concept — needs 6 distinct colors for candidate, a, b, a+b, scalar, offset
export const CANDIDATE  = '#1abc9c' // teal   — candidate subspace
export const VEC_A      = '#e67e22' // orange — test vector a
export const VEC_B      = '#9b59b6' // purple — test vector b
export const VEC_SUM    = '#3498db' // blue   — a+b result
export const VEC_SCALAR = '#f1c40f' // yellow — scalar multiple c*a
export const OFFSET     = '#e94560' // red    — non-example offset marker
