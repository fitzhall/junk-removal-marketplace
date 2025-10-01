import { ImageAnnotatorClient } from '@google-cloud/vision'

// Junk item categories with typical sizes and pricing
const JUNK_CATEGORIES = {
  // Furniture
  'couch': { category: 'furniture', size: 'large', basePrice: 75, volume: 0.3 },
  'sofa': { category: 'furniture', size: 'large', basePrice: 75, volume: 0.3 },
  'chair': { category: 'furniture', size: 'medium', basePrice: 25, volume: 0.1 },
  'table': { category: 'furniture', size: 'medium', basePrice: 40, volume: 0.15 },
  'desk': { category: 'furniture', size: 'medium', basePrice: 40, volume: 0.15 },
  'bed': { category: 'furniture', size: 'large', basePrice: 80, volume: 0.35 },
  'mattress': { category: 'furniture', size: 'large', basePrice: 60, volume: 0.25 },
  'dresser': { category: 'furniture', size: 'large', basePrice: 50, volume: 0.2 },
  'bookshelf': { category: 'furniture', size: 'medium', basePrice: 35, volume: 0.15 },
  'cabinet': { category: 'furniture', size: 'medium', basePrice: 35, volume: 0.15 },

  // Appliances
  'refrigerator': { category: 'appliance', size: 'large', basePrice: 100, volume: 0.4, special: true },
  'fridge': { category: 'appliance', size: 'large', basePrice: 100, volume: 0.4, special: true },
  'washer': { category: 'appliance', size: 'large', basePrice: 75, volume: 0.25, special: true },
  'dryer': { category: 'appliance', size: 'large', basePrice: 75, volume: 0.25, special: true },
  'dishwasher': { category: 'appliance', size: 'large', basePrice: 65, volume: 0.2, special: true },
  'microwave': { category: 'appliance', size: 'small', basePrice: 20, volume: 0.05 },
  'oven': { category: 'appliance', size: 'large', basePrice: 85, volume: 0.3, special: true },
  'stove': { category: 'appliance', size: 'large', basePrice: 85, volume: 0.3, special: true },

  // Electronics
  'television': { category: 'electronics', size: 'medium', basePrice: 35, volume: 0.1 },
  'tv': { category: 'electronics', size: 'medium', basePrice: 35, volume: 0.1 },
  'computer': { category: 'electronics', size: 'small', basePrice: 25, volume: 0.05 },
  'monitor': { category: 'electronics', size: 'small', basePrice: 20, volume: 0.05 },
  'printer': { category: 'electronics', size: 'small', basePrice: 20, volume: 0.05 },

  // General items - Updated with more realistic pricing
  'box': { category: 'general', size: 'small', basePrice: 15, volume: 0.02 },
  'boxes': { category: 'general', size: 'small', basePrice: 20, volume: 0.03 },
  'bag': { category: 'general', size: 'small', basePrice: 10, volume: 0.01 },
  'trash': { category: 'general', size: 'small', basePrice: 25, volume: 0.02 },
  'garbage': { category: 'general', size: 'small', basePrice: 25, volume: 0.02 },
  'bicycle': { category: 'general', size: 'medium', basePrice: 35, volume: 0.1 },
  'bike': { category: 'general', size: 'medium', basePrice: 35, volume: 0.1 },
  'rug': { category: 'general', size: 'medium', basePrice: 30, volume: 0.05 },
  'carpet': { category: 'general', size: 'medium', basePrice: 30, volume: 0.05 },
  'clothes': { category: 'general', size: 'small', basePrice: 20, volume: 0.02 },
  'clothing': { category: 'general', size: 'small', basePrice: 20, volume: 0.02 },
  'toys': { category: 'general', size: 'small', basePrice: 25, volume: 0.03 },
  'books': { category: 'general', size: 'small', basePrice: 20, volume: 0.02 },
  'lamp': { category: 'general', size: 'small', basePrice: 20, volume: 0.02 },
  'mirror': { category: 'general', size: 'medium', basePrice: 35, volume: 0.05 },
  'shelf': { category: 'general', size: 'medium', basePrice: 40, volume: 0.1 },
  'shelves': { category: 'general', size: 'medium', basePrice: 45, volume: 0.12 },
  'storage': { category: 'general', size: 'medium', basePrice: 50, volume: 0.15 },

  // Construction debris
  'wood': { category: 'construction', size: 'varies', basePrice: 30, volume: 0.1 },
  'lumber': { category: 'construction', size: 'varies', basePrice: 30, volume: 0.1 },
  'drywall': { category: 'construction', size: 'varies', basePrice: 40, volume: 0.15, special: true },
  'concrete': { category: 'construction', size: 'varies', basePrice: 60, volume: 0.2, special: true },
  'tile': { category: 'construction', size: 'varies', basePrice: 35, volume: 0.1 },
}

