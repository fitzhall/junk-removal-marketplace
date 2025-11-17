import { prisma } from './prisma'

interface QuoteData {
  id: string
  pickupZip: string
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  items: Array<{ itemType: string; quantity: number }>
}

interface DistributionResult {
  success: boolean
  providersNotified: number
  providers: Array<{
    id: string
    businessName: string
    distributionId: string
  }>
  message?: string
}

/**
 * Distribute a lead to eligible providers using round-robin or broadcast
 * This follows the real estate wholesale platform model (Zillow, Opcity)
 * where leads are automatically sent to providers based on their service area and settings
 */
export async function distributeLeadToProviders(quote: QuoteData): Promise<DistributionResult> {
  try {
    const estimatedPrice = quote.priceRangeMax || quote.priceRangeMin || 0

    if (!estimatedPrice) {
      return {
        success: false,
        providersNotified: 0,
        providers: [],
        message: 'Quote has no estimated price'
      }
    }

    // Find all eligible providers in the service area
    const providers = await prisma.provider.findMany({
      where: {
        status: 'ACTIVE',
        serviceAreas: {
          some: {
            zipCode: quote.pickupZip
          }
        },
        // Ensure provider wants this job value range
        OR: [
          { minJobValue: null },
          { minJobValue: { lte: estimatedPrice } }
        ],
        AND: [
          {
            OR: [
              { maxJobValue: null },
              { maxJobValue: { gte: estimatedPrice } }
            ]
          }
        ]
      },
      include: {
        jobs: {
          where: {
            scheduledDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          },
          select: { id: true }
        },
        serviceAreas: {
          where: { zipCode: quote.pickupZip },
          select: { isPrimary: true }
        }
      }
    })

    if (providers.length === 0) {
      return {
        success: false,
        providersNotified: 0,
        providers: [],
        message: 'No eligible providers found in service area'
      }
    }

    // Filter by capacity
    const eligibleProviders = providers.filter(p => p.jobs.length < p.maxJobsPerDay)

    if (eligibleProviders.length === 0) {
      return {
        success: false,
        providersNotified: 0,
        providers: [],
        message: 'All providers at capacity for today'
      }
    }

    // Sort providers by priority:
    // 1. Primary service area
    // 2. Highest rating
    // 3. Most total jobs (experience)
    eligibleProviders.sort((a, b) => {
      const aIsPrimary = a.serviceAreas.some(sa => sa.isPrimary)
      const bIsPrimary = b.serviceAreas.some(sa => sa.isPrimary)

      if (aIsPrimary !== bIsPrimary) {
        return aIsPrimary ? -1 : 1
      }
      if (a.rating !== b.rating) return b.rating - a.rating
      return b.totalJobs - a.totalJobs
    })

    // Distribute to top 3 providers (or all if less than 3)
    const providersToNotify = eligibleProviders.slice(0, Math.min(3, eligibleProviders.length))

    // Create LeadDistribution records for each provider with status SENT
    const distributions = await Promise.all(
      providersToNotify.map(async (provider) => {
        const distribution = await prisma.leadDistribution.create({
          data: {
            quoteId: quote.id,
            providerId: provider.id,
            status: 'SENT',
            sentAt: new Date(),
            bidAmount: null,
            isWinner: false
          }
        })

        return {
          id: provider.id,
          businessName: provider.businessName,
          distributionId: distribution.id
        }
      })
    )

    // Quote stays in PENDING status until a provider marks it as won
    // Do NOT create Job records yet - those are created when provider marks lead as "won"

    console.log(`✅ Distributed lead ${quote.id} to ${distributions.length} providers`)

    return {
      success: true,
      providersNotified: distributions.length,
      providers: distributions,
      message: `Lead distributed to ${distributions.length} provider(s)`
    }
  } catch (error: any) {
    console.error('Lead distribution error:', error)
    return {
      success: false,
      providersNotified: 0,
      providers: [],
      message: error.message || 'Failed to distribute lead'
    }
  }
}

/**
 * Mark a lead as won by a provider and create the job
 */
export async function markLeadAsWon(distributionId: string): Promise<{ success: boolean; jobId?: string; message?: string }> {
  try {
    const distribution = await prisma.leadDistribution.findUnique({
      where: { id: distributionId },
      include: {
        quote: true,
        provider: true
      }
    })

    if (!distribution) {
      return {
        success: false,
        message: 'Lead distribution not found'
      }
    }

    // Update this distribution to winner status
    await prisma.leadDistribution.update({
      where: { id: distributionId },
      data: {
        status: 'ACCEPTED',
        isWinner: true,
        respondedAt: new Date()
      }
    })

    // Mark all other distributions for this quote as declined
    await prisma.leadDistribution.updateMany({
      where: {
        quoteId: distribution.quoteId,
        id: { not: distributionId }
      },
      data: {
        status: 'DECLINED',
        responseReason: 'Another provider won',
        respondedAt: new Date()
      }
    })

    // Create the job
    const job = await prisma.job.create({
      data: {
        quoteId: distribution.quoteId,
        providerId: distribution.providerId,
        status: 'PENDING',
        finalPrice: distribution.bidAmount || distribution.quote.totalPrice
      }
    })

    // Update quote status
    await prisma.quote.update({
      where: { id: distribution.quoteId },
      data: { status: 'ACCEPTED' }
    })

    console.log(`✅ Lead ${distribution.quoteId} won by ${distribution.provider.businessName}`)

    return {
      success: true,
      jobId: job.id,
      message: 'Lead marked as won and job created'
    }
  } catch (error: any) {
    console.error('Error marking lead as won:', error)
    return {
      success: false,
      message: error.message || 'Failed to mark lead as won'
    }
  }
}
