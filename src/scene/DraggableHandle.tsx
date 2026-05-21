import { useRef, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3, Dim } from '../types'

interface DraggableHandleProps {
  position: Vec3
  onDrag: (newPosition: Vec3) => void
  color?: string
  radius?: number
  dim: Dim
}

export function DraggableHandle({
  position,
  onDrag,
  color = '#ffffff',
  radius = 0.15,
  dim,
}: DraggableHandleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera, gl, raycaster } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const dragPlane = useRef(new THREE.Plane())
  const offset = useRef(new THREE.Vector3())

  const getPointerNDC = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect()
      return new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      )
    },
    [gl],
  )

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setIsDragging(true)
      gl.domElement.setPointerCapture(e.pointerId)

      // Set up the drag plane perpendicular to camera
      const camDir = new THREE.Vector3()
      camera.getWorldDirection(camDir)
      dragPlane.current.setFromNormalAndCoplanarPoint(
        camDir,
        new THREE.Vector3(position[0], position[1], position[2]),
      )

      // Compute offset
      const ndc = getPointerNDC(e.clientX, e.clientY)
      raycaster.setFromCamera(ndc, camera)
      const hitPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane.current, hitPoint)
      offset.current.set(
        hitPoint.x - position[0],
        hitPoint.y - position[1],
        hitPoint.z - position[2],
      )
    },
    [camera, gl, position, raycaster, getPointerNDC],
  )

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging) return
      const ndc = getPointerNDC(e.clientX, e.clientY)
      raycaster.setFromCamera(ndc, camera)
      const hitPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane.current, hitPoint)
      hitPoint.sub(offset.current)

      let newPos: Vec3
      if (dim === '2d') {
        newPos = [hitPoint.x, hitPoint.y, 0]
      } else {
        newPos = [hitPoint.x, hitPoint.y, hitPoint.z]
      }
      onDrag(newPos)
    },
    [isDragging, camera, raycaster, onDrag, dim, getPointerNDC],
  )

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      setIsDragging(false)
      gl.domElement.releasePointerCapture(e.pointerId)
    },
    [gl],
  )

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={isDragging ? color : '#000000'}
        emissiveIntensity={isDragging ? 0.5 : 0}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}
