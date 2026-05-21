import type { Mat, Mat2x2, Mat3x3, Dim } from '../types'
import { NumberInput } from './NumberInput'
import styles from './MatrixInput.module.css'

interface MatrixInputProps {
  value: Mat
  onChange: (m: Mat) => void
  dim: Dim
  label?: string
}

export function MatrixInput({ value, onChange, dim, label }: MatrixInputProps) {
  const size = dim === '2d' ? 2 : 3

  const handleChange = (row: number, col: number, v: number) => {
    if (size === 2) {
      const m = value as Mat2x2
      const next: Mat2x2 = [
        [m[0][0], m[0][1]],
        [m[1][0], m[1][1]],
      ]
      next[row][col] = v
      onChange(next)
    } else {
      const m = value as Mat3x3
      const next: Mat3x3 = [
        [m[0][0], m[0][1], m[0][2]],
        [m[1][0], m[1][1], m[1][2]],
        [m[2][0], m[2][1], m[2][2]],
      ]
      next[row][col] = v
      onChange(next)
    }
  }

  return (
    <div className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size }, (_, row) =>
          Array.from({ length: size }, (_, col) => (
            <NumberInput
              key={`${row}-${col}`}
              value={(value as number[][])[row][col]}
              onChange={(v) => handleChange(row, col, v)}
              step={0.1}
            />
          )),
        )}
      </div>
    </div>
  )
}
