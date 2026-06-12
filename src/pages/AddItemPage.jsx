import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { itemSchemaWithRefinement } from '../utils/itemSchema'
import { useAppToast } from '../components/layout/AppLayout'
import {
  DEPARTMENTS,
  ITEM_STATUSES,
  formatPrice,
} from '../constants/inventoryConstants'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import PriceInput from '../components/ui/PriceInput'
import Button from '../components/ui/Button'
import PhotoUploader from '../components/ui/PhotoUploader'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function AddItemPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user, isMarkdown } = useAuth()
  const toast = useAppToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [photos, setPhotos] = useState([]) // { file?, url, position }
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchemaWithRefinement),
    defaultValues: {
      status: 'active',
      price: '',
      markdown_price: '',
    },
  })

  const watchStatus = watch('status')
  const showMarkdownPrice = watchStatus === 'markdown' || watchStatus === 'sold'

  // ── Load existing item when editing
  useEffect(() => {
    if (!isEditing) return

    async function loadItem() {
      const { data, error } = await supabase
        .from('items')
        .select('*, item_photos(*)')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/inventory')
        return
      }

      reset({
        brand: data.brand,
        dept_code: data.dept_code,
        category_code: data.category_code,
        style_number: data.style_number,
        price: String(data.price),
        markdown_price: data.markdown_price ? String(data.markdown_price) : '',
        status: data.status,
        notes: data.notes ?? '',
      })

      setPhotos(
        data.item_photos
          .sort((a, b) => a.position - b.position)
          .map((p) => ({ url: p.url, id: p.id }))
      )
      setFetching(false)
    }

    loadItem()
  }, [id, isEditing, navigate, reset])

  // ── Submit
  async function onSubmit(data) {
    setLoading(true)
    setServerError('')

    try {
      const payload = {
        brand: data.brand.trim(),
        dept_code: data.dept_code,
        category_code: data.category_code,
        style_number: data.style_number,
        price: parseFloat(data.price),
        markdown_price: data.markdown_price
          ? parseFloat(data.markdown_price)
          : null,
        status: data.status,
        notes: data.notes?.trim() || null,
        added_by: user.id,
      }

      let itemId = id

      if (isEditing) {
        const { error } = await supabase
          .from('items')
          .update(payload)
          .eq('id', id)
        if (error) throw error
      } else {
        const { data: newItem, error } = await supabase
          .from('items')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        itemId = newItem.id
      }

      // ── Handle photos
      await syncPhotos(itemId)

      // ── Log history
      await supabase.from('item_history').insert({
        item_id: itemId,
        changed_by: user.id,
        change_type: isEditing ? 'updated' : 'created',
        new_value: payload,
      })

      toast.success(isEditing ? 'Item updated' : 'Item added successfully')
      navigate(`/inventory/${itemId}`)
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong')
      setServerError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Upload new photos, keep existing ones
  async function syncPhotos(itemId) {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]

      // Already uploaded (has id, no file)
      if (photo.id && !photo.file) continue

      // New photo — upload to storage
      if (photo.file) {
        const ext = photo.file.name.split('.').pop()
        const path = `${itemId}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(path, photo.file, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('item-photos').getPublicUrl(path)

        await supabase.from('item_photos').insert({
          item_id: itemId,
          url: publicUrl,
          position: i,
        })
      }
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 border-4 border-pink-500 border-t-transparent
                        rounded-full animate-spin"
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500
                     transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEditing ? 'Update item details' : 'Enter item details below'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Photos */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Photos
            <span className="text-gray-400 font-normal ml-1">(up to 4)</span>
          </h2>
          <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={4} />
        </div>

        {/* Item Details */}
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100
                        shadow-sm space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-700">Item Details</h2>

          <Input
            label="Brand"
            placeholder="e.g. Calvin Klein"
            error={errors.brand?.message}
            {...register('brand')}
          />

          <Select
            label="Department"
            error={errors.dept_code?.message}
            {...register('dept_code')}
          >
            <option value="">Select department...</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </Select>

          <Input
            label="Category Code"
            placeholder="e.g. 1042"
            maxLength={4}
            inputMode="numeric"
            hint="4-digit category number"
            error={errors.category_code?.message}
            {...register('category_code')}
          />

          <Input
            label="Style Number"
            placeholder="e.g. 123456"
            maxLength={6}
            inputMode="numeric"
            hint="6-digit style number"
            error={errors.style_number?.message}
            {...register('style_number')}
          />
        </div>

        {/* Pricing */}
        <div
          className="bg-white rounded-2xl p-4 border border-gray-100
                        shadow-sm space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-700">
            Pricing & Status
          </h2>

          <PriceInput
            label="Original Price"
            type="active"
            error={errors.price?.message}
            value={watch('price')}
            onChange={(e) => setValue('price', e.target.value)}
          />

          <Select
            label="Status"
            error={errors.status?.message}
            disabled={!isMarkdown && isEditing}
            {...register('status')}
          >
            <option value="active">Active</option>
            {isMarkdown && (
              <>
                <option value="markdown">Markdown</option>
                <option value="sold">Sold</option>
              </>
            )}
            <option value="archived">Archived</option>
          </Select>

          {showMarkdownPrice && (
            <PriceInput
              label="Markdown Price"
              type="markdown"
              error={errors.markdown_price?.message}
              value={watch('markdown_price')}
              onChange={(e) => setValue('markdown_price', e.target.value)}
            />
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Notes
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </h2>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Any additional details about this item..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl
                       text-sm focus:outline-none focus:ring-2 focus:ring-pink-400
                       resize-none hover:border-gray-400 transition-colors"
          />
          {errors.notes && (
            <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
          >
            <Save size={16} />
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}
