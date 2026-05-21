import { useParams, Link } from 'react-router-dom'
import { concepts } from '../concepts/registry'
import styles from './ConceptPage.module.css'

export function ConceptPage() {
  const { id } = useParams<{ id: string }>()
  const concept = concepts.find((c) => c.id === id)

  if (!concept) {
    return (
      <div className={styles.notFound}>
        <h2>Concept not found: {id}</h2>
        <Link to="/" className={styles.backLink}>
          ← Back to gallery
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          ← Gallery
        </Link>
        <h1 className={styles.title}>{concept.title}</h1>
        <div className={styles.badges}>
          {concept.supports.map((d) => (
            <span key={d} className={styles.badge}>
              {d === '2d' ? 'R²' : 'R³'}
            </span>
          ))}
        </div>
      </header>

      <div className={styles.layout}>
        <concept.Component />
      </div>
    </div>
  )
}
