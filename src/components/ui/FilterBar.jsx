import { useState } from 'react'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { DEPARTMENTS } from '../../constants/inventoryConstants'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'brand_az', label: 'Brand: A → Z' },
  { value: 'brand_za', label: 'Brand: Z → A' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
]

export default function FilterBar({
  filters,
  setFilter,
  clearFilter,
  clearAll,
  activeFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    mb-4 overflow-hidden"
    >
      {/* Top row — always visible */}
      <div className="flex items-center gap-2 p-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search brand, style, dept..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200
                       rounded-xl text-sm focus:outline-none focus:ring-2
                       focus:ring-pink-400 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => clearFilter('search')}
              className="absolute right-2 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm
                      font-medium transition-colors shrink-0
                      ${
                        hasActiveFilters
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
        >
          <SlidersHorizontal size={15} />
          <span>Filter</span>
          {hasActiveFilters && (
            <span
              className="bg-white text-pink-600 text-xs font-bold
                             w-4 h-4 rounded-full flex items-center justify-center"
            >
              {activeFilters.length}
            </span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-3">
          {/* Row 1 — Dept + Status */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Department
              </label>
              <select
                value={filters.dept}
                onChange={(e) => setFilter('dept', e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200
                           rounded-xl text-xs focus:outline-none focus:ring-2
                           focus:ring-pink-400"
              >
                <option value="">All Depts</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.label.split('—')[1]?.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilter('status', e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200
                           rounded-xl text-xs focus:outline-none focus:ring-2
                           focus:ring-pink-400"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 — Price range */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Price Range
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2
                                 text-gray-400 text-xs"
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                  className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200
                             rounded-xl text-xs focus:outline-none focus:ring-2
                             focus:ring-pink-400"
                />
              </div>
              <span className="text-gray-400 text-xs shrink-0">to</span>
              <div className="relative flex-1">
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2
                                 text-gray-400 text-xs"
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                  className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200
                             rounded-xl text-xs focus:outline-none focus:ring-2
                             focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Row 3 — Sort */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200
                         rounded-xl text-xs focus:outline-none focus:ring-2
                         focus:ring-pink-400"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                clearAll()
                setExpanded(false)
              }}
              className="w-full py-2 text-xs font-medium text-red-500
                         hover:bg-red-50 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex gap-1.5 flex-wrap px-3 pb-3">
          {activeFilters.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1
                         bg-pink-50 text-pink-700 text-xs font-medium
                         rounded-full"
            >
              {chip.label}
              <button
                onClick={() => clearFilter(chip.key)}
                className="hover:text-pink-900 ml-0.5"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="px-3 pb-2.5">
        <p className="text-xs text-gray-400">
          Showing{' '}
          <span className="font-semibold text-gray-600">{resultCount}</span> of{' '}
          <span className="font-semibold text-gray-600">{totalCount}</span>{' '}
          items
        </p>
      </div>
    </div>
  )
}
