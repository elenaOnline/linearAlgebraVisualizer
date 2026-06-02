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
            color: 'var(--ink)',
            fontFamily: 'var(--font-math)',
            fontStyle: 'italic',
            fontSize: '13px',
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            background: 'rgba(242, 241, 239, 0.88)',
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
