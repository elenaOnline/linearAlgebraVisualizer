import styles from './NumberInput.module.css'

interface NumberInputProps {
  value: number
  onChange: (v: number) => void
  label?: string
  min?: number
  max?: number
  step?: number
}

export function NumberInput({ value, onChange, label, min, max, step = 0.1 }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value)
    if (!isNaN(parsed)) {
      onChange(parsed)
    }
  }

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="number"
        className={styles.input}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}
