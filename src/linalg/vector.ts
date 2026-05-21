import type { Vec, Vec2, Vec3 } from '../types'

/** Single shared tolerance — use for all zero/independence decisions */
export const EPS = 1e-9

/** Pad a Vec2 to Vec3 by appending z=0; Vec3 passes through unchanged */
export function toVec3(v: Vec): Vec3 {
  if (v.length === 3) return v as Vec3
  return [v[0], v[1], 0]
}

/** Component-wise addition */
export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

/** Component-wise subtraction */
export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

/** Scalar multiplication */
export function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}

/** Dot product */
export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/** Cross product (3D only) */
export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

/** Euclidean norm */
export function norm(v: Vec3): number {
  return Math.sqrt(dot(v, v))
}

/** Unit vector; returns zero vector if input is zero */
export function normalize(v: Vec3): Vec3 {
  const n = norm(v)
  if (n < EPS) return [0, 0, 0]
  return scale(v, 1 / n)
}

/** Linear interpolation component-wise */
export function lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Returns true when every component is within EPS of zero */
export function isZero(v: Vec2 | Vec3, eps = EPS): boolean {
  for (const c of v) {
    if (Math.abs(c) > eps) return false
  }
  return true
}
