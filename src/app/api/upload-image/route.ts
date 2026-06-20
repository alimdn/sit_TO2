import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/upload-image
 *
 * Uploads an image to Cloudinary. Supports two modes:
 *
 * 1. URL upload:  { "url": "https://example.com/image.png" }
 *    → Cloudinary fetches the image from the URL and stores it.
 *
 * 2. Base64 upload: { "base64": "data:image/png;base64,iVBOR..." }
 *    → Cloudinary stores the base64-encoded image directly.
 *
 * Both modes return:
 *   { "url": "https://res.cloudinary.com/.../upload/v.../templates/xxx.png",
 *     "publicId": "templates/xxx" }
 *
 * The image is stored in a "templates" folder in the Cloudinary account
 * for easy organization.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, base64, folder } = body

    if (!url && !base64) {
      return NextResponse.json(
        { error: 'Either "url" or "base64" is required' },
        { status: 400 }
      )
    }

    // Configure Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL?.split('@')[1]
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary not configured — missing CLOUDINARY_CLOUD_NAME' },
        { status: 500 }
      )
    }

    // Use the CLOUDINARY_URL env var if individual vars aren't set
    // The cloudinary npm package auto-reads CLOUDINARY_URL
    let cloudinary: any
    try {
      cloudinary = (await import('cloudinary')).default.v2 || (await import('cloudinary')).default
      // If using individual env vars, configure explicitly
      if (apiKey && apiSecret) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        })
      }
      // If using CLOUDINARY_URL, the package reads it automatically
    } catch (e) {
      console.error('Cloudinary import error:', e)
      return NextResponse.json(
        { error: 'Cloudinary package not available' },
        { status: 500 }
      )
    }

    const uploadFolder = folder || 'templates'

    // Upload to Cloudinary
    const uploadOptions: any = {
      folder: uploadFolder,
      resource_type: 'image',
      // Generate a unique public_id based on timestamp
      public_id: `${uploadFolder}_${Date.now()}`,
      // Auto-tag for easy management
      tags: [uploadFolder, 'webflowsub'],
      // Overwrite if same public_id exists
      overwrite: false,
      // Generate eager transformations for common sizes
      eager: [
        { width: 400, height: 250, crop: 'fill', quality: 'auto' },  // thumbnail
        { width: 800, height: 500, crop: 'fill', quality: 'auto' },  // card
        { width: 1280, height: 800, crop: 'fill', quality: 'auto' }, // preview
      ],
    }

    let result
    if (url) {
      // Upload from remote URL — Cloudinary fetches it
      result = await cloudinary.uploader.upload(url, uploadOptions)
    } else {
      // Upload from base64 string
      result = await cloudinary.uploader.upload(base64, uploadOptions)
    }

    // Return the optimized URL (auto format + auto quality)
    const optimizedUrl = cloudinary.url(result.public_id, {
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    })

    return NextResponse.json({
      url: optimizedUrl,
      publicId: result.public_id,
      originalUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    })
  } catch (e: any) {
    console.error('Upload image error:', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
