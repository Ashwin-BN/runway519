import { useState } from 'react'

export function useBulkSelect(items = []) {
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(items.map((i) => i.id)))
  }

  function clearAll() {
    setSelected(new Set())
  }

  function isSelected(id) {
    return selected.has(id)
  }

  const isAllSelected = items.length > 0 && selected.size === items.length
  const hasSelection = selected.size > 0
  const selectedCount = selected.size
  const selectedIds = Array.from(selected)

  return {
    selected,
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected,
    toggle,
    selectAll,
    clearAll,
    isSelected,
  }
}
