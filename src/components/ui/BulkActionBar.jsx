import { useState } from 'react'
import { CheckSquare, X, ChevronDown, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'active', label: '✅ Mark Active' },
  { value: 'markdown', label: '🏷️ Mark Markdown' },
  { value: 'sold', label: '💰 Mark Sold' },
  { value: 'archived', label: '📦 Archive' },
]

export default function BulkActionBar({
  selectedCount,
  onStatusChange,
  onClear,
  isAllSelected,
  onSelectAll,
  loading,
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  async function handleStatus(status) {
    setShowDropdown(false)
    await onStatusChange(status)
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40
                    max-w-lg mx-auto"
    >
      <div
        className="bg-gray-900 text-white rounded-2xl px-4 py-3
                      shadow-2xl flex items-center gap-3"
      >
        {/* Count */}
        <div className="flex items-center gap-2 flex-1">
          <CheckSquare size={18} className="text-pink-400" />
          <span className="text-sm font-semibold">
            {selectedCount} selected
          </span>
        </div>

        {/* Select all */}
        <button
          onClick={onSelectAll}
          className="text-xs text-gray-400 hover:text-white
                     transition-colors shrink-0"
        >
          {isAllSelected ? 'Deselect all' : 'Select all'}
        </button>

        {/* Status change dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            disabled={loading}
            className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700
                       px-3 py-1.5 rounded-xl text-sm font-medium
                       transition-colors disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                Change Status
                <ChevronDown size={14} />
              </>
            )}
          </button>

          {showDropdown && (
            <div
              className="absolute bottom-full right-0 mb-2 bg-white
                            rounded-xl shadow-xl border border-gray-100
                            overflow-hidden w-44"
            >
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatus(opt.value)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700
                             hover:bg-pink-50 hover:text-pink-700 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection */}
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
