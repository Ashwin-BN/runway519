import { useRef, useState } from 'react'
import { Camera, X, Plus, Loader2, Image } from 'lucide-react'
import { compressImage } from '../../utils/compressImage'

export default function PhotoUploader({ photos, onChange, maxPhotos = 4 }) {
  const cameraRef = useRef()
  const galleryRef = useRef()
  const [compressing, setCompressing] = useState(false)

  // ── Shared processor for both camera and gallery
  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const remaining = maxPhotos - photos.length
    const toProcess = files.slice(0, remaining)

    setCompressing(true)

    const compressed = await Promise.all(
      toProcess.map(async (file) => {
        try {
          const small = await compressImage(file)
          return { file: small, url: URL.createObjectURL(small) }
        } catch {
          // Fallback to original if compression fails
          return { file, url: URL.createObjectURL(file) }
        }
      })
    )

    onChange([...photos, ...compressed])
    e.target.value = ''
    setCompressing(false)
  }

  function removePhoto(index) {
    onChange(photos.filter((_, i) => i !== index))
  }

  const isFull = photos.length >= maxPhotos
  const remaining = maxPhotos - photos.length

  return (
    <div className="flex flex-col gap-3">
      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-xl overflow-hidden
                         border-2 border-gray-200 group shrink-0"
            >
              <img
                src={photo.url}
                alt={`Item photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full
                           flex items-center justify-center
                           opacity-0 group-hover:opacity-100
                           transition-opacity shadow-sm"
              >
                <X size={10} className="text-white" />
              </button>

              {/* Cover label */}
              {index === 0 && (
                <span
                  className="absolute bottom-0 left-0 right-0 bg-black/50
                                 text-white text-[9px] text-center py-0.5
                                 font-medium tracking-wide"
                >
                  COVER
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons — shown when not full */}
      {!isFull && (
        <div className="flex gap-2">
          {/* Take photo with camera */}
          <button
            type="button"
            disabled={compressing}
            onClick={() => cameraRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center gap-1.5
                       py-3 border-2 border-dashed border-gray-300 rounded-xl
                       hover:border-pink-400 hover:bg-pink-50
                       transition-colors text-gray-400 hover:text-pink-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {compressing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Camera size={20} />
            )}
            <span className="text-xs font-medium">
              {compressing ? 'Processing...' : 'Take Photo'}
            </span>
          </button>

          {/* Choose from gallery */}
          <button
            type="button"
            disabled={compressing}
            onClick={() => galleryRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center gap-1.5
                       py-3 border-2 border-dashed border-gray-300 rounded-xl
                       hover:border-pink-400 hover:bg-pink-50
                       transition-colors text-gray-400 hover:text-pink-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {compressing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Image size={20} />
            )}
            <span className="text-xs font-medium">
              {compressing ? 'Processing...' : 'Gallery'}
            </span>
          </button>
        </div>
      )}

      {/* Camera input — opens camera directly */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFiles}
      />

      {/* Gallery input — opens photo library */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* Footer count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {photos.length}/{maxPhotos} photos
          {photos.length === 0 && ' · First photo becomes the cover'}
        </p>
        {photos.length > 0 && !isFull && (
          <p className="text-xs text-gray-400">
            {remaining} slot{remaining !== 1 ? 's' : ''} remaining
          </p>
        )}
        {isFull && (
          <p className="text-xs text-pink-500 font-medium">
            Maximum photos reached
          </p>
        )}
      </div>
    </div>
  )
}
