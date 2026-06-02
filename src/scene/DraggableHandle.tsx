import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3, Dim } from '../types'
import { useDragContext } from './DragContext'

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
  const { camera, gl } = useThree()
  const { setDragging } = useDragContext()
  const [isDragging, setIsDragging] = useState(false)
  const dragPlane = useRef(new THREE.Plane())
  const offset = useRef(new THREE.Vector3())
  const raycasterRef = useRef(new THREE.Raycaster())
  // Stable refs so native listeners never close over stale values
  const onDragRef = useRef(onDrag)
  useEffect(() => { onDragRef.current = onDrag }, [onDrag])
  const dimRef = useRef(dim)
  useEffect(() => { dimRef.current = dim }, [dim])

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
      gl.domElement.setPointerCapture(e.pointerId)
      setIsDragging(true)
      setDragging(true) // disable OrbitControls for this scene

      const camDir = new THREE.Vector3()
      camera.getWorldDirection(camDir)
      dragPlane.current.setFromNormalAndCoplanarPoint(
        camDir,
        new THREE.Vector3(position[0], position[1], position[2]),
      )

      const ndc = getPointerNDC(e.clientX, e.clientY)
      raycasterRef.current.setFromCamera(ndc, camera)
      const hitPoint = new THREE.Vector3()
      raycasterRef.current.ray.intersectPlane(dragPlane.current, hitPoint)
      offset.current.set(
        hitPoint.x - position[0],
        hitPoint.y - position[1],
        hitPoint.z - position[2],
      )
    },
    [camera, gl, position, getPointerNDC, setDragging],
  )

  // Native canvas listeners: fire on every pointermove regardless of cursor position
  // (pointer is captured), so fast drags never lose the handle.
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent) => {
      const ndc = getPointerNDC(e.clientX, e.clientY)
      raycasterRef.current.setFromCamera(ndc, camera)
      const hitPoint = new THREE.Vector3()
      if (!raycasterRef.current.ray.intersectPlane(dragPlane.current, hitPoint)) return
      hitPoint.sub(offset.current)

      // Shift key → snap to nearest 0.25
      const snap = (v: number) => (e.shiftKey ? Math.round(v * 4) / 4 : v)

      const newPos: Vec3 =
        dimRef.current === '2d'
          ? [snap(hitPoint.x), snap(hitPoint.y), 0]
          : [snap(hitPoint.x), snap(hitPoint.y), snap(hitPoint.z)]
      onDragRef.current(newPos)
    }

    const handleUp = (e: PointerEvent) => {
      gl.domElement.releasePointerCapture(e.pointerId)
      setIsDragging(false)
      setDragging(false)
    }

    gl.domElement.addEventListener('pointermove', handleMove)
    gl.domElement.addEventListener('pointerup', handleUp)
    return () => {
      gl.domElement.removeEventListener('pointermove', handleMove)
      gl.domElement.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging, camera, gl, getPointerNDC, setDragging])

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={onPointerDown}
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
