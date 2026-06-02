import { describe, it, expect } from 'vitest'
import {
  complexAdd,
  complexSub,
  complexMul,
  complexScale,
  complexMag,
  complexArg,
  complexPolar,
  complexConj,
  evalComplexPoly,
  COMPLEX_ZERO,
  COMPLEX_ONE,
  COMPLEX_I,
  type Complex,
} from './complex'

const EPS = 1e-9

function near(a: number, b: number, eps = EPS) {
  return Math.abs(a - b) < eps
}

function nearC(a: Complex, b: Complex, eps = EPS) {
  return near(a[0], b[0], eps) && near(a[1], b[1], eps)
}

describe('complexAdd', () => {
  it('zero identity: a + 0 = a', () => {
    const a: Complex = [3, 4]
    expect(nearC(complexAdd(a, COMPLEX_ZERO), a)).toBe(true)
  })

  it('commutativity: a + b = b + a', () => {
    const a: Complex = [1, 2]
    const b: Complex = [3, -1]
    expect(nearC(complexAdd(a, b), complexAdd(b, a))).toBe(true)
  })

  it('adds real and imaginary parts independently', () => {
    expect(nearC(complexAdd([1, 2], [3, 4]), [4, 6])).toBe(true)
  })
})

describe('complexSub', () => {
  it('a - a = 0', () => {
    const a: Complex = [2, 5]
    expect(nearC(complexSub(a, a), COMPLEX_ZERO)).toBe(true)
  })

  it('a - 0 = a', () => {
    const a: Complex = [2, 5]
    expect(nearC(complexSub(a, COMPLEX_ZERO), a)).toBe(true)
  })
})

describe('complexMul', () => {
  it('i * i = -1', () => {
    expect(nearC(complexMul(COMPLEX_I, COMPLEX_I), [-1, 0])).toBe(true)
  })

  it('1 * z = z', () => {
    const z: Complex = [3, 7]
    expect(nearC(complexMul(COMPLEX_ONE, z), z)).toBe(true)
  })

  it('(0,1) * (0,1) = (-1,0)', () => {
    expect(nearC(complexMul([0, 1], [0, 1]), [-1, 0])).toBe(true)
  })

  it('(1,1) * (1,-1) = 2 (real part only)', () => {
    expect(nearC(complexMul([1, 1], [1, -1]), [2, 0])).toBe(true)
  })

  it('commutativity', () => {
    const a: Complex = [2, 3]
    const b: Complex = [-1, 4]
    expect(nearC(complexMul(a, b), complexMul(b, a))).toBe(true)
  })
})

describe('complexScale', () => {
  it('scale by 0 gives zero', () => {
    expect(nearC(complexScale([5, 3], 0), COMPLEX_ZERO)).toBe(true)
  })

  it('scale by 1 is identity', () => {
    const z: Complex = [5, 3]
    expect(nearC(complexScale(z, 1), z)).toBe(true)
  })

  it('scale by -1 negates', () => {
    expect(nearC(complexScale([5, 3], -1), [-5, -3])).toBe(true)
  })
})

describe('complexMag', () => {
  it('|(3,4)| = 5', () => {
    expect(near(complexMag([3, 4]), 5)).toBe(true)
  })

  it('|0| = 0', () => {
    expect(near(complexMag(COMPLEX_ZERO), 0)).toBe(true)
  })

  it('|1| = 1', () => {
    expect(near(complexMag(COMPLEX_ONE), 1)).toBe(true)
  })

  it('|i| = 1', () => {
    expect(near(complexMag(COMPLEX_I), 1)).toBe(true)
  })
})

describe('complexArg', () => {
  it('arg(1, 0) = 0', () => {
    expect(near(complexArg([1, 0]), 0)).toBe(true)
  })

  it('arg(0, 1) = π/2', () => {
    expect(near(complexArg([0, 1]), Math.PI / 2)).toBe(true)
  })

  it('arg(-1, 0) = ±π', () => {
    expect(near(Math.abs(complexArg([-1, 0])), Math.PI)).toBe(true)
  })

  it('arg(0, -1) = -π/2', () => {
    expect(near(complexArg([0, -1]), -Math.PI / 2)).toBe(true)
  })
})

describe('complexPolar', () => {
  it('round-trip with complexArg and complexMag', () => {
    const z: Complex = [3, 4]
    const r = complexMag(z)
    const theta = complexArg(z)
    expect(nearC(complexPolar(r, theta), z, 1e-6)).toBe(true)
  })

  it('unit circle at angle π/2 gives i', () => {
    expect(nearC(complexPolar(1, Math.PI / 2), [0, 1], 1e-6)).toBe(true)
  })

  it('r=0 gives zero', () => {
    expect(nearC(complexPolar(0, 1.23), COMPLEX_ZERO)).toBe(true)
  })
})

describe('complexConj', () => {
  it('conj(a+bi) = a-bi', () => {
    expect(nearC(complexConj([3, 4]), [3, -4])).toBe(true)
  })

  it('z * conj(z) is real and equals |z|²', () => {
    const z: Complex = [3, 4]
    const product = complexMul(z, complexConj(z))
    expect(near(product[1], 0)).toBe(true)
    expect(near(product[0], 25)).toBe(true)
  })
})

describe('evalComplexPoly', () => {
  it('degree-0 constant returns that constant', () => {
    const c: Complex = [5, 2]
    const z: Complex = [3, -1]
    expect(nearC(evalComplexPoly([c], z), c)).toBe(true)
  })

  it('degree-1: a0 + a1*z', () => {
    // p(z) = 1 + 2z, evaluated at z = i: 1 + 2i
    const coeffs: Complex[] = [[1, 0], [2, 0]]
    expect(nearC(evalComplexPoly(coeffs, [0, 1]), [1, 2])).toBe(true)
  })

  it('degree-2: z² - 1 has zeros at ±1', () => {
    // p(z) = -1 + 0*z + 1*z²
    const coeffs: Complex[] = [[-1, 0], [0, 0], [1, 0]]
    expect(nearC(evalComplexPoly(coeffs, [1, 0]), COMPLEX_ZERO, 1e-6)).toBe(true)
    expect(nearC(evalComplexPoly(coeffs, [-1, 0]), COMPLEX_ZERO, 1e-6)).toBe(true)
  })

  it('degree-2: z² + 1 has zeros at ±i', () => {
    // p(z) = 1 + 0*z + 1*z²
    const coeffs: Complex[] = [[1, 0], [0, 0], [1, 0]]
    expect(nearC(evalComplexPoly(coeffs, [0, 1]), COMPLEX_ZERO, 1e-6)).toBe(true)
    expect(nearC(evalComplexPoly(coeffs, [0, -1]), COMPLEX_ZERO, 1e-6)).toBe(true)
  })

  it('empty coeffs returns zero', () => {
    expect(nearC(evalComplexPoly([], [1, 2]), COMPLEX_ZERO)).toBe(true)
  })

  it('degree-2 at origin equals constant term', () => {
    const coeffs: Complex[] = [[3, 5], [1, 0], [2, 0]]
    expect(nearC(evalComplexPoly(coeffs, COMPLEX_ZERO), [3, 5])).toBe(true)
  })
})
