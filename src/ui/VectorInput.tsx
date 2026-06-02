import type { Vec, Vec2, Vec3, Dim } from '../types'
import { NumberInput } from './NumberInput'
import styles from './VectorInput.module.css'

interface VectorInputProps {
  value: Vec
  onChange: (v: Vec) => void
  dim: Dim
  label?: string
}

export function VectorInput({ value, onChange, dim, label }: VectorInputProps) {
  const is3d = dim === '3d'

  const handleChange = (index: number, v: number) => {
    if (is3d) {
      const vec = value as Vec3
      const next: Vec3 = [vec[0], vec[1], vec[2]]
      next[index] = v
      onChange(next)
    } else {
      const vec = value as Vec2
      const next: Vec2 = [vec[0], vec[1]]
      next[index] = v
      onChange(next)
    }
  }

  return (
    <div className={styles.wrapper} role={label ? 'group' : undefined} aria-label={label}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.inputs}>
        <NumberInput
          value={value[0]}
          onChange={(v) => handleChange(0, v)}
          label="x"
          step={0.1}
          showIntSlider
        />
        <NumberInput
          value={value[1]}
          onChange={(v) => handleChange(1, v)}
          label="y"
          step={0.1}
          showIntSlider
        />
        {is3d && (
          <NumberInput
            value={(value as Vec3)[2]}
            onChange={(v) => handleChange(2, v)}
            label="z"
            step={0.1}
            showIntSlider
          />
        )}
      </div>
    </div>
  )
}
