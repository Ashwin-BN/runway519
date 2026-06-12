import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../constants/inventoryConstants'
import { useInventoryFilters } from '../hooks/useInventoryFilters'
import { useBulkSelect } from '../hooks/useBulkSelect'
import { InventorySkeleton } from '../components/ui/Skeleton'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import FilterBar from '../components/ui/FilterBar'
import BulkActionBar from '../components/ui/BulkActionBar'
import StatusBadge from '../components/ui/StatusBadge'
import Button from '../components/ui/Button'
import { Plus, Package, CheckSquare, Square, RefreshCw } from 'lucide-react'

export default function InventoryPage() {
  const navigate = useNavigate()
  const { isAdmin, isMarkdown } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)

  const {
    filters,
    setFilter,
    clearFilter,
    clearAll,
    activeFilters,
    hasActiveFilters,
    filtered,
  } = useInventoryFilters(items)

  const {
    selectedIds,
    selectedCount,
    hasSelection,
    isAllSelected,
    toggle,
    selectAll,
    clearAll: clearSelection,
    isSelected,
  } = useBulkSelect(filtered)

  // ── Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*, item_photos(url, position)')
      .order('created_at', { ascending: false })

    if (!error) setItems(data ?? [])
    setLoading(false)
  }, [])

  const { isPulling, pullDistance } = usePullToRefresh(fetchItems)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // ── Bulk status update
  async function handleBulkStatus(newStatus) {
    if (!selectedIds.length) return
    setBulkLoading(true)

    const { error } = await supabase
      .from('items')
      .update({ status: newStatus })
      .in('id', selectedIds)

    if (!error) {
      await fetchItems()
      clearSelection()
      setBulkMode(false)
    }

    setBulkLoading(false)
  }

  function getCoverPhoto(item) {
    if (!item.item_photos?.length) return null
    return item.item_photos.sort((a, b) => a.position - b.position)[0].url
  }

  function handleCardClick(item) {
    if (bulkMode) {
      toggle(item.id)
    } else {
      navigate(`/inventory/${item.id}`)
    }
  }

  const canBulk = isAdmin || isMarkdown

  return (
    <div className="max-w-2xl mx-auto">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center text-pink-500 transition-all"
          style={{ height: Math.min(pullDistance * 0.5, 40) }}
        >
          <RefreshCw size={18} className={isPulling ? 'animate-spin' : ''} />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {items.length} total items
          </p>
        </div>
        <div className="flex gap-2">
          {/* Bulk select toggle — markdown/admin only */}
          {canBulk && items.length > 0 && (
            <Button
              variant={bulkMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setBulkMode((v) => !v)
                clearSelection()
              }}
            >
              <CheckSquare size={15} />
              {bulkMode ? 'Done' : 'Select'}
            </Button>
          )}
          <Button size="sm" onClick={() => navigate('/inventory/add')}>
            <Plus size={15} />
            Add
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilter={setFilter}
        clearFilter={clearFilter}
        clearAll={clearAll}
        activeFilters={activeFilters}
        hasActiveFilters={hasActiveFilters}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      {/* Item list */}
      {loading ? (
        <InventorySkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters || !!filters.search}
          onClear={clearAll}
          onAdd={() => navigate('/inventory/add')}
        />
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              coverPhoto={getCoverPhoto(item)}
              onClick={() => handleCardClick(item)}
              bulkMode={bulkMode}
              selected={isSelected(item.id)}
            />
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {bulkMode && hasSelection && (
        <BulkActionBar
          selectedCount={selectedCount}
          isAllSelected={isAllSelected}
          onSelectAll={selectAll}
          onStatusChange={handleBulkStatus}
          onClear={clearSelection}
          loading={bulkLoading}
        />
      )}
    </div>
  )
}

// ── Item Card
function ItemCard({ item, coverPhoto, onClick, bulkMode, selected }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm flex gap-3 p-3
                  cursor-pointer transition-all active:scale-[0.99]
                  ${
                    selected
                      ? 'border-pink-400 bg-pink-50 shadow-pink-100'
                      : 'border-gray-100 hover:shadow-md hover:border-pink-100'
                  }`}
    >
      {/* Bulk checkbox */}
      {bulkMode && (
        <div className="flex items-center shrink-0">
          {selected ? (
            <CheckSquare size={20} className="text-pink-600" />
          ) : (
            <Square size={20} className="text-gray-300" />
          )}
        </div>
      )}

      {/* Photo */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={item.brand}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-800 truncate">{item.brand}</p>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex gap-1.5 mt-1 flex-wrap">
          <span
            className="text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-lg"
          >
            Dept {item.dept_code}
          </span>
          <span
            className="text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-lg"
          >
            {item.category_code}
          </span>
          <span
            className="text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-lg"
          >
            #{item.style_number}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {item.markdown_price ? (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.price)}
              </span>
              <span className="text-base font-bold text-yellow-600">
                {formatPrice(item.markdown_price)}
              </span>
              <span
                className="text-xs bg-yellow-100 text-yellow-700
                               px-1.5 py-0.5 rounded-lg font-medium"
              >
                Save {formatPrice(item.price - item.markdown_price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-800">
              {formatPrice(item.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Empty state
function EmptyState({ hasFilters, onClear, onAdd }) {
  return (
    <div className="text-center py-16">
      <div
        className="w-14 h-14 bg-gray-100 rounded-full flex items-center
                      justify-center mx-auto mb-3"
      >
        <Package size={24} className="text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">No items found</p>
      <p className="text-gray-400 text-sm mt-1">
        {hasFilters
          ? 'No items match your current filters'
          : 'Add your first item to get started'}
      </p>
      {hasFilters ? (
        <button
          onClick={onClear}
          className="mt-4 text-sm text-pink-600 font-medium
                     hover:underline"
        >
          Clear all filters
        </button>
      ) : (
        <Button className="mt-4" onClick={onAdd}>
          <Plus size={16} />
          Add First Item
        </Button>
      )}
    </div>
  )
}
