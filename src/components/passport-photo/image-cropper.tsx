'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePassportStore } from '@/store/passport-store'
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCw } from 'lucide-react'

const PASSPORT_ASPECT = 384 / 472

// Default values
const DEFAULT_ZOOM = 1
const DEFAULT_ROTATION = 0

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function CropperContent() {
  const { photos, selectedPhotoId, setUIState, updatePhoto } = usePassportStore()
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [rotation, setRotation] = useState(DEFAULT_ROTATION)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedPhoto = photos.find(p => p.id === selectedPhotoId)

  // Reset zoom and rotation when photo changes
  useEffect(() => {
    setZoom(DEFAULT_ZOOM)
    setRotation(DEFAULT_ROTATION)
  }, [selectedPhotoId])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, PASSPORT_ASPECT))
  }, [])

  const handleClose = () => {
    setUIState({ showCropper: false })
  }

  const handleReset = () => {
    setZoom(DEFAULT_ZOOM)
    setRotation(DEFAULT_ROTATION)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, PASSPORT_ASPECT))
    }
  }

  const handleZoomChange = (value: number) => {
    setZoom(Math.max(0.5, Math.min(3, value)))
  }

  const handleRotationChange = (value: number) => {
    setRotation(value)
  }

  const handleApplyCrop = async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    
    if (!image || !previewCanvas || !completedCrop || !selectedPhotoId) {
      return
    }

    const ctx = previewCanvas.getContext('2d')
    if (!ctx) return

    // Get the displayed image dimensions
    const displayedWidth = image.width
    const displayedHeight = image.height
    
    // Scale factors to convert from displayed coordinates to natural coordinates
    const scaleX = image.naturalWidth / displayedWidth
    const scaleY = image.naturalHeight / displayedHeight
    
    // Crop coordinates in natural image space (accounting for zoom in the display)
    // The crop coordinates are already in the zoomed space, so we need to adjust them
    const cropX = (completedCrop.x * scaleX) / zoom
    const cropY = (completedCrop.y * scaleY) / zoom
    const cropWidth = (completedCrop.width * scaleX) / zoom
    const cropHeight = (completedCrop.height * scaleY) / zoom

    const outputWidth = 400
    const outputHeight = 480
    previewCanvas.width = outputWidth
    previewCanvas.height = outputHeight

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outputWidth, outputHeight)

    // Save context state
    ctx.save()

    // Translate to center, apply rotation, translate back
    ctx.translate(outputWidth / 2, outputHeight / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-outputWidth / 2, -outputHeight / 2)

    // Draw the cropped and transformed image (no additional zoom needed)
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    )

    // Restore context state
    ctx.restore()

    previewCanvas.toBlob((blob) => {
      if (blob && selectedPhotoId) {
        const croppedPreview = URL.createObjectURL(blob)
        updatePhoto(selectedPhotoId, { 
          croppedPreview,
          cropData: completedCrop 
        })
        handleClose()
      }
    }, 'image/png')
  }

  if (!selectedPhoto) return null

  return (
    <>
      {/* Crop Area */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-[#d6cfc2] bg-[#faf7f2]"
        style={{ height: '350px' }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={PASSPORT_ASPECT}
          className="h-full"
        >
          <img
            ref={imgRef}
            src={selectedPhoto.preview}
            alt="Crop preview"
            onLoad={onImageLoad}
            className="max-w-full transition-transform duration-150 ease-out"
            style={{ 
              maxHeight: '350px',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </ReactCrop>
      </div>

      {/* Zoom Control */}
      <div className="mt-4 bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-3">
        <div className="flex items-center gap-3 mb-3">
          <ZoomOut className="w-4 h-4 text-[#8a8178]" />
          <span className="text-xs font-semibold text-[#4a4540] uppercase tracking-wide flex-1">
            Zoom
          </span>
          <span className="text-xs text-[#8a8178] w-12 text-right">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomIn className="w-4 h-4 text-[#8a8178]" />
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.05"
          value={zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#e8e2d6] rounded-lg appearance-none cursor-pointer accent-[#c8773a]"
        />
      </div>

      {/* Rotation Control */}
      <div className="mt-3 bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-3">
        <div className="flex items-center gap-3 mb-3">
          <RotateCcw className="w-4 h-4 text-[#8a8178]" />
          <span className="text-xs font-semibold text-[#4a4540] uppercase tracking-wide flex-1">
            Rotation
          </span>
          <span className="text-xs text-[#8a8178] w-12 text-right">
            {rotation}°
          </span>
          <RotateCw className="w-4 h-4 text-[#8a8178]" />
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={rotation}
          onChange={(e) => handleRotationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#e8e2d6] rounded-lg appearance-none cursor-pointer accent-[#c8773a]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 mt-4 justify-between">
        <Button
          onClick={handleReset}
          className="py-2.5 px-4 bg-[#fff0ef] text-[#c0392b] border border-[#f5c5c1] rounded-lg text-sm font-semibold hover:bg-[#c0392b] hover:text-white hover:border-[#c0392b] transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
        <div className="flex gap-2.5">
          <Button
            onClick={handleClose}
            className="py-2.5 px-5 bg-[#f0ebe1] text-[#4a4540] border border-[#d6cfc2] rounded-lg text-sm font-semibold hover:bg-[#e8e2d6] transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyCrop}
            className="py-2.5 px-5 bg-[#c8773a] text-white rounded-lg text-sm font-semibold hover:bg-[#b36832] transition-all"
          >
            Crop & Save
          </Button>
        </div>
      </div>
      <canvas ref={previewCanvasRef} className="hidden" />
    </>
  )
}

export function ImageCropper() {
  const { photos, selectedPhotoId, ui, setUIState } = usePassportStore()
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId)

  const handleClose = () => {
    setUIState({ showCropper: false })
  }

  if (!selectedPhoto) return null

  return (
    <Dialog open={ui.showCropper} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-white border border-[#d6cfc2] rounded-[14px] max-w-lg p-6 shadow-[0_12px_48px_rgba(28,26,23,0.12)]">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-playfair text-xl font-bold text-[#1c1a17]">
            Crop Photo
          </DialogTitle>
          <p className="text-xs text-[#8a8178] mt-1">
            Adjust the crop area, zoom, and rotation. Click "Crop & Save" when done.
          </p>
        </DialogHeader>
        
        <CropperContent key={selectedPhotoId} />
      </DialogContent>
    </Dialog>
  )
}
