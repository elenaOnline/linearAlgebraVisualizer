import type { ReactNode } from 'react'
import styles from './Panel.module.css'

interface PanelProps {
  eyebrow?: string
  title?: string
  children: ReactNode
  className?: string
}

export function Panel({ eyebrow, title, children, className }: PanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ''}`}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      {title && <h3 className={styles.heading}>{title}</h3>}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
