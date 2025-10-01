import { prisma } from './prisma'

interface QuoteData {
  id: string
  pickupZip: string
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  items: Array<{ itemType: string; quantity: number }>
}

interface AssignmentResult {
  success: boolean
  providerId?: string
  providerName?: string
  bidAmount?: number
  jobId?: string
  message?: string
}

/**
 * Auto-assign a quote to the best available provider
 * Based on:
 * 1. Service area match
 * 2. Auto-bid settings enabled
 * 3. Available capacity (max jobs per day)
 * 4. Bid strategy (lowest bid wins)
 * 5. Provider rating (tiebreaker)
 */
export async function autoAssignQuote(quote: QuoteData): Promise<AssignmentResult> {
  try {
    const estimatedPrice = quote.priceRangeMax || quote.priceRangeMin || 0

    if (!estimatedPrice) {
      return {
        success: false,
        message: 'Quote has no estimated price'
      }
    }

    // Find eligible providers in the service area
    const providers = await prisma.provider.findMany({
      where: {
        status: 'ACTIVE',
        autoBidEnabled: true,
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
        message: 'No eligible providers found in service area'
      }
    }

    // Filter by capacity and calculate bids
    const eligibleProviders = providers
      .filter(p => p.jobs.length < p.maxJobsPerDay)
      .map(provider => {
        let bidAmount: number

        if (provider.bidStrategy === 'PERCENTAGE_BELOW' && provider.bidPercentage) {
          // Bid X% below estimate
          bidAmount = estimatedPrice * (1 - provider.bidPercentage / 100)
        } else if (provider.bidStrategy === 'FIXED_AMOUNT' && provider.bidFixedAmount) {
          // Fixed bid amount
          bidAmount = provider.bidFixedAmount
        } else {
          // Default: bid at estimate
          bidAmount = estimatedPrice
        }

        // Round to 2 decimals
        bidAmount = Math.round(bidAmount * 100) / 100

        return {
          id: provider.id,
          businessName: provider.businessName,
          bidAmount,
          rating: provider.rating,
          totalJobs: provider.totalJobs,
          isPrimaryServiceArea: provider.serviceAreas.some(sa => sa.isPrimary)
        }
      })

    if (eligibleProviders.length === 0) {
      return {
        success: false,
        message: 'All providers at capacity for today'
      }
    }

    // Sort by:
    // 1. Lowest bid
    // 2. Primary service area
    // 3. Highest rating
    // 4. Most total jobs (experience)
    eligibleProviders.sort((a, b) => {
      if (a.bidAmount !== b.bidAmount) return a.bidAmount - b.bidAmount
      if (a.isPrimaryServiceArea !== b.isPrimaryServiceArea) {
        return a.isPrimaryServiceArea ? -1 : 1
      }
      if (a.rating !== b.rating) return b.rating - a.rating
      return b.totalJobs - a.totalJobs
    })

    const winner = eligibleProviders[0]

    // Create the assignment record (LeadDistribution)
    const leadDistribution = await prisma.leadDistribution.create({
      data: {
        quoteId: quote.id,
        providerId: winner.id,
        status: 'ACCEPTED',
        bidAmount: winner.bidAmount,
        isWinner: true,
        respondedAt: new Date()
      }
    })

    // Create the job record
    const job = await prisma.job.create({
      data: {
        quoteId: quote.id,
        providerId: winner.id,
        status: 'PENDING',
        finalPrice: winner.bidAmount
      }
    })

    // Update quote status to ACCEPTED
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: 'ACCEPTED' }
    })

    return {
      success: true,
      providerId: winner.id,
      providerName: winner.businessName,
      bidAmount: winner.bidAmount,
      jobId: job.id,
      message: `Assigned to ${winner.businessName} at $${winner.bidAmount}`
    }
  } catch (error: any) {
    console.error('Auto-assignment error:', error)
    return {
      success: false,
      message: error.message || 'Failed to auto-assign quote'
    }
  }
}

/**
 * Get provider's current job count for today
 */
export async function getProviderTodayJobCount(providerId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const count = await prisma.job.count({
    where: {
      providerId,
      scheduledDate: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  return count
}
