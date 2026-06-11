import { useRef } from 'react'
import { Camera, X, Plus } from 'lucide-react'

export default function PhotoUploader({ photos, onChange, maxPhotos = 4 }) {
  const inputRef = useRef()

  function handleFiles(e) {
    const files = Array.from(e.target.files)
    const remaining = maxPhotos - photos.length
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    onChange([...photos, ...toAdd])
    e.target.value = ''
  }

  function removePhoto(index) {
    onChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Existing / preview photos */}
      {photos.map((photo, index) => (
        <div
          key={index}
          className="relative w-20 h-20 rounded-xl overflow-hidden
                     border-2 border-gray-200 group"
        >
          <img
            src={photo.url}
            alt={`Item photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => removePhoto(index)}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full
                       flex items-center justify-center opacity-0
                       group-hover:opacity-100 transition-opacity"
          >
            <X size={10} className="text-white" />
          </button>
          {index === 0 && (
            <span
              className="absolute bottom-0 left-0 right-0 bg-black/50
                             text-white text-[9px] text-center py-0.5"
            >
              Cover
            </span>
          )}
        </div>
      ))}

      {/* Add photo button */}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300
                     flex flex-col items-center justify-center gap-1
                     hover:border-pink-400 hover:bg-pink-50 transition-colors
                     text-gray-400 hover:text-pink-500"
        >
          <Plus size={20} />
          <span className="text-[10px] font-medium">Add Photo</span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={handleFiles}
      />

      {/* Count */}
      <div className="w-full">
        <p className="text-xs text-gray-400">
          {photos.length}/{maxPhotos} photos
          {photos.length === 0 && ' · First photo becomes the cover image'}
        </p>
      </div>
    </div>
  )
}
