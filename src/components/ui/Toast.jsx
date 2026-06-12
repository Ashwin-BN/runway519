import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
  error: <XCircle size={16} className="text-red-500 shrink-0" />,
  warning: <AlertCircle size={16} className="text-yellow-500 shrink-0" />,
}

const STYLES = {
  success: 'border-green-100 bg-green-50',
  error: 'border-red-100 bg-red-50',
  warning: 'border-yellow-100 bg-yellow-50',
}

// ── Single toast
function Toast({ id, type = 'success', message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 3500)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-2xl border
                     shadow-lg max-w-sm w-full
                     animate-in slide-in-from-bottom-4 duration-300
                     ${STYLES[type]}`}
    >
      {ICONS[type]}
      <p className="text-sm text-gray-700 font-medium flex-1 leading-snug">
        {message}
      </p>
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Toast container
export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto
                    z-50 flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full md:w-auto">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
