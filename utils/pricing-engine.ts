/**
 * Rules-Based Pricing Engine for Junk Removal
 *
 * This replaces the broken AI-based pricing with intelligent rules
 * that use intentional user inputs to calculate accurate quotes.
 */

import { JobDetails } from '@/components/JobDetailsForm'

export interface PricingResult {
  priceMin: number
  priceMax: number
  breakdown: {
    base: { min: number; max: number; description: string }
    itemTypeModifiers: Array<{ type: string; modifier: number; description: string }>
    accessModifier: { modifier: number; description: string }
    urgencyModifier: { modifier: number; description: string }
    specialHandling: Array<{ type: string; charge: number; description: string }>
  }
  estimatedTruckLoads: number
  confidence: number
  notes: string[]
}

// Base pricing by job size
const BASE_PRICES = {
  small: { min: 75, max: 150, truckLoads: 0.25, description: 'Small job (1-5 items)' },
  medium: { min: 150, max: 350, truckLoads: 0.5, description: 'Medium job (single room)' },
  large: { min: 350, max: 700, truckLoads: 1, description: 'Large job (multiple rooms)' },
  huge: { min: 700, max: 1500, truckLoads: 2, description: 'Huge job (whole house)' }
}

// Item type modifiers (multiplicative)
const ITEM_TYPE_MODIFIERS = {
  furniture: { modifier: 1.0, description: 'Standard furniture items' },
  appliances: { modifier: 1.15, description: 'Appliances (special disposal fees)' },
  electronics: { modifier: 1.1, description: 'Electronics (e-waste handling)' },
  mattress: { modifier: 1.2, description: 'Mattress/box spring (disposal fees)' },
  construction: { modifier: 1.25, description: 'Construction debris (heavier)' },
  yard_waste: { modifier: 1.05, description: 'Yard waste' },
  boxes: { modifier: 0.9, description: 'Boxes and miscellaneous' },
  other: { modifier: 1.0, description: 'Other items' }
}

// Access difficulty modifiers (additive)
const ACCESS_MODIFIERS = {
  easy: { min: 0, max: 0, description: 'Easy access (curbside/driveway)' },
  standard: { min: 0, max: 0, description: 'Standard access (ground floor)' },
  difficult: { min: 50, max: 150, description: 'Difficult access (stairs/tight spaces)' }
}

// Urgency modifiers (multiplicative)
const URGENCY_MODIFIERS = {
  same_day: { modifier: 1.3, description: 'Same day service (30% premium)' },
  next_day: { modifier: 1.15, description: 'Next day service (15% premium)' },
  within_week: { modifier: 1.0, description: 'Within a week (standard pricing)' }
}

// Special handling charges (additive)
const SPECIAL_HANDLING_CHARGES = {
  hazardous: { min: 100, max: 300, description: 'Hazardous materials handling' },
  heavy_items: { min: 75, max: 200, description: 'Extra heavy items (piano/safe)' },
  demolition: { min: 150, max: 400, description: 'Demolition required' },
  hoarding: { min: 200, max: 500, description: 'Hoarding situation cleanup' },
  biohazard: { min: 300, max: 800, description: 'Biohazard cleanup' }
}

/**
 * Calculate pricing based on job details using rules-based logic
 */
