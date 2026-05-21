import type { ComponentType } from 'react'

export type Dim = '2d' | '3d'
export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec = Vec2 | Vec3
export type Mat2x2 = [[number, number], [number, number]]
export type Mat3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
]
export type Mat = Mat2x2 | Mat3x3

export interface ConceptMeta {
  id: string
  title: string
  blurb: string
  supports: ('2d' | '3d')[]
  Component: ComponentType
  Thumbnail: ComponentType
}

export type SubspaceKind = 'point' | 'line' | 'plane' | 'space'

export interface SubspaceGeometry {
  kind: SubspaceKind
  /** For 'line': one direction vector; for 'plane': two direction vectors (basis) */
  directions?: Vec3[]
}
