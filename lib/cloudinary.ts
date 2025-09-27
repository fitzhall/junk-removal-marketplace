import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })
}

export interface UploadResult {
  public_id: string
  secure_url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

export class CloudinaryService {
  private isConfigured: boolean

  constructor() {
    this.isConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  }

  async uploadImage(buffer: Buffer, options?: {
    folder?: string
    public_id?: string
    transformation?: any
  }): Promise<UploadResult | null> {
    if (!this.isConfigured) {
      console.warn('Cloudinary not configured, skipping image upload')
      return null
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options?.folder || 'junk-removal/quotes',
            resource_type: 'auto',
            public_id: options?.public_id,
            transformation: options?.transformation || [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error)
              reject(error)
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                created_at: result.created_at
              })
            } else {
              reject(new Error('No result from Cloudinary'))
            }
          }
        )

        uploadStream.end(buffer)
      })
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw error
    }
  }

  async uploadMultiple(buffers: Buffer[], folder?: string): Promise<UploadResult[]> {
    const uploads = buffers.map((buffer, index) =>
      this.uploadImage(buffer, {
        folder,
        public_id: `${Date.now()}_${index}`
      })
    )

    const results = await Promise.allSettled(uploads)

    return results
      .filter((result): result is PromiseFulfilledResult<UploadResult | null> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as UploadResult)
  }

  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok'
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error)
      return false
    }
  }

  getOptimizedUrl(publicId: string, options?: {
    width?: number
    height?: number
    quality?: string
  }): string {
    if (!this.isConfigured) {
      return ''
    }

    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width || 800,
          height: options?.height || 600,
          crop: 'fill',
          quality: options?.quality || 'auto',
          fetch_format: 'auto'
        }
      ]
    })
  }
}

export const cloudinaryService = new CloudinaryService()