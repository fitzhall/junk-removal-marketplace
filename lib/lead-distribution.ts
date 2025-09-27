// import { prisma } from '@/lib/prisma'

interface Provider {
  id: string
  subscriptionTier: 'BASIC' | 'PROFESSIONAL' | 'ELITE'
  serviceAreas: string[]
  leadCredits: number
  responseTime: number // average in minutes
  acceptanceRate: number // percentage
  autoBidEnabled: boolean
  maxBidAmount: number
}

interface LeadDistributionResult {
  providerId: string
  priority: number
  estimatedResponseTime: number
  bidAmount?: number
}

export class LeadDistributionService {
  /**
   * Main algorithm for distributing leads to providers
   * Considers: subscription tier, service area, credits, performance metrics
   */
  async distributeLeadToProviders(
    quoteId: string,
    zipCode: string,
    estimatedValue: number,
    isUrgent: boolean
  ): Promise<LeadDistributionResult[]> {
    try {
      // Get all active providers in the service area
      const providers = await this.getEligibleProviders(zipCode)

      if (providers.length === 0) {
        console.log('No eligible providers found for zip:', zipCode)
        return []
      }

      // Score and rank providers
      const rankedProviders = this.rankProviders(
        providers,
        estimatedValue,
        isUrgent
      )

      // Determine how many providers to send to based on lead value
      const recipientCount = this.calculateRecipientCount(estimatedValue)

      // Get top providers based on ranking
      const selectedProviders = rankedProviders.slice(0, recipientCount)

      // Create lead distribution records
      const distributions = await this.createDistributions(
        quoteId,
        selectedProviders
      )

      // Deduct credits from providers
      await this.deductCredits(selectedProviders.map(p => p.providerId))

      // Send notifications
      await this.notifyProviders(selectedProviders, quoteId)

      return distributions
    } catch (error) {
      console.error('Error distributing lead:', error)
      return []
    }
  }

  /**
   * Get providers eligible for receiving leads in a specific area
   */
  private async getEligibleProviders(_zipCode: string): Promise<Provider[]> {
    // For demo, return mock providers
    // In production, query from database based on service areas and active status
    return [
      {
        id: 'provider-1',
        subscriptionTier: 'ELITE' as const,
        serviceAreas: ['94102', '94103', '94104'],
        leadCredits: 35,
        responseTime: 15,
        acceptanceRate: 85,
        autoBidEnabled: true,
        maxBidAmount: 75
      },
      {
        id: 'provider-2',
        subscriptionTier: 'PROFESSIONAL' as const,
        serviceAreas: ['94102', '94105'],
        leadCredits: 12,
        responseTime: 30,
        acceptanceRate: 72,
        autoBidEnabled: true,
        maxBidAmount: 50
      },
      {
        id: 'provider-3',
        subscriptionTier: 'BASIC' as const,
        serviceAreas: ['94102'],
        leadCredits: 3,
        responseTime: 60,
        acceptanceRate: 65,
        autoBidEnabled: false,
        maxBidAmount: 25
      }
    ].filter(p => p.leadCredits > 0) // Only providers with credits
  }

  /**
   * Rank providers based on multiple factors
   */
  private rankProviders(
    providers: Provider[],
    estimatedValue: number,
    isUrgent: boolean
  ): LeadDistributionResult[] {
    return providers
      .map(provider => {
        let score = 0

        // Subscription tier weight (40% of score)
        const tierScores = { ELITE: 100, PROFESSIONAL: 70, BASIC: 40 }
        score += (tierScores[provider.subscriptionTier] || 40) * 0.4

        // Response time weight (20% of score) - faster is better
        const responseScore = Math.max(0, 100 - provider.responseTime)
        score += responseScore * 0.2

        // Acceptance rate weight (20% of score)
        score += provider.acceptanceRate * 0.2

        // Bid amount weight (10% of score) - only if auto-bid enabled
        if (provider.autoBidEnabled) {
          const bidScore = (provider.maxBidAmount / 100) * 100
          score += Math.min(bidScore, 100) * 0.1
        }

        // Credit availability weight (10% of score)
        const creditScore = Math.min(provider.leadCredits / 10, 1) * 100
        score += creditScore * 0.1

        // Urgent job bonus for elite/professional tiers
        if (isUrgent && provider.subscriptionTier !== 'BASIC') {
          score += 20
        }

        return {
          providerId: provider.id,
          priority: Math.round(score),
          estimatedResponseTime: provider.responseTime,
          bidAmount: provider.autoBidEnabled
            ? Math.min(provider.maxBidAmount, estimatedValue * 0.1)
            : undefined
        }
      })
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * Determine how many providers should receive the lead
   */
  private calculateRecipientCount(estimatedValue: number): number {
    if (estimatedValue < 500) return 2  // Small jobs: 2 providers
    if (estimatedValue < 1500) return 3 // Medium jobs: 3 providers
    return 4 // Large jobs: 4 providers
  }

  /**
   * Create distribution records in database
   */
  private async createDistributions(
    quoteId: string,
    providers: LeadDistributionResult[]
  ): Promise<LeadDistributionResult[]> {
    // In production, save to lead_distributions table
    console.log(`Distributing quote ${quoteId} to ${providers.length} providers`)
    return providers
  }

  /**
   * Deduct credits from providers
   */
  private async deductCredits(providerIds: string[]): Promise<void> {
    // In production, update provider credit balances
    console.log(`Deducting credits from providers:`, providerIds)
  }

  /**
   * Send notifications to selected providers
   */
  private async notifyProviders(
    providers: LeadDistributionResult[],
    quoteId: string
  ): Promise<void> {
    // Send email/SMS/push notifications based on provider preferences
    for (const provider of providers) {
      console.log(
        `Notifying provider ${provider.providerId} about lead ${quoteId}`,
        `Priority: ${provider.priority}, ETA: ${provider.estimatedResponseTime}min`
      )
    }
  }

  /**
   * Calculate lead price based on various factors
   */
  calculateLeadPrice(
    estimatedJobValue: number,
    isUrgent: boolean,
    competitionLevel: number
  ): number {
    let basePrice = estimatedJobValue * 0.05 // 5% of job value

    // Urgent premium
    if (isUrgent) basePrice *= 1.3

    // Competition multiplier (more providers = higher price)
    basePrice *= (1 + competitionLevel * 0.1)

    // Min/max bounds
    return Math.max(15, Math.min(basePrice, 150))
  }
}