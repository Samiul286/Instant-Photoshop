'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFPreviewProps {
  pdfUrl: string | null
  open: boolean
  onClose: () => void
}

export function PDFPreview({ pdfUrl, open, onClose }: PDFPreviewProps) {
  const [scale, setScale] = useState(1)

  if (!pdfUrl) return null

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = 'passport-photos.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-auto bg-muted/50 rounded-lg p-4" style={{ maxHeight: '70vh' }}>
          <div 
            className="mx-auto origin-top-left transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="595"
              height="842"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
