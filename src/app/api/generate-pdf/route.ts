import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import sharp from 'sharp'

// A4 dimensions at 300 DPI (in points: 1 point = 1/72 inch)
const A4_WIDTH_PT = 595.28 // 210mm
const A4_HEIGHT_PT = 841.89 // 297mm
const DPI = 300
const MM_TO_PT = 2.83465 // 1mm = 2.83465 points

interface ImageInfo {
  base64: string
  width: number
  height: number
}

interface GeneratePDFRequest {
  images: ImageInfo[]
  settings: {
    width: number
    height: number
    spacing: number
    border: number
    backgroundColor?: string
  }
  removeBgApiKey?: string
}

// Parse hex color to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Default to white if invalid
  if (!hex || typeof hex !== 'string') {
    return { r: 255, g: 255, b: 255 }
  }
  
  // Remove # if present
  hex = hex.replace(/^#/, '')
  
  // Parse 6-digit hex
  if (hex.length === 6) {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    }
  }
  
  // Default to white if parsing fails
  return { r: 255, g: 255, b: 255 }
}

// Remove background using remove.bg API
async function removeBackground(imageBase64: string, apiKey: string): Promise<Buffer> {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    console.log('Calling remove.bg API...')
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
        format: 'png',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('remove.bg API error:', response.status, errorText)
      throw new Error(`remove.bg API error: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('Background removed successfully')
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Background removal error:', error)
    throw error
  }
}

// Process image: add custom background color and convert to JPEG
async function processImageForPdf(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number,
  border: number,
  hasTransparentBg: boolean = false,
  backgroundColor: string = '#ffffff'
): Promise<Buffer> {
  try {
    // Parse background color
    const bgColor = hexToRgb(backgroundColor)
    console.log(`Using background color: ${backgroundColor} -> RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`)
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const originalWidth = metadata.width || targetWidth
    const originalHeight = metadata.height || targetHeight
    
    // Calculate dimensions for the photo area (without border)
    const photoWidth = targetWidth
    const photoHeight = targetHeight
    const totalWidth = targetWidth + border * 2
    const totalHeight = targetHeight + border * 2
    
    console.log(`Original: ${originalWidth}x${originalHeight}, Target: ${photoWidth}x${photoHeight}, Total: ${totalWidth}x${totalHeight}`)
    
    if (hasTransparentBg || metadata.channels === 4) {
      // For transparent images (from remove.bg):
      // 1. Create full-size background canvas
      // 2. Resize image to fit within photo area
      // 3. Composite centered on background
      
      // Calculate resize to fit within photo area (not cover)
      const widthRatio = photoWidth / originalWidth
      const heightRatio = photoHeight / originalHeight
      const fitRatio = Math.min(widthRatio, heightRatio)
      
      const resizedWidth = Math.round(originalWidth * fitRatio)
      const resizedHeight = Math.round(originalHeight * fitRatio)
      
      // Resize the transparent image
      const resizedBuffer = await sharp(imageBuffer)
        .resize(resizedWidth, resizedHeight, {
          fit: 'inside',
          position: 'center'
        })
        .toBuffer()
      
      // Calculate position to center the image in photo area
      const offsetX = border + Math.round((photoWidth - resizedWidth) / 2)
      const offsetY = border + Math.round((photoHeight - resizedHeight) / 2)
      
      // Create full canvas with background color and composite the image
      const result = await sharp({
        create: {
          width: totalWidth,
          height: totalHeight,
          channels: 3,
          background: { r: bgColor.r, g: bgColor.g, b: bgColor.b }
        }
      })
        .composite([
          {
            input: resizedBuffer,
            top: offsetY,
            left: offsetX
          }
        ])
        .jpeg({ quality: 95 })
        .toBuffer()
      
      return result
    } else {
      // Normal processing - resize to cover and add border
      const result = await sharp(imageBuffer)
        .resize(photoWidth, photoHeight, {
          fit: 'cover',
          position: 'center',
        })
        .extend({
          top: border,
          bottom: border,
          left: border,
          right: border,
          background: { r: bgColor.r, g: bgColor.g, b: bgColor.b, alpha: 1 },
        })
        .jpeg({ quality: 95 })
        .toBuffer()
      
      return result
    }
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
): { cols: number; rows: number; photoWidthPt: number; photoHeightPt: number; spacingPt: number } {
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
    photoHeightPt,
    spacingPt
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePDFRequest = await request.json()
    const { images, settings, removeBgApiKey } = body

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    const pdfDoc = await PDFDocument.create()

    // Include border in dimensions
    const totalWidth = settings.width + settings.border * 2
    const totalHeight = settings.height + settings.border * 2

    const { cols, rows, photoWidthPt, photoHeightPt, spacingPt } = calculateGridLayout(
      totalWidth,
      totalHeight,
      settings.spacing
    )

    const photosPerPage = cols * rows
    const marginPt = 10 * MM_TO_PT

    console.log(`Layout: ${cols}x${rows} = ${photosPerPage} photos per page`)
    console.log(`Spacing: ${spacingPt} points`)
    console.log(`Total images: ${images.length}`)
    console.log(`Background removal: ${removeBgApiKey ? 'Enabled' : 'Disabled'}`)
    console.log(`Background color: ${settings.backgroundColor || '#ffffff'}`)

    // Process each image (with optional background removal)
    const processedImages: Buffer[] = []
    
    for (let i = 0; i < images.length; i++) {
      const imageInfo = images[i]
      const base64Data = imageInfo.base64.replace(/^data:image\/\w+;base64,/, '')
      let imageBuffer = Buffer.from(base64Data, 'base64')
      let hasTransparentBg = false

      // Remove background if API key is provided
      if (removeBgApiKey && removeBgApiKey.trim() !== '') {
        try {
          console.log(`Processing image ${i + 1}/${images.length} - removing background...`)
          imageBuffer = await removeBackground(imageInfo.base64, removeBgApiKey)
          hasTransparentBg = true
        } catch (error) {
          console.error(`Failed to remove background for image ${i + 1}:`, error)
          // Continue with original image
        }
      }

      // Process image for PDF with custom background color
      const processedBuffer = await processImageForPdf(
        imageBuffer,
        settings.width,
        settings.height,
        settings.border,
        hasTransparentBg,
        settings.backgroundColor
      )
      processedImages.push(processedBuffer)
    }

    // Generate PDF pages
    for (let i = 0; i < processedImages.length; i += photosPerPage) {
      const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])
      const pageImages = processedImages.slice(i, i + photosPerPage)

      for (let j = 0; j < pageImages.length; j++) {
        const row = Math.floor(j / cols)
        const col = j % cols

        const x = marginPt + col * (photoWidthPt + spacingPt)
        const y = A4_HEIGHT_PT - marginPt - (row + 1) * photoHeightPt - row * spacingPt

        try {
          // Embed as JPEG
          const image = await pdfDoc.embedJpg(pageImages[j])
          page.drawImage(image, {
            x,
            y,
            width: photoWidthPt,
            height: photoHeightPt,
          })
          
          // Draw black border around the image (slim border)
          // Inset by half the borderWidth so the stroke sits exactly on the edge
          const bw = 0.75
          const half = bw / 2
          page.drawRectangle({
            x: x + half,
            y: y + half,
            width: photoWidthPt - bw,
            height: photoHeightPt - bw,
            borderColor: rgb(0, 0, 0), // Black border
            borderWidth: bw,
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
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1,
          })
        }
      }
    }

    const pdfBytes = await pdfDoc.save()
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      pages: Math.ceil(processedImages.length / photosPerPage),
      layout: { cols, rows },
      backgroundRemoved: !!removeBgApiKey,
      backgroundColor: settings.backgroundColor || '#ffffff'
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: String(error) },
      { status: 500 }
    )
  }
}
