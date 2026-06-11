import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../constants/inventoryConstants'
import StatusBadge from '../components/ui/StatusBadge'
import Button from '../components/ui/Button'
import { Plus, Search, Package } from 'lucide-react'

export default function InventoryPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('*, item_photos(url, position)')
      .order('created_at', { ascending: false })

    if (!error) setItems(data ?? [])
    setLoading(false)
  }

  // Basic search filter (full filter panel comes in Phase 3)
  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    return (
      item.brand.toLowerCase().includes(q) ||
      item.style_number.includes(q) ||
      item.dept_code.includes(q) ||
      item.category_code.includes(q)
    )
  })

  function getCoverPhoto(item) {
    if (!item.item_photos?.length) return null
    return item.item_photos.sort((a, b) => a.position - b.position)[0].url
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {items.length} total items
          </p>
        </div>
        <Button onClick={() => navigate('/inventory/add')}>
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      {/* Search bar (full filters in Phase 3) */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search brand, style, dept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200
                     rounded-xl text-sm focus:outline-none focus:ring-2
                     focus:ring-pink-400 transition-colors"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="w-8 h-8 border-4 border-pink-500 border-t-transparent
                          rounded-full animate-spin"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-14 h-14 bg-gray-100 rounded-full flex items-center
                          justify-center mx-auto mb-3"
          >
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No items found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search
              ? 'Try a different search'
              : 'Add your first item to get started'}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => navigate('/inventory/add')}>
              <Plus size={16} />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              coverPhoto={getCoverPhoto(item)}
              onClick={() => navigate(`/inventory/${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Item Card Component
function ItemCard({ item, coverPhoto, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm
                 flex gap-3 p-3 cursor-pointer hover:shadow-md hover:border-pink-100
                 transition-all active:scale-[0.99]"
    >
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

        <div className="flex gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
            Dept {item.dept_code}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
            {item.category_code}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
            #{item.style_number}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-800">
            {formatPrice(item.price)}
          </span>
          {item.markdown_price && (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.price)}
              </span>
              <span className="text-sm font-bold text-yellow-600">
                {formatPrice(item.markdown_price)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
