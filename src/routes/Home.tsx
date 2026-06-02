import { useNavigate } from 'react-router-dom'
import { concepts } from '../concepts/registry'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Linear Algebra Visualizer</h1>
        <p className={styles.subtitle}>
          Explore the core concepts of linear algebra through interactive, real-time visualizations.
        </p>
      </header>
      <section className={styles.gallery} aria-label="Concept gallery">
        {concepts.map((concept) => {
          const cardContent = (
            <>
              <div className={styles.thumbnailArea}>
                <concept.Thumbnail />
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{concept.title}</h2>
                <p className={styles.cardBlurb}>{concept.blurb}</p>
                <span className={styles.cardBadges}>
                  {concept.supports.map((d) => (
                    <span key={d} className={styles.badge}>
                      {d === '2d' ? 'R²' : 'R³'}
                    </span>
                  ))}
                </span>
              </div>
            </>
          )

          if (concept.disabled) {
            return (
              <div
                key={concept.id}
                className={`${styles.card} ${styles.cardDisabled}`}
                aria-label={`${concept.title} (coming soon)`}
                aria-disabled="true"
              >
                {cardContent}
              </div>
            )
          }

          return (
            <button
              key={concept.id}
              className={styles.card}
              onClick={() => navigate(`/concept/${concept.id}`)}
              aria-label={`Open ${concept.title}`}
            >
              {cardContent}
            </button>
          )
        })}
      </section>
    </main>
  )
}
