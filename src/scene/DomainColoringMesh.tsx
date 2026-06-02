import { useMemo } from 'react'
import * as THREE from 'three'
import type { Complex } from '../types'
import { complexArg, complexMag } from '../linalg/complex'

interface DomainColoringBounds {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

interface DomainColoringMeshProps {
  fn: (z: Complex) => Complex
  bounds: DomainColoringBounds
  resolution?: number
  mode: '2d' | '3d'
}

/** HSL → RGB, all values in [0,1]. Returns [r,g,b] each in [0,255]. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = ((h % 1) + 1) % 1  // wrap h to [0,1)
  const x = c * (1 - Math.abs(((hp * 6) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (hp < 1 / 6) { r = c; g = x; b = 0 }
  else if (hp < 2 / 6) { r = x; g = c; b = 0 }
  else if (hp < 3 / 6) { r = 0; g = c; b = x }
  else if (hp < 4 / 6) { r = 0; g = x; b = c }
  else if (hp < 5 / 6) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

/** Map magnitude to lightness: 0→0.1, large→0.9 via sigmoid-like curve */
function magToLightness(mag: number): number {
  return 0.1 + 0.8 * (mag / (1 + mag))
}

interface ComputedData {
  pixels: Uint8Array
  heights: Float32Array | null
  resolution: number
}

function computeColorData(
  fn: (z: Complex) => Complex,
  bounds: DomainColoringBounds,
  resolution: number,
  includeHeights: boolean,
): ComputedData {
  const { xMin, xMax, yMin, yMax } = bounds
  const N = resolution
  const pixels = new Uint8Array(N * N * 4)
  const heights = includeHeights ? new Float32Array(N * N) : null

  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const x = xMin + (col / (N - 1)) * (xMax - xMin)
      const y = yMin + (row / (N - 1)) * (yMax - yMin)
      const w = fn([x, y])
      const arg = complexArg(w)
      const mag = complexMag(w)

      // Hue from arg: shift from (-π,π] to [0,1)
      const hue = (arg + Math.PI) / (2 * Math.PI)
      const lightness = magToLightness(mag)
      const [r, g, b] = hslToRgb(hue, 0.85, lightness)

      const idx = (row * N + col) * 4
      pixels[idx] = r
      pixels[idx + 1] = g
      pixels[idx + 2] = b
      pixels[idx + 3] = 255

      if (heights) {
        heights[row * N + col] = Math.min(mag, 3)
      }
    }
  }

  return { pixels, heights, resolution: N }
}

function Flat2D({
  data,
  bounds,
}: {
  data: ComputedData
  bounds: DomainColoringBounds
}) {
  const { pixels, resolution } = data
  const { xMin, xMax, yMin, yMax } = bounds

  const texture = useMemo(() => {
    const tex = // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new THREE.DataTexture(pixels as any, resolution, resolution, THREE.RGBAFormat)
    tex.needsUpdate = true
    return tex
  }, [pixels, resolution])

  const cx = (xMin + xMax) / 2
  const cy = (yMin + yMax) / 2
  const w = xMax - xMin
  const h = yMax - yMin

  return (
    <mesh position={[cx, cy, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function HeightSurface({
  data,
  bounds,
}: {
  data: ComputedData
  bounds: DomainColoringBounds
}) {
  const { pixels, heights, resolution } = data
  const { xMin, xMax, yMin, yMax } = bounds

  const { geometry, texture } = useMemo(() => {
    const N = resolution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tex = new THREE.DataTexture(pixels as any, N, N, THREE.RGBAFormat)
    tex.needsUpdate = true

    const posArr = new Float32Array(N * N * 3)
    const uvArr = new Float32Array(N * N * 2)
    const idxArr: number[] = []

    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        const x = xMin + (col / (N - 1)) * (xMax - xMin)
        const y = yMin + (row / (N - 1)) * (yMax - yMin)
        const z = heights ? heights[row * N + col] : 0
        const vi = (row * N + col) * 3
        posArr[vi] = x
        posArr[vi + 1] = y
        posArr[vi + 2] = z
        const ui = (row * N + col) * 2
        uvArr[ui] = col / (N - 1)
        uvArr[ui + 1] = row / (N - 1)
      }
    }

    for (let row = 0; row < N - 1; row++) {
      for (let col = 0; col < N - 1; col++) {
        const a = row * N + col
        const b = row * N + col + 1
        const c = (row + 1) * N + col
        const d = (row + 1) * N + col + 1
        idxArr.push(a, b, c, b, d, c)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3))
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2))
    geom.setIndex(idxArr)

    return { geometry: geom, texture: tex }
  }, [pixels, heights, resolution, xMin, xMax, yMin, yMax])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function DomainColoringMesh({
  fn,
  bounds,
  resolution = 256,
  mode,
}: DomainColoringMeshProps) {
  const data = useMemo(
    () => computeColorData(fn, bounds, resolution, mode === '3d'),
    [fn, bounds, resolution, mode],
  )

  if (mode === '2d') {
    return <Flat2D data={data} bounds={bounds} />
  }
  return <HeightSurface data={data} bounds={bounds} />
}
