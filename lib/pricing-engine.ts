// Advanced pricing engine for junk removal quotes

interface PricingFactors {
  basePrice: number
  volumeMultiplier: number
  weightMultiplier: number
  laborDifficulty: number
  disposalFee: number
  locationAdjustment: number
  urgencyMultiplier: number
}

interface ItemDimensions {
  length?: number  // in feet
  width?: number   // in feet
  height?: number  // in feet
  estimatedWeight?: number // in lbs
  confidence: number
}

interface LocationPricing {
  zipCode: string
  baseLaborRate: number // per hour
  disposalFeeRate: number // per cubic yard
  fuelSurcharge: number
  marketDemandMultiplier: number
}

// Regional pricing adjustments by state
const STATE_PRICING: Record<string, number> = {
  'CA': 1.25,  // California - higher cost of living
  'NY': 1.20,  // New York
  'TX': 0.95,  // Texas - lower costs
  'FL': 1.00,  // Florida - baseline
  'IL': 1.10,  // Illinois
  'WA': 1.15,  // Washington
  'MA': 1.18,  // Massachusetts
  'CO': 1.05,  // Colorado
  'AZ': 0.98,  // Arizona
  'NV': 1.02,  // Nevada
  // Add more states as needed
}

// Item-specific labor difficulty scores (1-5 scale)
const LABOR_DIFFICULTY: Record<string, number> = {
  // Easy (1-2)
  'box': 1,
  'bag': 1,
  'clothes': 1,
  'books': 1.5,

  // Medium (2-3)
  'chair': 2,
  'table': 2.5,
  'mattress': 2.5,
  'tv': 2,
  'microwave': 2,

  // Hard (3-4)
  'couch': 3.5,
  'sofa': 3.5,
  'dresser': 3,
  'desk': 3,
  'bed': 3.5,

  // Very Hard (4-5)
  'refrigerator': 4.5,
  'washer': 4,
  'dryer': 4,
  'piano': 5,
  'hot tub': 5,
}

// Disposal fees by category
const DISPOSAL_FEES: Record<string, number> = {
  'electronics': 25,    // Special e-waste handling
  'appliance': 35,      // Appliance recycling
  'furniture': 15,      // Standard disposal
  'construction': 40,   // C&D waste
  'hazardous': 75,      // Hazmat disposal
  'general': 10,        // Regular trash
}

export class PricingEngine {

  // Estimate dimensions from object detection confidence and typical sizes
  estimateDimensions(itemType: string, detectionConfidence: number): ItemDimensions {
    // Typical dimensions for common items (L x W x H in feet)
    const TYPICAL_DIMENSIONS: Record<string, [number, number, number, number]> = {
      // [length, width, height, weight in lbs]
      'couch': [7, 3, 3, 150],
      'sofa': [6, 3, 3, 120],
      'loveseat': [5, 3, 3, 100],
      'chair': [3, 3, 3, 50],
      'recliner': [3, 3, 4, 80],
      'table': [5, 3, 2.5, 75],
      'desk': [5, 2.5, 2.5, 100],
      'bed': [6.5, 5, 2, 150],
      'mattress': [6.5, 5, 1, 80],
      'dresser': [4, 2, 4, 120],
      'bookshelf': [3, 1.5, 6, 80],
      'refrigerator': [3, 3, 6, 250],
      'washer': [2.5, 2.5, 3.5, 200],
      'dryer': [2.5, 2.5, 3.5, 150],
      'dishwasher': [2, 2, 3, 120],
      'microwave': [1.5, 1.5, 1, 35],
      'tv': [4, 0.5, 2.5, 40],
      'box': [1.5, 1.5, 1.5, 20],
      'bag': [2, 2, 2, 15],
    }

    const dimensions = TYPICAL_DIMENSIONS[itemType.toLowerCase()] || [3, 2, 2, 50]

    // Adjust confidence based on detection confidence
    const dimensionConfidence = detectionConfidence * 0.7 // Dimensions are less certain

    return {
      length: dimensions[0],
      width: dimensions[1],
      height: dimensions[2],
      estimatedWeight: dimensions[3],
      confidence: dimensionConfidence
    }
  }

  // Calculate volume in cubic yards
  calculateVolume(dimensions: ItemDimensions, quantity: number): number {
    const length = dimensions.length || 3
    const width = dimensions.width || 2
    const height = dimensions.height || 2

    // Convert cubic feet to cubic yards (27 cubic feet = 1 cubic yard)
    const volumeCubicFeet = length * width * height * quantity
    return volumeCubicFeet / 27
  }

  // Calculate labor time in hours
  estimateLaborTime(items: Array<{type: string, quantity: number}>): number {
    let totalMinutes = 0

    // Base time for truck arrival and setup
    totalMinutes += 15

    for (const item of items) {
      const difficulty = LABOR_DIFFICULTY[item.type.toLowerCase()] || 2.5
      const minutesPerItem = difficulty * 5 // 5-25 minutes per item based on difficulty
      totalMinutes += minutesPerItem * item.quantity
    }

    // Add time for driving to disposal site
    totalMinutes += 30

    return totalMinutes / 60 // Convert to hours
  }

