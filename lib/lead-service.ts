import { prisma } from '@/lib/prisma'
import { Provider, LeadDistribution } from '@prisma/client'

export interface LeadDistributionCriteria {
  zipCode: string
  city?: string
  state?: string
  estimatedValue: number
  urgency: boolean
}

export class LeadService {
  /**
   * Distribute a new lead to relevant providers based on:
   * - Service area matching
   * - Provider subscription tier
   * - Provider lead preferences (price range, etc.)
   * - Provider status (active, not suspended)
   */
  async distributeLeadToProviders(quoteId: string): Promise<LeadDistribution[]> {
    try {
      // Get the quote details
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { items: true }
      })

      if (!quote) {
        throw new Error('Quote not found')
      }

      // Find matching providers based on service area
      const matchingProviders = await this.findMatchingProviders({
        zipCode: quote.pickupZip || '',
        city: quote.pickupCity || undefined,
        state: quote.pickupState || undefined,
        estimatedValue: quote.totalPrice || 0,
        urgency: quote.isUrgent
      })

      // Create lead distribution records
      const distributions = await Promise.all(
        matchingProviders.map(provider =>
          prisma.leadDistribution.create({
            data: {
              quoteId: quote.id,
              providerId: provider.id,
              status: 'SENT',
              sentAt: new Date()
            }
          })
        )
      )

      // TODO: Send notifications to providers (email, SMS, push)
      await this.notifyProviders(distributions, quote)

      return distributions
    } catch (error) {
      console.error('Error distributing lead:', error)
      throw error
    }
  }

  /**
   * Find providers that match the lead criteria
   */
  private async findMatchingProviders(criteria: LeadDistributionCriteria): Promise<Provider[]> {
    // Get all active providers
    const providers = await prisma.provider.findMany({
      where: {
        status: 'ACTIVE',
        serviceAreas: {
          some: {
            OR: [
              { zipCode: criteria.zipCode },
              { city: criteria.city, state: criteria.state }
            ]
          }
        }
      },
      include: {
        serviceAreas: true
      }
    })

    // TODO: Filter by additional criteria
    // - Subscription tier (higher tier = get leads first)
    // - Lead preferences (price range)
    // - Daily/monthly lead limits
    // - Provider rating/performance

    return providers
  }

  /**
   * Send notifications to providers about new leads
   */
  private async notifyProviders(distributions: LeadDistribution[], quote: any) {
    // TODO: Implement actual notification system
    // - Email notification
    // - SMS notification
    // - In-app notification
    // - Push notification

    console.log(`Notified ${distributions.length} providers about lead ${quote.id}`)
  }

  /**
   * Mark a lead as viewed by a provider
   */
  async markLeadAsViewed(leadDistributionId: string): Promise<void> {
    await prisma.leadDistribution.update({
      where: { id: leadDistributionId },
      data: {
        status: 'VIEWED',
        viewedAt: new Date()
      }
    })
  }

  /**
   * Provider accepts a lead
   */
  async acceptLead(leadDistributionId: string, bidAmount?: number): Promise<LeadDistribution> {
    const distribution = await prisma.leadDistribution.update({
      where: { id: leadDistributionId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
        bidAmount: bidAmount
      },
      include: {
        quote: true,
        provider: true
      }
    })

    // TODO: Charge provider for the lead
    // - Check subscription or deduct credits
    // - Create payment record
    // - Send confirmation

    return distribution
  }

  /**
   * Provider declines a lead
   */
  async declineLead(leadDistributionId: string, reason?: string): Promise<void> {
    await prisma.leadDistribution.update({
      where: { id: leadDistributionId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
        responseReason: reason
      }
    })
  }

  /**
   * Get lead statistics for a provider
   */
  async getProviderLeadStats(providerId: string) {
    const [total, accepted, declined, pending] = await Promise.all([
      prisma.leadDistribution.count({ where: { providerId } }),
      prisma.leadDistribution.count({ where: { providerId, status: 'ACCEPTED' } }),
      prisma.leadDistribution.count({ where: { providerId, status: 'DECLINED' } }),
      prisma.leadDistribution.count({ where: { providerId, status: 'SENT' } })
    ])

    return {
      total,
      accepted,
      declined,
      pending,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0
    }
  }
}

export const leadService = new LeadService()