import type { PolyDeg } from '../types'
import styles from './PolyDegToggle.module.css'

interface PolyDegToggleProps {
  value: PolyDeg
  onChange: (d: PolyDeg) => void
}

export function PolyDegToggle({ value, onChange }: PolyDegToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Polynomial degree">
      <button
        className={`${styles.btn} ${value === 'p1' ? styles.active : ''}`}
        onClick={() => onChange('p1')}
        aria-pressed={value === 'p1'}
      >
        P₁
      </button>
      <button
        className={`${styles.btn} ${value === 'p2' ? styles.active : ''}`}
        onClick={() => onChange('p2')}
        aria-pressed={value === 'p2'}
      >
        P₂
      </button>
    </div>
  )
}
