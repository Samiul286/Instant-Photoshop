import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import sharp from 'sharp'

// A4 dimensions at 300 DPI (in points: 1 point = 1/72 inch)
const A4_WIDTH_PT = 595.28 // 210mm
const A4_HEIGHT_PT = 841.89 // 297mm
const DPI = 300
const MM_TO_PT = 2.83465 // 1mm = 2.83465 points

interface PhotoData {
  imageData: string // base64
  copies: number
}

interface ProcessRequest {
  photos: PhotoData[]
  settings: {
    width: number
    height: number
    spacing: number
    border: number
  }
}

// Remove background using remove.bg API
async function removeBackground(imageBase64: string): Promise<Buffer> {
  const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY
  
  // If no API key, return the original image with a white background
  if (!REMOVE_BG_API_KEY) {
    console.log('No remove.bg API key, skipping background removal')
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
        format: 'png',
      }),
    })

    if (!response.ok) {
      console.error('remove.bg API error:', response.status)
      // Return original image on error
      return Buffer.from(base64Data, 'base64')
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Background removal error:', error)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  }
}

// Enhance image using Cloudinary API
async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

  // If no Cloudinary credentials, skip enhancement
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.log('No Cloudinary credentials, skipping image enhancement')
    return imageBuffer
  }

  try {
    // Upload to Cloudinary with enhancement transformation
    const formData = new FormData()
    formData.append('file', `data:image/png;base64,${imageBuffer.toString('base64')}`)
    formData.append('upload_preset', 'passport_photos') // You need to create this preset
    formData.append('transformation', 'e_gen_restore') // AI enhancement

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!uploadResponse.ok) {
      console.error('Cloudinary upload error:', uploadResponse.status)
      return imageBuffer
    }

    const uploadResult = await uploadResponse.json()
    const secureUrl = uploadResult.secure_url

    // Download the enhanced image
    const imageResponse = await fetch(secureUrl)
    const enhancedBuffer = Buffer.from(await imageResponse.arrayBuffer())
    
    return enhancedBuffer
  } catch (error) {
    console.error('Image enhancement error:', error)
    return imageBuffer
  }
}

// Process single image: resize, add border
async function processImage(
  imageBuffer: Buffer,
  width: number,
  height: number,
  border: number
): Promise<Buffer> {
  try {
    // Resize and add border
    const processedImage = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .extend({
        top: border,
        bottom: border,
        left: border,
        right: border,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 95 })
      .toBuffer()

    return processedImage
  } catch (error) {
    console.error('Image processing error:', error)
    throw error
  }
}

// Calculate grid layout for photos on A4 page
function calculateGridLayout(
  photoWidthPx: number,
  photoHeightPx: number,
  spacingPx: number
): { cols: number; rows: number; photoWidthPt: number; photoHeightPt: number } {
  // Convert pixel dimensions to points (assuming 300 DPI)
  const photoWidthPt = (photoWidthPx / DPI) * 72
  const photoHeightPt = (photoHeightPx / DPI) * 72
  const spacingPt = (spacingPx / DPI) * 72

  // Calculate margins (10mm on each side)
  const marginPt = 10 * MM_TO_PT
  const availableWidth = A4_WIDTH_PT - 2 * marginPt
  const availableHeight = A4_HEIGHT_PT - 2 * marginPt

  // Calculate how many photos fit
  const cols = Math.floor((availableWidth + spacingPt) / (photoWidthPt + spacingPt))
  const rows = Math.floor((availableHeight + spacingPt) / (photoHeightPt + spacingPt))

  return { 
    cols: Math.max(1, cols), 
    rows: Math.max(1, rows), 
    photoWidthPt, 
    photoHeightPt 
  }
}

// Generate PDF with all photos
async function generatePDF(
  processedPhotos: Buffer[],
  settings: { width: number; height: number; spacing: number; border: number }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  
  const { cols, rows, photoWidthPt, photoHeightPt } = calculateGridLayout(
    settings.width + settings.border * 2,
    settings.height + settings.border * 2,
    settings.spacing
  )
  
  const photosPerPage = cols * rows
  const marginPt = 10 * MM_TO_PT
  const spacingPt = (settings.spacing / DPI) * 72

  // Process photos in pages
  for (let i = 0; i < processedPhotos.length; i += photosPerPage) {
    const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
    const pagePhotos = processedPhotos.slice(i, i + photosPerPage)

    for (let j = 0; j < pagePhotos.length; j++) {
      const row = Math.floor(j / cols)
      const col = j % cols

      const x = marginPt + col * (photoWidthPt + spacingPt)
      const y = A4_HEIGHT_PT - marginPt - (row + 1) * photoHeightPt - row * spacingPt

      try {
        const image = await pdfDoc.embedJpg(pagePhotos[j])
        page.drawImage(image, {
          x,
          y,
          width: photoWidthPt,
          height: photoHeightPt,
        })
      } catch (error) {
        console.error('Error embedding image in PDF:', error)
        // Draw a placeholder rectangle if image fails
        page.drawRectangle({
          x,
          y,
          width: photoWidthPt,
          height: photoHeightPt,
          color: rgb(0.9, 0.9, 0.9),
        })
      }
    }
  }

  return Buffer.from(await pdfDoc.save())
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessRequest = await request.json()
    const { photos, settings } = body

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    // Process each photo
    const processedPhotos: Buffer[] = []

    for (const photo of photos) {
      // 1. Remove background
      const bgRemovedBuffer = await removeBackground(photo.imageData)

      // 2. Enhance image
      const enhancedBuffer = await enhanceImage(bgRemovedBuffer)

      // 3. Resize and add border
      const processedBuffer = await processImage(
        enhancedBuffer,
        settings.width,
        settings.height,
        settings.border
      )

      // 4. Add copies
      for (let i = 0; i < photo.copies; i++) {
        processedPhotos.push(processedBuffer)
      }
    }

    // 5. Generate PDF
    const pdfBuffer = await generatePDF(processedPhotos, settings)

    // Return PDF as base64
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="passport-photos.pdf"',
      },
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process photos' },
      { status: 500 }
    )
  }
}
