import { useState, useEffect, useId } from 'react'
import styles from './NumberInput.module.css'

interface NumberInputProps {
  value: number
  onChange: (v: number) => void
  label?: string
  min?: number
  max?: number
  step?: number
  showIntSlider?: boolean
}

export function NumberInput({
  value,
  onChange,
  label,
  min,
  max,
  step = 0.1,
  showIntSlider = false,
}: NumberInputProps) {
  const id = useId()
  const [localValue, setLocalValue] = useState(String(value))
  const [focused, setFocused] = useState(false)

  // Sync external value → display when the input is not being edited.
  useEffect(() => {
    if (!focused) {
      setLocalValue(String(value))
    }
  }, [value, focused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalValue(raw)
    if (raw === '') {
      onChange(0)
    } else if (raw !== '-' && !raw.endsWith('.')) {
      const parsed = parseFloat(raw)
      if (!isNaN(parsed)) onChange(parsed)
    }
  }

  const handleBlur = () => {
    setFocused(false)
    // Normalize display to the settled number value.
    setLocalValue(String(value))
  }

  const sliderMin = -20
  const sliderMax = 20
  const sliderValue = Math.max(sliderMin, Math.min(sliderMax, Math.round(value)))

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input
        id={id}
        type="number"
        className={styles.input}
        value={localValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
      />
      {showIntSlider && (
        <input
          type="range"
          aria-label={label ? `${label} integer slider` : 'integer slider'}
          className={styles.intSlider}
          min={sliderMin}
          max={sliderMax}
          step={1}
          value={sliderValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        />
      )}
    </div>
  )
}
