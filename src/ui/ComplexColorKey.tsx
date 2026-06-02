import styles from './ComplexColorKey.module.css'

export function ComplexColorKey() {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <span className={styles.label}>Hue</span>
        <div className={styles.hueStrip}>
          <div className={styles.hueTick} style={{ left: '0%' }}>0</div>
          <div className={styles.hueTick} style={{ left: '25%' }}>π/2</div>
          <div className={styles.hueTick} style={{ left: '50%' }}>π</div>
          <div className={styles.hueTick} style={{ left: '75%' }}>3π/2</div>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>|z|</span>
        <div className={styles.brightnessStrip}>
          <span className={styles.bLabel}>0</span>
          <span className={styles.bLabel}>∞</span>
        </div>
      </div>
    </div>
  )
}
