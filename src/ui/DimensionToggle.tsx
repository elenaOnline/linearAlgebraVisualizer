import type { Dim } from '../types'
import styles from './DimensionToggle.module.css'

interface DimensionToggleProps {
  value: Dim
  onChange: (d: Dim) => void
}

export function DimensionToggle({ value, onChange }: DimensionToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Dimension">
      <button
        className={`${styles.btn} ${value === '2d' ? styles.active : ''}`}
        onClick={() => onChange('2d')}
        aria-pressed={value === '2d'}
      >
        R²
      </button>
      <button
        className={`${styles.btn} ${value === '3d' ? styles.active : ''}`}
        onClick={() => onChange('3d')}
        aria-pressed={value === '3d'}
      >
        R³
      </button>
    </div>
  )
}
