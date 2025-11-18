import { ImageAnnotatorClient } from '@google-cloud/vision'

// Simplified categories for single-item detection
const SINGLE_ITEMS = {
  // Furniture - simple ranges
  'couch': { min: 75, max: 150 },
  'sofa': { min: 75, max: 150 },
  'chair': { min: 25, max: 50 },
  'table': { min: 40, max: 80 },
  'desk': { min: 40, max: 80 },
  'bed': { min: 80, max: 150 },
  'mattress': { min: 60, max: 120 },
  'dresser': { min: 50, max: 100 },

  // Appliances
  'refrigerator': { min: 100, max: 200, special: true },
  'fridge': { min: 100, max: 200, special: true },
  'washer': { min: 75, max: 150, special: true },
  'dryer': { min: 75, max: 150, special: true },
  'microwave': { min: 20, max: 40 },

  // Electronics
  'television': { min: 35, max: 70 },
  'tv': { min: 35, max: 70 },
  'monitor': { min: 20, max: 40 },
}

// Volume-based pricing tiers (provider can configure these)
const VOLUME_TIERS = {
  'small-load': {
    min: 150,
    max: 250,
    description: "Small load (5-10 items)",
    truckPercentage: "Less than 1/4 truck"
  },
  'medium-load': {
    min: 250,
    max: 400,
    description: "Medium load (10-20 items)",
    truckPercentage: "About 1/2 truck"
  },
  'large-load': {
    min: 400,
    max: 650,
    description: "Large load (20-30 items)",
    truckPercentage: "3/4 to full truck"
  },
  'extra-large': {
    min: 650,
    max: null, // Will show "Contact for quote"
    description: "Extra large job",
    truckPercentage: "Multiple trucks needed"
  }
}

interface DetectedItem {
  name: string
  confidence: number
}

interface AnalysisResultV2 {
  mode: 'single-item' | 'volume-based'

  // For single items (1-3 distinct objects)
  singleItems?: Array<{
    type: string
    priceRange: [number, number]
    requiresSpecialHandling?: boolean
  }>

  // For multiple items/rooms
  volumeEstimate?: {
    category: keyof typeof VOLUME_TIERS
    description: string
    priceRange: [number, number | null]
    confidence: number
    truckPercentage: string
    detectedItemCount: number
  }

  // Always included
  estimatedPrice: {
    min: number
    max: number | null
  }

  disclaimer: string
  requiresSpecialHandling: boolean

  // For backward compatibility
  items: DetectedItem[]
  totalVolume: number
}

export class VisionAIServiceV2 {
  private client: ImageAnnotatorClient

