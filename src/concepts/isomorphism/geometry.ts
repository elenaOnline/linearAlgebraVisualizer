const EPS = 1e-9

export interface IsomorphismGeo {
  vec: [number, number]                    // (a, b)
  polyCoeffs: [number, number]             // [b, a] — [constant term, x coefficient]
  graphPoints: Array<[number, number]>     // (x, f(x)) for f(x) = b + a*x
  isZero: boolean      // |a| < EPS && |b| < EPS
  bIsZero: boolean     // |b| < EPS — no constant term, graph through origin
  aIsZero: boolean     // |a| < EPS — constant function
}

/**
 * Compute the geometry for the Isomorphism concept.
 * The isomorphism φ: R² → P₁ is defined by φ(a, b) = b·1 + a·x = b + a·x.
 * - vec = (a, b) lives in R²
 * - polyCoeffs = [b, a] in P₁ coefficient space (constant term first)
 * - graphPoints samples f(x) = b + a·x at 200 evenly-spaced x in [xMin, xMax]
 */
export function computeIsomorphismGeo(
  a: number,
  b: number,
  xMin = -4,
  xMax = 4,
): IsomorphismGeo {
  const SAMPLES = 200
  const graphPoints: Array<[number, number]> = []
  for (let i = 0; i <= SAMPLES; i++) {
    const x = xMin + (i / SAMPLES) * (xMax - xMin)
    const y = b + a * x
    graphPoints.push([x, y])
  }

  return {
    vec: [a, b],
    polyCoeffs: [b, a],
    graphPoints,
    isZero: Math.abs(a) < EPS && Math.abs(b) < EPS,
    bIsZero: Math.abs(b) < EPS,
    aIsZero: Math.abs(a) < EPS,
  }
}
