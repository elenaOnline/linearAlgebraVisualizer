import { useMemo } from 'react'
import katex from 'katex'
import styles from './MathText.module.css'

interface MathTextProps {
  tex: string
  display?: boolean
}

export function MathText({ tex, display = false }: MathTextProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        errorColor: '#e74c3c',
      })
    } catch {
      return `<span style="color:#e74c3c">KaTeX error: ${tex}</span>`
    }
  }, [tex, display])

  return (
    <span
      className={display ? styles.display : styles.inline}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