  constructor() {
    console.log('VisionAIServiceV2 initializing...')

    // EXACT same auth logic as V1 - proven to work
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY
        .replace(/\\n/g, '\n')
        .replace(/\n\n/g, '\n')

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
    } else if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      this.client = new ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS
      })
    } else {
      throw new Error('Google Cloud credentials not configured')
    }
  }

  async analyzeImages(
    imageBuffers: Buffer[],
    location?: { state?: string; zipCode?: string }
  ): Promise<AnalysisResultV2> {
    try {
      const allDetections: DetectedItem[] = []
      let totalObjectCount = 0
      let hasClutteredScene = false
      let highConfidenceItems: string[] = []

      console.log(`[V2] Analyzing ${imageBuffers.length} images...`)

      // Analyze each image
      for (let i = 0; i < imageBuffers.length; i++) {
        const [result] = await this.client.annotateImage({
          image: { content: imageBuffers[i].toString('base64') },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
          ]
        })

        // Count objects to determine if scene is cluttered
        if (result.localizedObjectAnnotations) {
          totalObjectCount += result.localizedObjectAnnotations.length

          // Check for high-confidence single items
          for (const obj of result.localizedObjectAnnotations) {
            const name = obj.name?.toLowerCase() || ''
            const confidence = obj.score || 0

            if (confidence > 0.7) {
              // Check if it's a known single item
              for (const [key, _] of Object.entries(SINGLE_ITEMS)) {
                if (name.includes(key) || key.includes(name)) {
                  highConfidenceItems.push(key)
                  allDetections.push({ name: key, confidence })
                  break
                }
              }
            }
          }
        }

        // Check labels for scene complexity
        if (result.labelAnnotations) {
          const labels = result.labelAnnotations.map(l => l.description?.toLowerCase() || '')

          // Keywords that indicate cluttered/multiple items
          const clutterKeywords = ['room', 'garage', 'basement', 'attic', 'storage',
                                   'clutter', 'mess', 'pile', 'stack', 'multiple']

          if (labels.some(label => clutterKeywords.some(keyword => label.includes(keyword)))) {
            hasClutteredScene = true
          }
        }
      }

      // Determine analysis mode
      const uniqueHighConfidenceItems = [...new Set(highConfidenceItems)]
      const isVolumeMode = hasClutteredScene ||
                           totalObjectCount > 5 ||
                           uniqueHighConfidenceItems.length > 3

      console.log(`[V2] Mode: ${isVolumeMode ? 'VOLUME' : 'SINGLE-ITEM'}`)
      console.log(`[V2] Total objects detected: ${totalObjectCount}`)
      console.log(`[V2] High confidence items: ${uniqueHighConfidenceItems.join(', ') || 'none'}`)

      let result: AnalysisResultV2

      if (isVolumeMode) {
        // VOLUME-BASED PRICING
        const volumeCategory = this.categorizeVolume(totalObjectCount, hasClutteredScene)
        const tier = VOLUME_TIERS[volumeCategory]

        result = {
          mode: 'volume-based',
          volumeEstimate: {
            category: volumeCategory,
            description: tier.description,
            priceRange: [tier.min, tier.max],
            confidence: hasClutteredScene ? 0.6 : 0.7,
            truckPercentage: tier.truckPercentage,
            detectedItemCount: totalObjectCount
          },
          estimatedPrice: {
            min: tier.min,
            max: tier.max
          },
          disclaimer: "Final price will be confirmed on-site based on actual volume and any special handling items.",
          requiresSpecialHandling: allDetections.some(d =>
            SINGLE_ITEMS[d.name as keyof typeof SINGLE_ITEMS]?.special === true
          ),
          // Backward compatibility
          items: allDetections,
          totalVolume: this.estimateVolumeFromCategory(volumeCategory)
        }
      } else {
        // SINGLE-ITEM PRICING
        const singleItems = uniqueHighConfidenceItems.map(itemKey => {
          const pricing = SINGLE_ITEMS[itemKey as keyof typeof SINGLE_ITEMS]
          return {
            type: itemKey,
            priceRange: [pricing?.min || 50, pricing?.max || 100] as [number, number],
            requiresSpecialHandling: pricing?.special
          }
        })

        // If no items detected, provide minimum service
        if (singleItems.length === 0) {
          singleItems.push({
            type: 'general junk',
            priceRange: [125, 175],
            requiresSpecialHandling: false
          })
        }

        // Calculate total range
        const minTotal = Math.max(125, singleItems.reduce((sum, item) => sum + item.priceRange[0], 0))
        const maxTotal = singleItems.reduce((sum, item) => sum + item.priceRange[1], 0)

        result = {
          mode: 'single-item',
          singleItems,
          estimatedPrice: {
            min: minTotal,
            max: maxTotal
          },
          disclaimer: singleItems.length === 1
            ? "Price includes removal and disposal fees."
            : "Total price for all items. Final price confirmed on-site.",
          requiresSpecialHandling: singleItems.some(item => item.requiresSpecialHandling === true),
          // Backward compatibility
          items: allDetections,
          totalVolume: 0.1 * singleItems.length
        }
      }

      // Apply location adjustment if provided
      if (location?.state && STATE_ADJUSTMENTS[location.state]) {
        const adjustment = STATE_ADJUSTMENTS[location.state]
        result.estimatedPrice.min = Math.round(result.estimatedPrice.min * adjustment)
        if (result.estimatedPrice.max !== null) {
          result.estimatedPrice.max = Math.round(result.estimatedPrice.max * adjustment)
        }
      }

      return result

    } catch (error: any) {
      console.error('[V2] Analysis error:', error.message)

      // Return safe fallback instead of throwing
      return {
        mode: 'volume-based',
        volumeEstimate: {
          category: 'small-load',
          description: "Unable to analyze photos - showing minimum pricing",
          priceRange: [150, 250],
          confidence: 0.3,
          truckPercentage: "To be determined",
          detectedItemCount: 0
        },
        estimatedPrice: {
          min: 150,
          max: 250
        },
        disclaimer: "Photos couldn't be analyzed. We'll provide accurate quote on-site.",
        requiresSpecialHandling: false,
        items: [],
        totalVolume: 0.25
      }
    }
  }

  private categorizeVolume(objectCount: number, isCluttered: boolean): keyof typeof VOLUME_TIERS {
    if (isCluttered) {
      // Cluttered scenes tend to be larger jobs
      if (objectCount < 5) return 'medium-load'
      if (objectCount < 10) return 'large-load'
      return 'extra-large'
    } else {
      // Individual items counted
      if (objectCount <= 5) return 'small-load'
      if (objectCount <= 15) return 'medium-load'
      if (objectCount <= 25) return 'large-load'
      return 'extra-large'
    }
  }

  private estimateVolumeFromCategory(category: keyof typeof VOLUME_TIERS): number {
    const volumeMap = {
      'small-load': 0.25,
      'medium-load': 0.5,
      'large-load': 0.75,
      'extra-large': 1.5
    }
    return volumeMap[category]
  }

  // Keep old method signature for compatibility
  async analyzeImage(imageBuffer: Buffer): Promise<AnalysisResultV2> {
    return this.analyzeImages([imageBuffer])
  }
}

// State pricing adjustments (simplified)
const STATE_ADJUSTMENTS: Record<string, number> = {
  'CA': 1.2,  // California
  'NY': 1.15, // New York
  'TX': 0.95, // Texas
  'FL': 1.0,  // Florida baseline
  // Add more as needed
}