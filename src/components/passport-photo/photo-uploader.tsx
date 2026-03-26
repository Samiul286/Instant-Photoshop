'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Crop as CropIcon, X } from 'lucide-react'
import { usePassportStore, generateId, type PhotoItem } from '@/store/passport-store'
import { cn } from '@/lib/utils'

export function PhotoUploader() {
  const { photos, addPhotos, removePhoto, updatePhoto, setSelectedPhoto, setUIState } = usePassportStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos: PhotoItem[] = acceptedFiles.map(file => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      copies: 6,
      processed: false
    }))
    
    addPhotos(newPhotos)
  }, [addPhotos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  })

  const handleCropClick = (photoId: string) => {
    setSelectedPhoto(photoId)
    setUIState({ showCropper: true })
  }

  const handleCopyCountChange = (photoId: string, copies: number) => {
    updatePhoto(photoId, { copies: Math.max(1, Math.min(54, copies)) })
  }

  return (
    <div>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-[#d6cfc2] rounded-[14px] p-11 text-center cursor-pointer transition-all",
          "bg-[#faf7f2] hover:border-[#c8773a] hover:bg-[#fdf1e8]",
          isDragActive && "border-[#c8773a] bg-[#fdf1e8]"
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          "w-14 h-14 bg-[#fdf1e8] border border-[#eeddc8] rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform",
          isDragActive && "scale-105"
        )}>
          <Upload className="w-6 h-6 text-[#c8773a]" />
        </div>
        <h3 className="text-base font-semibold text-[#1c1a17] mb-1.5">
          Drag & drop or click to upload
        </h3>
        <p className="text-sm text-[#8a8178]">
          Multiple photos supported · JPG, PNG, WEBP
        </p>
      </div>

      {/* Photo List */}
      {photos.length > 0 && (
        <div className="mt-4 flex flex-col gap-2.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-3.5 bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-3 transition-all hover:border-[#eeddc8] hover:shadow-[0_1px_4px_rgba(28,26,23,0.06)] animate-slide-in"
            >
              {/* Thumbnail */}
              <img
                src={photo.croppedPreview || photo.preview}
                alt={photo.file.name}
                className="w-[52px] h-16 object-cover rounded border border-[#d6cfc2] flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1c1a17] truncate">
                  {photo.file.name}
                </div>
                <div className="text-xs text-[#8a8178] mt-0.5">
                  {photo.croppedPreview ? '✅ Cropped' : '⚠️ Original'}
                </div>
              </div>

              {/* Copies */}
              <div className="flex flex-col items-center gap-1">
                <label className="text-[0.72rem] text-[#8a8178] font-medium tracking-wide uppercase">
                  Copies
                </label>
                <input
                  type="number"
                  value={photo.copies}
                  onChange={(e) => handleCopyCountChange(photo.id, parseInt(e.target.value) || 1)}
                  min={1}
                  max={54}
                  className="w-[60px] py-1.5 text-center border border-[#d6cfc2] rounded-lg bg-white text-sm font-semibold text-[#1c1a17] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.1)]"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleCropClick(photo.id)}
                  className="text-xs font-semibold py-1 px-3.5 rounded bg-[#fdf1e8] text-[#c8773a] border border-[#eeddc8] hover:bg-[#c8773a] hover:text-white hover:border-[#c8773a] transition-all"
                >
                  Crop
                </button>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="text-xs font-semibold py-1 px-3.5 rounded bg-[#fff0ef] text-[#c0392b] border border-[#f5c5c1] hover:bg-[#c0392b] hover:text-white hover:border-[#c0392b] transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {photos.length > 0 && (
        <div className="text-center mt-3">
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.multiple = true
              input.accept = 'image/jpeg,image/png,image/webp'
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files
                if (files) {
                  const newPhotos: PhotoItem[] = Array.from(files).map(file => ({
                    id: generateId(),
                    file,
                    preview: URL.createObjectURL(file),
                    copies: 6,
                    processed: false
                  }))
                  addPhotos(newPhotos)
                }
              }
              input.click()
            }}
            className="text-sm font-medium text-[#c8773a] bg-[#fdf1e8] border border-dashed border-[#eeddc8] rounded-lg px-5 py-2.5 hover:bg-[#c8773a] hover:text-white hover:border-solid hover:border-[#c8773a] transition-all"
          >
            + Add more photos
          </button>
        </div>
      )}
    </div>
  )
}
