import type { ReactNode } from 'react'
import styles from './Callout.module.css'

interface CalloutProps {
  variant?: 'info' | 'warning' | 'success'
  children: ReactNode
}

export function Callout({ variant = 'info', children }: CalloutProps) {
  return <div className={`${styles.callout} ${styles[variant]}`}>{children}</div>
}
