import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const tier = searchParams.get('tier') || 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessPhone: { contains: search } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Note: Tier filtering would require a tier field in the schema
    // For now, we'll use status or rating as a proxy
    if (tier !== 'all') {
      if (tier === 'elite') {
        where.rating = { gte: 4.5 }
      } else if (tier === 'professional') {
        where.rating = { gte: 3.5, lt: 4.5 }
      } else if (tier === 'basic') {
        where.rating = { lt: 3.5 }
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === 'name') {
      orderBy = { businessName: sortOrder }
    } else if (sortBy === 'credits') {
      // Credits would need to be calculated from lead distribution
      orderBy = { createdAt: sortOrder }
    } else if (sortBy === 'acceptanceRate') {
      // Acceptance rate needs calculation, default to rating
      orderBy = { rating: sortOrder }
    } else if (sortBy === 'revenue') {
      // Revenue needs calculation, default to totalJobs
      orderBy = { totalJobs: sortOrder }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Fetch providers with related data
    const [providers, totalCount] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              name: true,
              phone: true,
              createdAt: true
            }
          },
          serviceAreas: {
            select: {
              city: true,
              state: true,
              zipCode: true,
              isPrimary: true
            }
          },
          leadDistribution: {
            select: {
              status: true,
              sentAt: true,
              respondedAt: true,
              bidAmount: true,
              isWinner: true
            }
          },
          jobs: {
            select: {
              status: true,
              finalPrice: true,
              providerPayout: true,
              platformFee: true,
              createdAt: true,
              customerRating: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.provider.count({ where })
    ])

    // Calculate stats for overview
    const stats = await calculateProviderStats()

    // Transform providers to match frontend format
    const transformedProviders = providers.map(provider => {
      const leadDistributions = provider.leadDistribution || []
      const jobs = provider.jobs || []

      // Calculate lead credits (remaining leads they can receive)
      const totalLeadsReceived = leadDistributions.length
      const acceptedLeads = leadDistributions.filter(d => d.status === 'ACCEPTED').length
      const leadCredits = Math.max(0, 100 - totalLeadsReceived) // Arbitrary credit system

      // Calculate acceptance rate
      const acceptanceRate = totalLeadsReceived > 0
        ? Math.round((acceptedLeads / totalLeadsReceived) * 100)
        : 0

      // Calculate average response time
      const responseTimes = leadDistributions
        .filter(d => d.respondedAt)
        .map(d => d.respondedAt!.getTime() - d.sentAt.getTime())

      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 60000)
        : 0

      // Calculate revenue
      const totalRevenue = jobs.reduce((sum, job) => sum + (job.providerPayout || 0), 0)
      const platformRevenue = jobs.reduce((sum, job) => sum + (job.platformFee || 0), 0)

      // Get last active time
      const lastJobDate = jobs.length > 0
        ? jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null

      const lastResponseDate = leadDistributions
        .filter(d => d.respondedAt)
        .sort((a, b) => b.respondedAt!.getTime() - a.respondedAt!.getTime())[0]?.respondedAt

      const lastActive = lastJobDate && lastResponseDate
        ? new Date(Math.max(lastJobDate.getTime(), lastResponseDate.getTime()))
        : lastJobDate || lastResponseDate || provider.user.createdAt

      // Determine tier based on rating and performance
      let tier = 'Basic'
      if (provider.rating >= 4.5 && acceptanceRate >= 80 && totalRevenue > 10000) {
        tier = 'Elite'
      } else if (provider.rating >= 3.5 && acceptanceRate >= 60) {
        tier = 'Professional'
      }

      // Get primary service area
      const primaryArea = provider.serviceAreas.find(a => a.isPrimary) || provider.serviceAreas[0]
      const serviceArea = primaryArea
        ? `${primaryArea.city}, ${primaryArea.state}`
        : 'Not set'

      return {
        id: provider.id,
        name: provider.businessName,
        email: provider.user.email,
        phone: provider.user.phone || provider.businessPhone || '',
        status: provider.status.toLowerCase() as 'active' | 'pending' | 'suspended',
        tier: tier as 'Elite' | 'Professional' | 'Basic',
        rating: Number(provider.rating.toFixed(1)),
        serviceArea,
        totalJobs: provider.totalJobs,
        completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
        leadCredits,
        acceptanceRate,
        responseTime: avgResponseTime > 0 ? `${avgResponseTime} min` : 'N/A',
        revenue: totalRevenue,
        platformRevenue,
        lastActive: lastActive.toISOString(),
        joinedDate: provider.user.createdAt.toISOString(),
        licenseNumber: provider.licenseNumber || '',
        activeLeads: leadDistributions.filter(d => d.status === 'SENT' || d.status === 'VIEWED').length
      }
    })

    return NextResponse.json({
      providers: transformedProviders,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching admin providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function calculateProviderStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalProviders,
    activeProviders,
    pendingProviders,
    suspendedProviders,
    allProviders,
    allLeadDistributions,
    allJobs
  ] = await Promise.all([
    prisma.provider.count(),
    prisma.provider.count({ where: { status: 'ACTIVE' } }),
    prisma.provider.count({ where: { status: 'PENDING' } }),
    prisma.provider.count({ where: { status: 'SUSPENDED' } }),

    // Get all providers with their data for calculations
    prisma.provider.findMany({
      include: {
        leadDistribution: {
          select: {
            status: true,
            sentAt: true,
            respondedAt: true
          }
        },
        jobs: {
          select: {
            platformFee: true,
            status: true
          }
        }
      }
    }),

    // Get recent lead distributions
    prisma.leadDistribution.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        status: true,
        sentAt: true,
        respondedAt: true
      }
    }),

    // Get all jobs for revenue calculation
    prisma.job.findMany({
      select: {
        platformFee: true,
        status: true
      }
    })
  ])

  // Calculate total revenue from platform fees
  const totalRevenue = allJobs.reduce((sum, job) => sum + (job.platformFee || 0), 0)

  // Calculate average acceptance rate
  let totalAcceptanceRate = 0
  let providersWithLeads = 0

  allProviders.forEach(provider => {
    const distributions = provider.leadDistribution || []
    if (distributions.length > 0) {
      const accepted = distributions.filter(d => d.status === 'ACCEPTED').length
      const rate = (accepted / distributions.length) * 100
      totalAcceptanceRate += rate
      providersWithLeads++
    }
  })

  const avgAcceptanceRate = providersWithLeads > 0
    ? Math.round(totalAcceptanceRate / providersWithLeads)
    : 0

  // Calculate average response time from recent distributions
  const responseTimes = allLeadDistributions
    .filter(d => d.respondedAt)
    .map(d => d.respondedAt!.getTime() - d.sentAt.getTime())

  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 60000)
    : 0

  return {
    total: totalProviders,
    active: activeProviders,
    pending: pendingProviders,
    suspended: suspendedProviders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgAcceptanceRate,
    avgResponseTime: `${avgResponseTime} min`
  }
}