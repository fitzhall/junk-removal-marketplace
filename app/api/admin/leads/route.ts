import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { pickupAddress: { contains: search, mode: 'insensitive' } },
        { pickupCity: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      // Map frontend status to database status
      const statusMap: Record<string, any> = {
        'new': { status: 'PENDING', leadDistribution: { none: {} } },
        'distributed': { leadDistribution: { some: { status: 'SENT' } } },
        'accepted': { leadDistribution: { some: { status: 'ACCEPTED' } } },
        'completed': { job: { isNot: null, status: 'COMPLETED' } },
        'expired': { status: 'EXPIRED' },
        'disputed': { job: { status: 'CANCELLED' } }
      }

      if (statusMap[status]) {
        Object.assign(where, statusMap[status])
      }
    }

    // Fetch leads with related data
    const [leads, totalCount] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          leadDistribution: {
            include: {
              provider: {
                select: {
                  businessName: true,
                  rating: true
                }
              }
            }
          },
          job: true,
          items: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.quote.count({ where })
    ])

    // Transform leads to match frontend format
    const transformedLeads = leads.map(lead => {
      const distributions = lead.leadDistribution || []
      const acceptedDistribution = distributions.find(d => d.status === 'ACCEPTED')
      const sentCount = distributions.filter(d => d.status === 'SENT').length

      // Determine lead status
      let leadStatus = 'new'
      if (lead.job?.status === 'COMPLETED') {
        leadStatus = 'completed'
      } else if (lead.job?.status === 'CANCELLED') {
        leadStatus = 'disputed'
      } else if (lead.status === 'EXPIRED') {
        leadStatus = 'expired'
      } else if (acceptedDistribution) {
        leadStatus = 'accepted'
      } else if (sentCount > 0) {
        leadStatus = 'distributed'
      }

      // Calculate response time if accepted
      let responseTime = null
      if (acceptedDistribution) {
        const sentTime = acceptedDistribution.sentAt.getTime()
        const acceptedTime = acceptedDistribution.respondedAt?.getTime() || sentTime
        responseTime = Math.round((acceptedTime - sentTime) / 60000) // Convert to minutes
      }

      return {
        id: lead.id,
        customer: {
          name: lead.customerName || 'Anonymous',
          email: lead.customerEmail || '',
          phone: lead.customerPhone || ''
        },
        address: {
          street: lead.pickupAddress || '',
          city: lead.pickupCity || '',
          state: lead.pickupState || '',
          zip: lead.pickupZip || ''
        },
        status: leadStatus,
        value: lead.totalPrice || lead.priceRangeMax || 0,
        items: lead.items.length,
        photos: lead.photoUrls ? (Array.isArray(lead.photoUrls) ? lead.photoUrls.length : 1) : 0,
        date: lead.createdAt.toISOString(),
        urgent: lead.isUrgent || false,
        distributedTo: sentCount,
        acceptedBy: acceptedDistribution ? {
          name: acceptedDistribution.provider.businessName,
          rating: acceptedDistribution.provider.rating,
          responseTime: responseTime ? `${responseTime} min` : null
        } : null,
        revenue: lead.job?.finalPrice || 0,
        commission: lead.job?.platformFee || 0
      }
    })

    // Calculate statistics
    const stats = await calculateLeadStats()

    return NextResponse.json({
      leads: transformedLeads,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching admin leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

async function calculateLeadStats() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    newCount,
    distributedCount,
    acceptedCount,
    completedCount,
    expiredCount,
    disputedCount,
    orphanedCount,
    todayRevenue,
    avgResponseTimes
  ] = await Promise.all([
    // New leads (no distributions)
    prisma.quote.count({
      where: {
        status: 'PENDING',
        leadDistribution: { none: {} }
      }
    }),

    // Distributed leads (sent but not accepted)
    prisma.leadDistribution.count({
      where: { status: 'SENT' }
    }),

    // Accepted leads
    prisma.leadDistribution.count({
      where: { status: 'ACCEPTED' }
    }),

    // Completed jobs
    prisma.job.count({
      where: { status: 'COMPLETED' }
    }),

    // Expired leads
    prisma.quote.count({
      where: { status: 'EXPIRED' }
    }),

    // Disputed (cancelled jobs)
    prisma.job.count({
      where: { status: 'CANCELLED' }
    }),

    // Orphaned leads (distributed > 24hrs ago, not accepted)
    prisma.leadDistribution.count({
      where: {
        status: 'SENT',
        sentAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      }
    }),

    // Today's revenue
    prisma.job.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: today }
      },
      _sum: { platformFee: true }
    }),

    // Average response times
    prisma.leadDistribution.findMany({
      where: {
        status: 'ACCEPTED',
        respondedAt: { not: null }
      },
      select: {
        sentAt: true,
        respondedAt: true
      }
    })
  ])

  // Calculate average response time
  let avgResponseTime = 0
  if (avgResponseTimes.length > 0) {
    const totalTime = avgResponseTimes.reduce((sum, dist) => {
      const responseTime = dist.respondedAt!.getTime() - dist.sentAt.getTime()
      return sum + responseTime
    }, 0)
    avgResponseTime = Math.round(totalTime / avgResponseTimes.length / 60000) // Convert to minutes
  }

  // Calculate conversion rate
  const totalDistributed = distributedCount + acceptedCount
  const conversionRate = totalDistributed > 0
    ? Math.round((acceptedCount / totalDistributed) * 100)
    : 0

  return {
    new: newCount,
    distributed: distributedCount,
    accepted: acceptedCount,
    completed: completedCount,
    expired: expiredCount,
    disputed: disputedCount,
    orphaned: orphanedCount,
    avgResponseTime: `${avgResponseTime} min`,
    todayRevenue: todayRevenue._sum.platformFee || 0,
    conversionRate: `${conversionRate}%`
  }
}