  // Get location-based pricing adjustments
  getLocationPricing(state: string, zipCode?: string): LocationPricing {
    const stateMultiplier = STATE_PRICING[state.toUpperCase()] || 1.0

    // Base rates (adjusted by state)
    const baseLaborRate = 50 * stateMultiplier // per hour
    const disposalFeeRate = 35 * stateMultiplier // per cubic yard
    const fuelSurcharge = 15 * stateMultiplier

    // Market demand (could be enhanced with real data)
    let marketDemandMultiplier = 1.0

    // Urban areas typically have higher demand
    if (zipCode) {
      const urbanZipPrefixes = ['100', '900', '941', '331', '606'] // NYC, LA, SF, Chicago, etc.
      if (urbanZipPrefixes.some(prefix => zipCode.startsWith(prefix))) {
        marketDemandMultiplier = 1.15
      }
    }

    return {
      zipCode: zipCode || '',
      baseLaborRate,
      disposalFeeRate,
      fuelSurcharge,
      marketDemandMultiplier
    }
  }

  // Calculate comprehensive quote
  calculateQuote(
    items: Array<{
      type: string
      quantity: number
      category: string
      confidence: number
    }>,
    location: {
      state: string
      zipCode?: string
    },
    options?: {
      isUrgent?: boolean
      hasStairs?: boolean
      requiresDisassembly?: boolean
    }
  ) {
    const locationPricing = this.getLocationPricing(location.state, location.zipCode)

    let totalVolume = 0
    let totalWeight = 0
    let totalDisposalFee = 0
    let itemDetails = []

    // Calculate per-item costs
    for (const item of items) {
      const dimensions = this.estimateDimensions(item.type, item.confidence)
      const volume = this.calculateVolume(dimensions, item.quantity)
      const weight = (dimensions.estimatedWeight || 50) * item.quantity

      totalVolume += volume
      totalWeight += weight

      // Disposal fee based on category
      const disposalFee = (DISPOSAL_FEES[item.category] || 10) * item.quantity
      totalDisposalFee += disposalFee

      itemDetails.push({
        ...item,
        dimensions,
        volume,
        weight,
        disposalFee
      })
    }

    // Calculate labor cost
    const laborHours = this.estimateLaborTime(items)
    let laborCost = laborHours * locationPricing.baseLaborRate

    // Adjust for special circumstances
    if (options?.hasStairs) laborCost *= 1.25
    if (options?.requiresDisassembly) laborCost *= 1.35

    // Calculate disposal cost
    const disposalCost = (totalVolume * locationPricing.disposalFeeRate) + totalDisposalFee

    // Base quote
    let subtotal = laborCost + disposalCost + locationPricing.fuelSurcharge

    // Apply market demand
    subtotal *= locationPricing.marketDemandMultiplier

    // Urgency surcharge
    if (options?.isUrgent) {
      subtotal *= 1.5 // 50% surcharge for same-day service
    }

    // Minimum service fee
    const MINIMUM_FEE = 125
    if (subtotal < MINIMUM_FEE) {
      subtotal = MINIMUM_FEE
    }

    // Add variance for estimate range
    const quote = {
      min: Math.round(subtotal * 0.9),
      max: Math.round(subtotal * 1.15),
      estimated: Math.round(subtotal),
      breakdown: {
        laborCost: Math.round(laborCost),
        disposalCost: Math.round(disposalCost),
        fuelSurcharge: Math.round(locationPricing.fuelSurcharge),
        totalVolume: totalVolume.toFixed(2),
        totalWeight: Math.round(totalWeight),
        laborHours: laborHours.toFixed(1),
        locationMultiplier: locationPricing.marketDemandMultiplier
      },
      items: itemDetails,
      truckLoads: this.estimateTruckLoads(totalVolume)
    }

    return quote
  }

  // Estimate number of truck loads needed
  estimateTruckLoads(volumeCubicYards: number): string {
    // Standard junk removal truck holds about 15 cubic yards
    const TRUCK_CAPACITY = 15

    if (volumeCubicYards <= TRUCK_CAPACITY * 0.25) return 'QUARTER'
    if (volumeCubicYards <= TRUCK_CAPACITY * 0.5) return 'HALF'
    if (volumeCubicYards <= TRUCK_CAPACITY * 0.75) return 'THREE_QUARTER'
    if (volumeCubicYards <= TRUCK_CAPACITY) return 'FULL'

    const trucks = Math.ceil(volumeCubicYards / TRUCK_CAPACITY)
    return `${trucks}_TRUCKS`
  }

  // Group similar items for better pricing
  groupItems(items: Array<{type: string, category: string, quantity: number}>) {
    const groups = new Map<string, {
      category: string
      items: Array<{type: string, quantity: number}>
      totalQuantity: number
      bulkDiscount?: number
    }>()

    for (const item of items) {
      if (!groups.has(item.category)) {
        groups.set(item.category, {
          category: item.category,
          items: [],
          totalQuantity: 0
        })
      }

      const group = groups.get(item.category)!
      group.items.push({type: item.type, quantity: item.quantity})
      group.totalQuantity += item.quantity
    }

    // Apply bulk discounts
    const groupsArray = Array.from(groups.values())
    for (const group of groupsArray) {
      if (group.totalQuantity >= 5) {
        group.bulkDiscount = 0.9 // 10% off for 5+ items
      } else if (group.totalQuantity >= 10) {
        group.bulkDiscount = 0.85 // 15% off for 10+ items
      }
    }

    return groupsArray
  }
}