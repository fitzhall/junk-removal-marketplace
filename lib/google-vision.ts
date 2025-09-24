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

  // General items
  'box': { category: 'general', size: 'small', basePrice: 5, volume: 0.02 },
  'boxes': { category: 'general', size: 'small', basePrice: 5, volume: 0.02 },
  'bag': { category: 'general', size: 'small', basePrice: 3, volume: 0.01 },
  'trash': { category: 'general', size: 'small', basePrice: 3, volume: 0.01 },
  'garbage': { category: 'general', size: 'small', basePrice: 3, volume: 0.01 },
  'bicycle': { category: 'general', size: 'medium', basePrice: 25, volume: 0.1 },
  'bike': { category: 'general', size: 'medium', basePrice: 25, volume: 0.1 },
  'rug': { category: 'general', size: 'medium', basePrice: 20, volume: 0.05 },
  'carpet': { category: 'general', size: 'medium', basePrice: 20, volume: 0.05 },

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

    if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      console.log('Using credentials file:', process.env.GOOGLE_CLOUD_CREDENTIALS)
      this.client = new ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS
      })
    } else if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
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
    } else {
      throw new Error('Google Cloud credentials not configured')
    }
  }

  async analyzeImage(imageBuffer: Buffer): Promise<{
    items: DetectedItem[]
    totalVolume: number
    estimatedPrice: { min: number; max: number }
    requiresSpecialHandling: boolean
  }> {
    try {
      // Perform multiple detection types for better accuracy
      const [result] = await this.client.annotateImage({
        image: { content: imageBuffer.toString('base64') },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
          { type: 'TEXT_DETECTION', maxResults: 10 }
        ]
      })

      // Process detected labels and objects
      const detectedItems: DetectedItem[] = []
      const itemCounts = new Map<string, number>()

      // Process object localization (more accurate for counting)
      if (result.localizedObjectAnnotations) {
        for (const object of result.localizedObjectAnnotations) {
          const objectName = object.name?.toLowerCase() || ''
          const confidence = object.score || 0

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
              break
            }
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

      // If no specific items detected, add general "miscellaneous items"
      if (detectedItems.length === 0) {
        detectedItems.push({
          name: 'miscellaneous items',
          confidence: 0.5,
          category: 'general',
          basePrice: 50,
          volume: 0.25,
          requiresSpecialHandling: false,
          quantity: 1
        })
      }

      // Calculate totals
      const totalVolume = detectedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0)
      const baseTotal = detectedItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0)

      // Add 20% variance for min/max pricing
      const estimatedPrice = {
        min: Math.round(baseTotal * 0.8),
        max: Math.round(baseTotal * 1.2)
      }

      const requiresSpecialHandling = detectedItems.some(item => item.requiresSpecialHandling)

      return {
        items: detectedItems,
        totalVolume,
        estimatedPrice,
        requiresSpecialHandling
      }
    } catch (error) {
      console.error('Google Vision API error:', error)
      throw new Error('Failed to analyze image')
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