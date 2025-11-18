/**
 * Safe wrapper to switch between Vision V1 and V2
 * Defaults to V1 (current working version) unless explicitly enabled
 */

import { VisionAIService as VisionAIServiceV1 } from './google-vision'
import { VisionAIServiceV2 } from './google-vision-v2'

// Check if V2 is enabled (defaults to false for safety)
const useV2 = process.env.USE_VISION_V2 === 'true'

console.log(`[Vision Wrapper] Using ${useV2 ? 'V2 (improved)' : 'V1 (original)'} implementation`)

// Export the appropriate version
export class VisionAIService {
  private implementation: VisionAIServiceV1 | VisionAIServiceV2

  constructor() {
    try {
      if (useV2) {
        console.log('[Vision Wrapper] Initializing V2...')
        this.implementation = new VisionAIServiceV2()
      } else {
        console.log('[Vision Wrapper] Initializing V1 (safe default)...')
        this.implementation = new VisionAIServiceV1()
      }
    } catch (error) {
      console.error('[Vision Wrapper] Failed to initialize, falling back to V1:', error)
      // Always fallback to V1 if there's any issue
      this.implementation = new VisionAIServiceV1()
    }
  }

  async analyzeImage(imageBuffer: Buffer) {
    try {
      return await this.implementation.analyzeImage(imageBuffer)
    } catch (error) {
      console.error('[Vision Wrapper] analyzeImage failed:', error)
      // If V2 fails, try V1 as fallback
      if (useV2 && this.implementation instanceof VisionAIServiceV2) {
        console.log('[Vision Wrapper] V2 failed, trying V1 fallback...')
        const v1Service = new VisionAIServiceV1()
        return await v1Service.analyzeImage(imageBuffer)
      }
      throw error
    }
  }

  async analyzeImages(
    imageBuffers: Buffer[],
    location?: { state?: string; zipCode?: string }
  ) {
    try {
      const result = await this.implementation.analyzeImages(imageBuffers, location)

      // If using V2, ensure backward compatibility
      if (useV2 && result) {
        // V2 returns additional fields but maintains backward compatibility
        // Ensure estimatedPrice exists in the format V1 expects
        if (!result.estimatedPrice) {
          console.warn('[Vision Wrapper] V2 result missing estimatedPrice, adding fallback')
          result.estimatedPrice = {
            min: 150,
            max: 250
          }
        }

        // Ensure items array exists
        if (!result.items) {
          result.items = []
        }

        // Ensure totalVolume exists
        if (typeof result.totalVolume !== 'number') {
          result.totalVolume = 0.5
        }
      }

      return result
    } catch (error) {
      console.error('[Vision Wrapper] analyzeImages failed:', error)

      // If V2 fails, try V1 as fallback
      if (useV2 && this.implementation instanceof VisionAIServiceV2) {
        console.log('[Vision Wrapper] V2 failed, trying V1 fallback...')
        const v1Service = new VisionAIServiceV1()
        return await v1Service.analyzeImages(imageBuffers, location)
      }

      // If all fails, return a safe minimum quote
      console.log('[Vision Wrapper] All implementations failed, returning safe minimum')
      return {
        items: [{
          name: 'general junk',
          confidence: 0.5,
          category: 'general',
          basePrice: 150,
          volume: 0.5,
          requiresSpecialHandling: false,
          quantity: 1
        }],
        totalVolume: 0.5,
        estimatedPrice: {
          min: 150,
          max: 250
        },
        requiresSpecialHandling: false
      }
    }
  }

  // Helper method to check which version is active
  getVersion(): string {
    return useV2 ? 'v2' : 'v1'
  }
}

// For testing purposes - export a function to get current version
export function getCurrentVisionVersion(): string {
  return useV2 ? 'v2' : 'v1'
}