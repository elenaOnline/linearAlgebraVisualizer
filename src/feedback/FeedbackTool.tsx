/// <reference types="vite/client" />
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './FeedbackTool.module.css'

type ToolState = 'idle' | 'selecting' | 'modal'
type Scope = 'local' | 'general'
type Priority = 'low' | 'med' | 'hi'

interface Captured {
  route: string
  elementDesc: string
}

// Pencil SVG icon
function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M12.5 2.5l3 3L5 16H2v-3L12.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function describeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const cls = el.classList[0] ? `.${el.classList[0]}` : ''
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 50)
  return text ? `${tag}${cls} "${text}"` : `${tag}${cls}`
}

export function FeedbackTool() {
  if (!import.meta.env.DEV) return null

  const [toolState, setToolState] = useState<ToolState>('idle')
  const [captured, setCaptured] = useState<Captured | null>(null)
  const [note, setNote] = useState('')
  const [scope, setScope] = useState<Scope>('local')
  const [priority, setPriority] = useState<Priority>('med')
  const highlightRef = useRef<HTMLDivElement>(null)

  // Element selection: attach capture-phase listeners while in 'selecting' state
  useEffect(() => {
    if (toolState !== 'selecting') return

    document.body.style.cursor = 'crosshair'

    const onMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!highlightRef.current) return
      // Don't highlight our own UI
      if (el.closest('[data-feedback-ui]')) {
        highlightRef.current.style.display = 'none'
        return
      }
      const rect = el.getBoundingClientRect()
      const h = highlightRef.current
      h.style.display = 'block'
      h.style.left = `${rect.left}px`
      h.style.top = `${rect.top}px`
      h.style.width = `${rect.width}px`
      h.style.height = `${rect.height}px`
    }

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      // Let clicks on our own UI pass through (FAB cancel button)
      if (el.closest('[data-feedback-ui]')) return
      e.preventDefault()
      e.stopImmediatePropagation()
      setCaptured({
        route: window.location.pathname,
        elementDesc: describeElement(el),
      })
      setToolState('modal')
    }

    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)

    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      if (highlightRef.current) highlightRef.current.style.display = 'none'
    }
  }, [toolState])

  function enterSelecting() {
    setToolState('selecting')
  }

  function cancel() {
    setNote('')
    setScope('local')
    setPriority('med')
    setCaptured(null)
    setToolState('idle')
  }

  async function handleSubmit() {
    if (!captured || !note.trim()) return
    try {
      await fetch('/__feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: note.trim(),
          scope,
          priority,
          route: captured.route,
          elementDesc: captured.elementDesc,
        }),
      })
    } catch {
      // In dev, the server is always running — silently ignore network errors
    }
    setNote('')
    setScope('local')
    setPriority('med')
    setCaptured(null)
    setToolState('idle')
  }

  return (
    <>
      {/* Dim overlay when selecting */}
      {toolState === 'selecting' && (
        <div className={styles.overlay} data-feedback-ui aria-hidden />
      )}

      {/* Hover highlight box — always mounted but hidden until mousemove */}
      <div
        ref={highlightRef}
        className={styles.highlight}
        data-feedback-ui
        aria-hidden
      />

      {/* Instruction hint when selecting */}
      {toolState === 'selecting' && (
        <div className={styles.hint} data-feedback-ui aria-live="polite">
          Click any element to annotate it
        </div>
      )}

      {/* FAB */}
      <button
        className={`${styles.fab} ${toolState !== 'idle' ? styles.fabActive : ''}`}
        onClick={toolState === 'idle' ? enterSelecting : cancel}
        aria-label={toolState === 'idle' ? 'Give feedback' : 'Cancel feedback'}
        data-feedback-ui
      >
        {toolState !== 'idle' ? <CloseIcon /> : <PencilIcon />}
      </button>

      {/* Modal (portal) */}
      {toolState === 'modal' && captured &&
        createPortal(
          <div className={styles.modalBackdrop} data-feedback-ui>
            <div className={styles.modal} role="dialog" aria-modal aria-label="Feedback">
              <div className={styles.modalHeader}>
                <span className={styles.eyebrow}>Feedback</span>
                <button className={styles.closeBtn} onClick={cancel} aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.contextBlock}>
                <div className={styles.contextRow}>
                  <span className={styles.contextLabel}>Route</span>
                  <span className={styles.contextValue}>{captured.route}</span>
                </div>
                <div className={styles.contextRow}>
                  <span className={styles.contextLabel}>Element</span>
                  <span className={styles.contextValue}>{captured.elementDesc}</span>
                </div>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Describe the issue or observation…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                autoFocus
              />

              <div className={styles.row}>
                <span className={styles.fieldLabel}>Scope</span>
                <div className={styles.toggleGroup}>
                  {(['local', 'general'] as const).map((s) => (
                    <button
                      key={s}
                      className={`${styles.toggleBtn} ${scope === s ? styles.toggleBtnActive : ''}`}
                      onClick={() => setScope(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.row}>
                <span className={styles.fieldLabel}>Priority</span>
                <div className={styles.toggleGroup}>
                  {(['low', 'med', 'hi'] as const).map((p) => (
                    <button
                      key={p}
                      className={`${styles.toggleBtn} ${priority === p ? styles.toggleBtnActive : ''}`}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.cancelBtn} onClick={cancel}>
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!note.trim()}
                >
                  Save feedback
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
