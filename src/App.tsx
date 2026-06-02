import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './routes/Home'
import { ConceptPage } from './routes/ConceptPage'
import styles from './App.module.css'

export function App() {
  return (
    <BrowserRouter basename="/linearAlgebraVisualizer">
      <div className={styles.appShell}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/concept/:id" element={<ConceptPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
