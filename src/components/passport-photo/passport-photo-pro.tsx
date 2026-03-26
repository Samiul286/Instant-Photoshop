'use client'

import { useState, useCallback } from 'react'
import { usePassportStore, generateId, type PhotoItem } from '@/store/passport-store'
import { ImageCropper } from '@/components/passport-photo/image-cropper'
import { AdvancedOptions } from '@/components/passport-photo/advanced-options'
import { FeedbackForm } from '@/components/passport-photo/feedback-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDropzone } from 'react-dropzone'
import { 
  Camera, 
  FileDown, 
  Loader2, 
  MessageSquare, 
  ChevronDown,
  Check,
  Upload,
  Crop as CropIcon,
  X,
  Eye,
  EyeOff,
  Key
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function PhotoUploader() {
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
              className="flex items-center gap-3.5 bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-3 transition-all hover:border-[#eeddc8] animate-slide-in"
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
                  className="w-[60px] py-1.5 text-center border-2 border-[#d6cfc2] rounded-lg bg-white text-sm font-semibold text-[#1c1a17] focus:outline-none focus:border-[#c8773a]"
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

export function PassportPhotoPro() {
  const { 
    photos, 
    advancedSettings, 
    ui, 
    setUIState, 
    clearAllPhotos,
    setGeneratedPdfUrl,
    generatedPdfUrl
  } = usePassportStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const { removeBgApiKey, setRemoveBgApiKey } = usePassportStore()

  const totalPhotos = usePassportStore.getState().getTotalPhotos()

  const handleGenerateSheet = useCallback(async () => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo')
      return
    }

    setUIState({ isGeneratingPDF: true, processingProgress: 0 })

    try {
      const processedImages: { base64: string; width: number; height: number }[] = []

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const progress = ((i + 1) / photos.length) * 50
        setUIState({ processingProgress: progress })

        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const width = advancedSettings.width + advancedSettings.border * 2
            const height = advancedSettings.height + advancedSettings.border * 2
            
            canvas.width = width
            canvas.height = height
            
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('Could not get canvas context'))
              return
            }

            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)

            const scale = Math.min(
              (width - advancedSettings.border * 2) / img.width,
              (height - advancedSettings.border * 2) / img.height
            )
            const scaledWidth = img.width * scale
            const scaledHeight = img.height * scale
            const x = (width - scaledWidth) / 2
            const y = (height - scaledHeight) / 2

            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

            const base64 = canvas.toDataURL('image/jpeg', 0.95)
            for (let c = 0; c < photo.copies; c++) {
              processedImages.push({ base64, width, height })
            }
            
            resolve()
          }
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = photo.croppedPreview || photo.preview
        })
      }

      setUIState({ processingProgress: 60 })

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: processedImages,
          settings: advancedSettings,
          removeBgApiKey: removeBgApiKey || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate PDF (${response.status})`)
      }

      const result = await response.json()
      
      if (!result.pdf) {
        throw new Error('No PDF data received from server')
      }
      
      setUIState({ processingProgress: 100 })
      
      // Convert base64 to binary in browser
      try {
        const binaryString = atob(result.pdf)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        
        console.log('PDF generated:', {
          size: bytes.length,
          pages: result.pages,
          layout: result.layout,
          backgroundRemoved: result.backgroundRemoved,
          backgroundColor: result.backgroundColor
        })
        
        setGeneratedPdfUrl(url)
        toast.success('PDF generated successfully!')
      } catch (decodeError) {
        console.error('PDF decode error:', decodeError)
        throw new Error('Failed to process PDF data')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setUIState({ isGeneratingPDF: false, processingProgress: 0 })
    }
  }, [photos, advancedSettings, setUIState, setGeneratedPdfUrl, removeBgApiKey])

  const handleDownload = useCallback(() => {
    if (generatedPdfUrl) {
      const a = document.createElement('a')
      a.href = generatedPdfUrl
      a.download = 'passport-photos.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [generatedPdfUrl])

  const handleClearAll = useCallback(() => {
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl)
    }
    clearAllPhotos()
    setGeneratedPdfUrl(null)
  }, [generatedPdfUrl, clearAllPhotos, setGeneratedPdfUrl])

  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf7f2]/92 backdrop-blur-xl border-b border-[#d6cfc2]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] bg-[#c8773a] rounded-[9px] flex items-center justify-center">
              <Camera className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-playfair text-lg text-[#1c1a17] tracking-tight">
              Passport <span className="text-[#c8773a]">Photo</span> Pro
            </span>
          </div>
          <span className="text-[0.7rem] font-semibold tracking-widest uppercase bg-[#fdf1e8] text-[#c8773a] border border-[#eeddc8] px-3 py-1 rounded-full">
            Beta
          </span>
        </div>
      </header>

      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-[#c8773a] to-[#e08040] text-white py-2 px-6 text-sm font-medium overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          🚧 &nbsp; This site is currently in beta. If you encounter any issues, please use the feedback button to report them. Thank you for your patience!
        </div>
      </div>

      {/* Main */}
      <main className="max-w-[760px] mx-auto px-6 py-12 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold tracking-[0.12em] uppercase text-[#c8773a] mb-3">
            ✦ Professional Results at Home
          </span>
          <h1 className="font-playfair text-3xl md:text-4xl font-extrabold text-[#1c1a17] leading-tight tracking-tight mb-4">
            Create perfect <em className="italic text-[#c8773a]">passport photos</em> in seconds
          </h1>
          <p className="text-base text-[#8a8178] font-light max-w-md mx-auto leading-relaxed">
            Upload your photo, crop to size, and generate a print-ready sheet on A4.
          </p>
        </div>

        {/* API Key Card */}
        <div className="bg-white border border-[#d6cfc2] rounded-[14px] p-7 shadow-[0_4px_20px_rgba(28,26,23,0.08)] mb-4">
          {/* Card Title */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8a8178] mb-4">
            <Key className="w-3.5 h-3.5 text-[#c8773a]" />
            Remove.bg API Key
            <div className="flex-1 h-px bg-[#e8e2d6]" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={removeBgApiKey}
                onChange={(e) => setRemoveBgApiKey(e.target.value)}
                placeholder="Paste your remove.bg API key here…"
                autoComplete="off"
                spellCheck={false}
                className="w-full py-2.5 px-3.5 pr-10 border-2 border-[#d6cfc2] rounded-lg bg-[#faf7f2] text-sm text-[#1c1a17] placeholder:text-[#8a8178] focus:outline-none focus:border-[#c8773a] focus:ring-2 focus:ring-[rgba(200,119,58,0.12)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8178] hover:text-[#c8773a] transition-colors"
                title="Toggle visibility"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-[#8a8178] mt-2">
            Your key is sent directly to the server for this request and never stored. &nbsp;
            <a 
              href="https://www.remove.bg/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#c8773a] hover:underline"
            >
              Get a free API key →
            </a>
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white border border-[#d6cfc2] rounded-[14px] p-7 shadow-[0_4px_20px_rgba(28,26,23,0.08)] mb-4">
          {/* Card Title */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#8a8178] mb-4">
            <Camera className="w-3.5 h-3.5 text-[#c8773a]" />
            Upload Photos
            <div className="flex-1 h-px bg-[#e8e2d6]" />
          </div>

          <PhotoUploader />

          {/* Advanced Options */}
          <div className="mt-5">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center gap-1.5 text-sm text-[#8a8178] hover:text-[#c8773a] transition-colors mx-auto"
            >
              Advanced options
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showAdvanced && "rotate-180")} />
            </button>
            {showAdvanced && <AdvancedOptions />}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <Button
              onClick={handleGenerateSheet}
              disabled={photos.length === 0 || ui.isGeneratingPDF}
              className="flex-1 h-12 bg-[#c8773a] hover:bg-[#b36832] text-white text-[0.95rem] font-semibold rounded-lg transition-all shadow-[0_4px_14px_rgba(200,119,58,0.3)] hover:shadow-[0_6px_20px_rgba(200,119,58,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {ui.isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Generate Sheet
                </>
              )}
            </Button>
            
            {generatedPdfUrl && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 h-12 bg-[#e8f5ee] text-[#3a8c5c] border-[#b3dcc4] hover:bg-[#3a8c5c] hover:text-white hover:border-[#3a8c5c] text-[0.95rem] font-semibold rounded-lg transition-all"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>

          {/* Loading */}
          {ui.isGeneratingPDF && (
            <div className="flex items-center justify-center gap-2.5 text-sm text-[#c8773a] font-medium mt-4">
              <div className="w-[18px] h-[18px] border-2 border-[#eeddc8] border-t-[#c8773a] rounded-full animate-spin" />
              Processing images — this may take a moment…
            </div>
          )}

          {/* PDF Preview */}
          {generatedPdfUrl && (
            <div className="mt-5">
              <div className="bg-[#faf7f2] border border-[#d6cfc2] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#1c1a17]">PDF Preview</span>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-[#c8773a] hover:bg-[#b36832] text-white text-xs"
                  >
                    <FileDown className="w-3.5 h-3.5 mr-1.5" />
                    Download PDF
                  </Button>
                </div>
                <object
                  data={generatedPdfUrl}
                  type="application/pdf"
                  className="w-full h-[480px] rounded border border-[#d6cfc2] bg-white"
                >
                  <div className="flex flex-col items-center justify-center h-full bg-[#fffef5] rounded p-8">
                    <FileDown className="w-12 h-12 text-[#c8773a] mb-3" />
                    <p className="text-sm text-[#4a4540] mb-2">PDF preview not available in this browser</p>
                    <p className="text-xs text-[#8a8178]">Click "Download PDF" to save and view the file</p>
                  </div>
                </object>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {photos.length > 0 && (
          <div className="text-center text-sm text-[#8a8178]">
            <span className="font-semibold text-[#1c1a17]">{photos.length}</span> photo{photos.length !== 1 ? 's' : ''} uploaded
            <span className="mx-2 text-[#d6cfc2]">·</span>
            <span className="font-semibold text-[#1c1a17]">{totalPhotos}</span> total copies
          </div>
        )}
      </main>

      {/* Feedback Button */}
      <button
        onClick={() => setUIState({ showFeedback: true })}
        className="fixed bottom-6 left-6 w-[52px] h-[52px] bg-[#c8773a] text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(200,119,58,0.4)] hover:bg-[#b36832] hover:scale-[1.08] transition-all z-50"
        title="Send feedback"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Clear All Button */}
      {photos.length > 0 && (
        <button
          onClick={handleClearAll}
          className="fixed bottom-6 right-6 bg-[#f0ebe1] text-[#4a4540] rounded-full px-4 py-3 text-sm font-medium shadow-md hover:bg-[#e8e2d6] transition-all z-50"
        >
          Clear All
        </button>
      )}

      {/* Modals */}
      <ImageCropper />
      <FeedbackForm />
    </div>
  )
}
