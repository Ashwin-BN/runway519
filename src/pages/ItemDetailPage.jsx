import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  formatPrice,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../constants/inventoryConstants'
import StatusBadge from '../components/ui/StatusBadge'
import Button from '../components/ui/Button'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Clock,
  Tag,
  Hash,
  LayoutGrid,
  DollarSign,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isMarkdown, user } = useAuth()

  const [item, setItem] = useState(null)
  const [photos, setPhotos] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [id])

  async function fetchItem() {
    setLoading(true)

    const [{ data: itemData }, { data: historyData }] = await Promise.all([
      supabase
        .from('items')
        .select('*, item_photos(*), profiles(full_name)')
        .eq('id', id)
        .single(),
      supabase
        .from('item_history')
        .select('*, profiles(full_name)')
        .eq('item_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (!itemData) {
      navigate('/inventory')
      return
    }

    setItem(itemData)
    setPhotos(
      (itemData.item_photos ?? []).sort((a, b) => a.position - b.position)
    )
    setHistory(historyData ?? [])
    setLoading(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      // Delete photos from storage first
      for (const photo of photos) {
        const path = photo.url.split('/item-photos/')[1]
        if (path) {
          await supabase.storage.from('item-photos').remove([path])
        }
      }
      // Delete item (cascades to item_photos and item_history)
      await supabase.from('items').delete().eq('id', id)
      navigate('/inventory')
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-pink-500 border-t-transparent
                        rounded-full animate-spin"
        />
      </div>
    )
  }

  if (!item) return null

  const canEdit = isMarkdown || isAdmin
  const canDelete = isAdmin

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/inventory')}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500
                     transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/inventory/${id}/edit`)}
            >
              <Edit2 size={14} />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      <div className="bg-black rounded-2xl overflow-hidden mb-4 relative">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[photoIndex]?.url}
              alt={item.brand}
              className="w-full h-72 object-contain"
            />
            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setPhotoIndex(
                      (i) => (i - 1 + photos.length) % photos.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8
                             bg-black/40 rounded-full flex items-center justify-center
                             text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8
                             bg-black/40 rounded-full flex items-center justify-center
                             text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                {/* Dot indicators */}
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2
                                flex gap-1.5"
                >
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors
                                  ${
                                    i === photoIndex
                                      ? 'bg-white'
                                      : 'bg-white/40'
                                  }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <Tag size={40} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mb-4">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setPhotoIndex(i)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2
                          transition-colors shrink-0
                          ${
                            i === photoIndex
                              ? 'border-pink-500'
                              : 'border-transparent'
                          }`}
            >
              <img
                src={photo.url}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Brand + status */}
      <div
        className="bg-white rounded-2xl p-4 border border-gray-100
                      shadow-sm mb-3"
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-xl font-bold text-gray-800">{item.brand}</h2>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-xs text-gray-400">
          Added {format(new Date(item.created_at), 'MMM d, yyyy')}
          {item.profiles?.full_name && ` · by ${item.profiles.full_name}`}
        </p>
      </div>

      {/* Details grid */}
      <div
        className="bg-white rounded-2xl p-4 border border-gray-100
                      shadow-sm mb-3"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Item Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <DetailRow
            icon={<LayoutGrid size={14} />}
            label="Department"
            value={`Dept ${item.dept_code}`}
          />
          <DetailRow
            icon={<Hash size={14} />}
            label="Category"
            value={item.category_code}
          />
          <DetailRow
            icon={<Tag size={14} />}
            label="Style #"
            value={item.style_number}
          />
          <DetailRow
            icon={<DollarSign size={14} />}
            label="Original Price"
            value={formatPrice(item.price)}
          />
          {item.markdown_price && (
            <DetailRow
              icon={<DollarSign size={14} />}
              label="Markdown Price"
              value={formatPrice(item.markdown_price)}
              valueClass="text-yellow-600 font-bold"
            />
          )}
          {item.markdown_price && (
            <DetailRow
              icon={<DollarSign size={14} />}
              label="You Save"
              value={formatPrice(item.price - item.markdown_price)}
              valueClass="text-green-600 font-bold"
            />
          )}
        </div>

        {item.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div
              className="flex items-center gap-1.5 text-xs text-gray-500
                            font-medium mb-1"
            >
              <FileText size={13} />
              Notes
            </div>
            <p className="text-sm text-gray-700">{item.notes}</p>
          </div>
        )}
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100
                        shadow-sm mb-6"
        >
          <h3
            className="text-sm font-semibold text-gray-700 mb-3 flex
                         items-center gap-2"
          >
            <Clock size={14} />
            Activity History
          </h3>
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5
                                shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-700 font-medium capitalize">
                    {entry.change_type}
                    {entry.profiles?.full_name && (
                      <span className="text-gray-400 font-normal">
                        {' '}
                        · {entry.profiles.full_name}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end
                        sm:items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Delete this item?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete <strong>{item.brand}</strong> and all
              its photos. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                loading={deleting}
                onClick={handleDelete}
              >
                <Trash2 size={15} />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Small reusable detail row
function DetailRow({ icon, label, value, valueClass = 'text-gray-800' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-xs text-gray-400">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}
