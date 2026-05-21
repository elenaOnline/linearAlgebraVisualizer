import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface DragContextValue {
  isDragging: boolean
  setDragging: (dragging: boolean) => void
}

const DragContext = createContext<DragContextValue>({
  isDragging: false,
  setDragging: () => undefined,
})

export function DragProvider({ children }: { children: ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const setDragging = useCallback((dragging: boolean) => setIsDragging(dragging), [])
  return (
    <DragContext.Provider value={{ isDragging, setDragging }}>
      {children}
    </DragContext.Provider>
  )
}

export function useDragContext() {
  return useContext(DragContext)
}
