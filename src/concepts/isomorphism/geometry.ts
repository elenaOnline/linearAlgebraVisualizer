const EPS = 1e-9

export interface IsomorphismGeo {
  vec: [number, number, number]              // (a, b, c)
  polyCoeffs: [number, number, number]       // [a, b, c] — coefficients of 1, x, x²
  graphPoints: Array<[number, number]>       // (x, f(x)) for f(x) = a + b*x + c*x²
  isZero: boolean      // |a| < EPS && |b| < EPS && |c| < EPS
  bIsZero: boolean     // |b| < EPS — no x term
  aIsZero: boolean     // |a| < EPS — no constant term
  cIsZero: boolean     // |c| < EPS — no x² term
}

/**
 * Compute the geometry for the Isomorphism concept.
 * The isomorphism φ: R³ → P₂ is defined by φ(a, b, c) = a·1 + b·x + c·x².
 * - vec = (a, b, c) lives in R³
 * - polyCoeffs = [a, b, c] in P₂ coefficient space (constant, x, x² terms)
 * - graphPoints samples f(x) = a + b·x + c·x² at 200 evenly-spaced x in [xMin, xMax]
 */
export function computeIsomorphismGeo(
  a: number,
  b: number,
  c: number,
  xMin = -10,
  xMax = 10,
): IsomorphismGeo {
  const SAMPLES = 200
  const graphPoints: Array<[number, number]> = []
  for (let i = 0; i <= SAMPLES; i++) {
    const x = xMin + (i / SAMPLES) * (xMax - xMin)
    const y = a + b * x + c * x * x
    graphPoints.push([x, y])
  }

  return {
    vec: [a, b, c],
    polyCoeffs: [a, b, c],
    graphPoints,
    isZero: Math.abs(a) < EPS && Math.abs(b) < EPS && Math.abs(c) < EPS,
    bIsZero: Math.abs(b) < EPS,
    aIsZero: Math.abs(a) < EPS,
    cIsZero: Math.abs(c) < EPS,
  }
}