export function calculatePricing(jobDetails: JobDetails): PricingResult {
  const notes: string[] = []

  // Validate job details
  if (!jobDetails.jobSize || jobDetails.jobSize === '') {
    throw new Error('Job size is required for pricing calculation')
  }

  // 1. Get base price based on job size
  const basePrice = BASE_PRICES[jobDetails.jobSize]
  let priceMin = basePrice.min
  let priceMax = basePrice.max
  let estimatedTruckLoads = basePrice.truckLoads

  const breakdown = {
    base: {
      min: basePrice.min,
      max: basePrice.max,
      description: basePrice.description
    },
    itemTypeModifiers: [] as Array<{ type: string; modifier: number; description: string }>,
    accessModifier: { modifier: 0, description: '' },
    urgencyModifier: { modifier: 1, description: '' },
    specialHandling: [] as Array<{ type: string; charge: number; description: string }>
  }

  // 2. Apply item type modifiers (take the highest modifier if multiple types)
  if (jobDetails.itemTypes.length > 0) {
    let maxModifier = 1.0
    let dominantType = ''

    jobDetails.itemTypes.forEach(type => {
      const modifier = ITEM_TYPE_MODIFIERS[type as keyof typeof ITEM_TYPE_MODIFIERS]
      if (modifier) {
        breakdown.itemTypeModifiers.push({
          type,
          modifier: modifier.modifier,
          description: modifier.description
        })

        if (modifier.modifier > maxModifier) {
          maxModifier = modifier.modifier
          dominantType = type
        }
      }
    })

    // Apply the highest modifier to the price
    priceMin = Math.round(priceMin * maxModifier)
    priceMax = Math.round(priceMax * maxModifier)

    if (dominantType) {
      notes.push(`Pricing adjusted for ${dominantType} disposal requirements`)
    }

    // Increase truck loads for heavy items
    if (jobDetails.itemTypes.includes('construction')) {
      estimatedTruckLoads *= 1.25
      notes.push('Construction debris may require additional truck space')
    }
    if (jobDetails.itemTypes.includes('appliances')) {
      estimatedTruckLoads *= 1.1
    }
  }

  // 3. Apply access difficulty modifier (additive)
  if (jobDetails.accessDifficulty && jobDetails.accessDifficulty !== '') {
    const accessMod = ACCESS_MODIFIERS[jobDetails.accessDifficulty]
    if (accessMod) {
      priceMin += accessMod.min
      priceMax += accessMod.max
      breakdown.accessModifier = {
        modifier: accessMod.max,
        description: accessMod.description
      }

      if (jobDetails.accessDifficulty === 'difficult') {
        notes.push('Additional labor charges for difficult access')
      }
    }
  }

  // 4. Apply urgency modifier (multiplicative)
  if (jobDetails.urgency && jobDetails.urgency !== '') {
    const urgencyMod = URGENCY_MODIFIERS[jobDetails.urgency]
    if (urgencyMod) {
      priceMin = Math.round(priceMin * urgencyMod.modifier)
      priceMax = Math.round(priceMax * urgencyMod.modifier)
      breakdown.urgencyModifier = {
        modifier: urgencyMod.modifier,
        description: urgencyMod.description
      }

      if (jobDetails.urgency === 'same_day') {
        notes.push('Premium pricing for same-day service')
      }
    }
  }

  // 5. Apply special handling charges (additive)
  if (jobDetails.specialHandling.length > 0) {
    jobDetails.specialHandling.forEach(handling => {
      const charge = SPECIAL_HANDLING_CHARGES[handling as keyof typeof SPECIAL_HANDLING_CHARGES]
      if (charge) {
        priceMin += charge.min
        priceMax += charge.max
        breakdown.specialHandling.push({
          type: handling,
          charge: charge.max,
          description: charge.description
        })

        // Add specific notes for special handling
        if (handling === 'hazardous') {
          notes.push('Licensed hazardous material disposal included')
          estimatedTruckLoads *= 1.2
        } else if (handling === 'biohazard') {
          notes.push('Certified biohazard cleanup crew required')
          estimatedTruckLoads *= 1.3
        } else if (handling === 'heavy_items') {
          notes.push('Special equipment for heavy item removal')
          estimatedTruckLoads *= 1.15
        }
      }
    })
  }

  // 6. Add notes based on additional details
  if (jobDetails.additionalNotes) {
    notes.push('Customer notes will be reviewed by provider')
  }

  // 7. Calculate confidence score based on completeness of information
  let confidence = 85 // Base confidence for rules-based pricing
  if (jobDetails.itemTypes.length > 2) confidence += 5
  if (jobDetails.specialHandling.length > 0) confidence -= 5 // Special cases reduce confidence
  if (jobDetails.additionalNotes) confidence -= 5 // Custom requirements reduce confidence

  confidence = Math.max(70, Math.min(95, confidence))

  // 8. Round prices to nearest $5
  priceMin = Math.round(priceMin / 5) * 5
  priceMax = Math.round(priceMax / 5) * 5

  // Ensure min is not greater than max
  if (priceMin > priceMax) {
    const avg = Math.round((priceMin + priceMax) / 2 / 5) * 5
    priceMin = avg - 25
    priceMax = avg + 25
  }

  return {
    priceMin,
    priceMax,
    breakdown,
    estimatedTruckLoads: Math.round(estimatedTruckLoads * 10) / 10,
    confidence,
    notes
  }
}

/**
 * Format pricing result for display
 */
export function formatPricingDisplay(result: PricingResult): string {
  const lines = [
    `Estimated Price: $${result.priceMin} - $${result.priceMax}`,
    `Confidence: ${result.confidence}%`,
    `Estimated Truck Loads: ${result.estimatedTruckLoads}`,
    '',
    'Price Breakdown:',
    `  Base: $${result.breakdown.base.min}-$${result.breakdown.base.max} (${result.breakdown.base.description})`
  ]

  if (result.breakdown.itemTypeModifiers.length > 0) {
    lines.push('  Item Types:')
    result.breakdown.itemTypeModifiers.forEach(mod => {
      lines.push(`    - ${mod.type}: ${Math.round((mod.modifier - 1) * 100)}% adjustment`)
    })
  }

  if (result.breakdown.accessModifier.modifier > 0) {
    lines.push(`  Access: +$${result.breakdown.accessModifier.modifier} (${result.breakdown.accessModifier.description})`)
  }

  if (result.breakdown.urgencyModifier.modifier > 1) {
    lines.push(`  Urgency: ${Math.round((result.breakdown.urgencyModifier.modifier - 1) * 100)}% premium`)
  }

  if (result.breakdown.specialHandling.length > 0) {
    lines.push('  Special Handling:')
    result.breakdown.specialHandling.forEach(handling => {
      lines.push(`    - ${handling.type}: +$${handling.charge}`)
    })
  }

  if (result.notes.length > 0) {
    lines.push('', 'Notes:')
    result.notes.forEach(note => {
      lines.push(`  • ${note}`)
    })
  }

  return lines.join('\n')
}

/**
 * Validate that pricing makes sense for the given inputs
 */
export function validatePricing(jobDetails: JobDetails, result: PricingResult): boolean {
  // Basic sanity checks
  if (result.priceMin < 50) return false // Minimum viable price
  if (result.priceMax > 5000) return false // Maximum reasonable price for residential
  if (result.priceMin >= result.priceMax) return false
  if (result.estimatedTruckLoads < 0.1 || result.estimatedTruckLoads > 10) return false

  // Job size validation
  if (jobDetails.jobSize === 'small' && result.priceMax > 500) return false
  if (jobDetails.jobSize === 'huge' && result.priceMin < 400) return false

  return true
}

/**
 * Get a fallback price if calculation fails
 */
export function getFallbackPricing(): PricingResult {
  return {
    priceMin: 150,
    priceMax: 350,
    breakdown: {
      base: { min: 150, max: 350, description: 'Standard job estimate' },
      itemTypeModifiers: [],
      accessModifier: { modifier: 0, description: '' },
      urgencyModifier: { modifier: 1, description: '' },
      specialHandling: []
    },
    estimatedTruckLoads: 0.5,
    confidence: 50,
    notes: ['Unable to calculate precise pricing - showing standard estimate']
  }
}