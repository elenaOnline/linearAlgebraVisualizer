/** [real, imaginary] — self-contained alias so this module stays dependency-free */
export type Complex = [number, number]

export const COMPLEX_ZERO: Complex = [0, 0]
export const COMPLEX_ONE: Complex = [1, 0]
export const COMPLEX_I: Complex = [0, 1]

export function complexAdd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]]
}

export function complexSub(a: Complex, b: Complex): Complex {
  return [a[0] - b[0], a[1] - b[1]]
}

export function complexMul(a: Complex, b: Complex): Complex {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
}

/** Multiply by a real scalar */
export function complexScale(z: Complex, r: number): Complex {
  return [z[0] * r, z[1] * r]
}

export function complexMag(z: Complex): number {
  return Math.sqrt(z[0] * z[0] + z[1] * z[1])
}

/** Principal argument in (-π, π] */
export function complexArg(z: Complex): number {
  return Math.atan2(z[1], z[0])
}

export function complexPolar(r: number, theta: number): Complex {
  return [r * Math.cos(theta), r * Math.sin(theta)]
}

export function complexConj(z: Complex): Complex {
  return [z[0], -z[1]]
}

/**
 * Evaluate a polynomial with complex coefficients at a complex point z.
 * coeffs[0] = a₀ (constant term), coeffs[k] = coefficient of zᵏ.
 * Uses Horner's method.
 */
export function evalComplexPoly(coeffs: Complex[], z: Complex): Complex {
  if (coeffs.length === 0) return [0, 0]
  let result: Complex = coeffs[coeffs.length - 1]
  for (let i = coeffs.length - 2; i >= 0; i--) {
    result = complexAdd(complexMul(result, z), coeffs[i])
  }
  return result
}
