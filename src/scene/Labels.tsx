import { Html } from '@react-three/drei'
import type { Vec3 } from '../types'

interface LabelItem {
  position: Vec3
  text: string
}

interface LabelsProps {
  items: LabelItem[]
}

export function Labels({ items }: LabelsProps) {
  return (
    <>
      {items.map((item, i) => (
        <Html
          key={i}
          position={item.position}
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            background: 'rgba(22, 33, 62, 0.7)',
            padding: '2px 6px',
            borderRadius: '3px',
          }}
        >
          {item.text}
        </Html>
      ))}
    </>
  )
}
