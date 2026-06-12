import { useState, useCallback } from 'react'

let nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ type = 'success', message }) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Shorthand helpers
  const success = useCallback(
    (msg) => toast({ type: 'success', message: msg }),
    [toast]
  )
  const error = useCallback(
    (msg) => toast({ type: 'error', message: msg }),
    [toast]
  )
  const warning = useCallback(
    (msg) => toast({ type: 'warning', message: msg }),
    [toast]
  )

  return { toasts, toast, dismiss, success, error, warning }
}