interface DetectedItem {
  name: string
  confidence: number
  category: string
  basePrice: number
  volume: number
  requiresSpecialHandling: boolean
  quantity: number
}

export class VisionAIService {
  private client: ImageAnnotatorClient

  constructor() {
    // Initialize with service account credentials
    console.log('VisionAIService initializing...')

    // Prioritize individual env vars (for new credentials) over file path
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.log('Using individual env vars for project:', process.env.GOOGLE_CLOUD_PROJECT_ID)

      // Fix private key format - Vercel might escape newlines
      const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY
        .replace(/\\n/g, '\n')  // Replace escaped newlines
        .replace(/\n\n/g, '\n') // Remove double newlines

      // Ensure proper format
      if (!privateKey.includes('-----BEGIN')) {
        throw new Error('Invalid private key format - missing BEGIN marker')
      }

      this.client = new ImageAnnotatorClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: {
          type: 'service_account',
          project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: privateKey,
        }
      })
      console.log('VisionAIService initialized with env vars')
    } else if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      console.log('Using credentials file:', process.env.GOOGLE_CLOUD_CREDENTIALS)
      this.client = new ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS
      })
    } else {
      throw new Error('Google Cloud credentials not configured')
    }

    // Test the client can be created
    console.log('Testing Vision API client...')
    this.testConnection().catch(err => {
      console.error('Vision API test failed:', err)
    })
  }

  async testConnection() {
    try {
      // Try to make a simple API call to verify credentials work
      const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      await this.client.annotateImage({
        image: { content: testImage.toString('base64') },
        features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
      })
      console.log('Vision API test successful!')
    } catch (error: any) {
      console.error('Vision API test failed:', {
        message: error.message,
        code: error.code,
        details: error.details
      })
      throw error
    }
  }

  async analyzeImage(imageBuffer: Buffer): Promise<{
    items: DetectedItem[]
    totalVolume: number
    estimatedPrice: { min: number; max: number }
    requiresSpecialHandling: boolean
  }> {
    return this.analyzeImages([imageBuffer])
  }

  async analyzeImages(imageBuffers: Buffer[]): Promise<{
    items: DetectedItem[]
    totalVolume: number
    estimatedPrice: { min: number; max: number }
    requiresSpecialHandling: boolean
  }> {
    try {
      const globalItemCounts = new Map<string, DetectedItem>()

      console.log(`Analyzing ${imageBuffers.length} images...`)

      // Analyze each image
      for (let i = 0; i < imageBuffers.length; i++) {
        console.log(`Processing image ${i + 1}/${imageBuffers.length}`)

        // Perform multiple detection types for better accuracy
        const [result] = await this.client.annotateImage({
          image: { content: imageBuffers[i].toString('base64') },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            { type: 'TEXT_DETECTION', maxResults: 10 }
          ]
        })

      // Process object localization (more accurate for counting)
      if (result.localizedObjectAnnotations) {
        console.log('Detected objects from Vision API:')
        for (const object of result.localizedObjectAnnotations) {
          const objectName = object.name?.toLowerCase() || ''
          const confidence = object.score || 0
          console.log(`  - ${object.name} (confidence: ${(confidence * 100).toFixed(1)}%)`)

          let matched = false
          // Check if this object matches our junk categories
          for (const [key, details] of Object.entries(JUNK_CATEGORIES)) {
            if (objectName.includes(key) || key.includes(objectName)) {
              const currentCount = itemCounts.get(key) || 0
              itemCounts.set(key, currentCount + 1)

              if (currentCount === 0) { // Only add once, but track quantity
                detectedItems.push({
                  name: key,
                  confidence,
                  category: details.category,
                  basePrice: details.basePrice,
                  volume: details.volume,
                  requiresSpecialHandling: (details as any).special || false,
                  quantity: 1
                })
              }
              matched = true
              break
            }
          }

          // If no match in our categories, still track it as general furniture/item
          if (!matched && confidence > 0.5) {
            // Estimate pricing based on common item types
            let estimatedPrice = 75 // Default mid-range price
            let estimatedVolume = 0.2

            // Check for furniture-related words
            if (objectName.includes('furniture') || objectName.includes('seat') ||
                objectName.includes('storage') || objectName.includes('shelf')) {
              estimatedPrice = 85
              estimatedVolume = 0.25
            }

            detectedItems.push({
              name: objectName || 'detected item',
              confidence,
              category: 'general',
              basePrice: estimatedPrice,
              volume: estimatedVolume,
              requiresSpecialHandling: false,
              quantity: 1
            })
            console.log(`  Added unmatched item: ${objectName} with estimated price: $${estimatedPrice}`)
          }
        }
      }

      // Process labels as fallback
      if (result.labelAnnotations && detectedItems.length === 0) {
        for (const label of result.labelAnnotations) {
          const labelName = label.description?.toLowerCase() || ''
          const confidence = label.score || 0

          for (const [key, details] of Object.entries(JUNK_CATEGORIES)) {
            if (labelName.includes(key) || key.includes(labelName)) {
              if (!itemCounts.has(key)) {
                itemCounts.set(key, 1)
                detectedItems.push({
                  name: key,
                  confidence,
                  category: details.category,
                  basePrice: details.basePrice,
                  volume: details.volume,
                  requiresSpecialHandling: (details as any).special || false,
                  quantity: 1
                })
              }
              break
            }
          }
        }
      }

      // Update quantities
      detectedItems.forEach(item => {
        item.quantity = itemCounts.get(item.name) || 1
      })

      // If no specific items detected, provide more realistic minimum pricing
      if (detectedItems.length === 0) {
        console.log('No specific items detected, using minimum service pricing')
        // Minimum service call for junk removal is typically $150-200
        detectedItems.push({
          name: 'miscellaneous junk load',
          confidence: 0.5,
          category: 'general',
          basePrice: 175, // Realistic minimum for a junk removal service call
          volume: 0.5, // Assume half truck load
          requiresSpecialHandling: false,
          quantity: 1
        })
      }

      // Calculate totals
      const totalVolume = detectedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0)
      let baseTotal = detectedItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0)

      // Apply minimum service fee (typical for junk removal industry)
      const MINIMUM_SERVICE_FEE = 125
      if (baseTotal < MINIMUM_SERVICE_FEE) {
        console.log(`Base total $${baseTotal} is below minimum, applying minimum service fee of $${MINIMUM_SERVICE_FEE}`)
        baseTotal = MINIMUM_SERVICE_FEE
      }

      // Add variance for min/max pricing (15-25% variance is more realistic)
      const estimatedPrice = {
        min: Math.round(baseTotal * 0.85),
        max: Math.round(baseTotal * 1.25)
      }

      const requiresSpecialHandling = detectedItems.some(item => item.requiresSpecialHandling)

      return {
        items: detectedItems,
        totalVolume,
        estimatedPrice,
        requiresSpecialHandling
      }
    } catch (error: any) {
      console.error('Google Vision API error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      })

      // Preserve the original error message and details
      const errorMessage = error.message || 'Failed to analyze image'
      const enhancedError = new Error(errorMessage)
      ;(enhancedError as any).code = error.code
      ;(enhancedError as any).details = error.details
      ;(enhancedError as any).originalError = error

      throw enhancedError
    }
  }

  // Helper to estimate truck space
  getTruckLoad(volume: number): string {
    if (volume <= 0.25) return 'QUARTER'
    if (volume <= 0.5) return 'HALF'
    if (volume <= 0.75) return 'THREE_QUARTER'
    if (volume <= 1) return 'FULL'
    return 'MULTIPLE'
  }
}