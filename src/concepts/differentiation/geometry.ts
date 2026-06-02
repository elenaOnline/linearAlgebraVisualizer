import { EPS } from '../../linalg/vector'

export interface DifferentiationGeo {
  input: [number, number, number]   // [a0, a1, a2]
  image: [number, number]           // [a1, 2*a2] — derivative coefficients
  onKernel: boolean                 // |a1| < EPS && |a2| < EPS
  fPoints: [number, number][]       // 200 samples of f(x) = a0 + a1*x + a2*x² over [-10, 10]
  dfPoints: [number, number][]      // 200 samples of f′(x) = a1 + 2*a2*x over [-10, 10]
}

const GRAPH_SAMPLES = 200
const X_MIN = -10
const X_MAX = 10

/**
 * Sample f(x) = a0 + a1*x + a2*x² at GRAPH_SAMPLES points over [X_MIN, X_MAX].
 */
function samplePolynomial(
  a0: number,
  a1: number,
  a2: number,
): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= GRAPH_SAMPLES; i++) {
    const x = X_MIN + (i / GRAPH_SAMPLES) * (X_MAX - X_MIN)
    const y = a0 + a1 * x + a2 * x * x
    pts.push([x, y])
  }
  return pts
}

/**
 * Sample f′(x) = a1 + 2*a2*x at GRAPH_SAMPLES points over [X_MIN, X_MAX].
 */
function sampleDerivative(
  a1: number,
  a2: number,
): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= GRAPH_SAMPLES; i++) {
    const x = X_MIN + (i / GRAPH_SAMPLES) * (X_MAX - X_MIN)
    const y = a1 + 2 * a2 * x
    pts.push([x, y])
  }
  return pts
}

/**
 * Compute the geometry for the Differentiation concept.
 * D(a0 + a1*x + a2*x²) = a1 + 2*a2*x
 * The derivative maps P₂ to P₁ linearly.
 * The kernel consists of all constant polynomials (a1=0, a2=0).
 */
export function computeDifferentiationGeo(
  a0: number,
  a1: number,
  a2: number,
): DifferentiationGeo {
  return {
    input: [a0, a1, a2],
    image: [a1, 2 * a2],
    onKernel: Math.abs(a1) < EPS && Math.abs(a2) < EPS,
    fPoints: samplePolynomial(a0, a1, a2),
    dfPoints: sampleDerivative(a1, a2),
  }
}
