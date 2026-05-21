import styles from './Slider.module.css'

interface SliderProps {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label?: string
}

export function Slider({ value, onChange, min, max, step = 0.01, label }: SliderProps) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.header}>
          <label className={styles.label}>{label}</label>
          <span className={styles.value}>{value.toFixed(2)}</span>
        </div>
      )}
      <input
        type="range"
        className={styles.slider}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}
