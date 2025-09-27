import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'today'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    // Fetch real data from database
    const [
      totalQuotes,
      ,// acceptedQuotes - unused
      ,// totalProviders - unused
      activeProviders,
      ,// totalJobs - unused
      completedJobs,
      recentQuotes,
      // recentProviders - unused
    ] = await Promise.all([
      // Total quotes
      prisma.quote.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      // Accepted quotes
      prisma.quote.count({
        where: {
          status: 'ACCEPTED',
          createdAt: { gte: startDate }
        }
      }),
      // Total providers
      prisma.provider.count(),
      // Active providers
      prisma.provider.count({
        where: { status: 'ACTIVE' }
      }),
      // Total jobs
      prisma.job.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      // Completed jobs
      prisma.job.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      // Recent quotes for revenue calculation
      prisma.quote.findMany({
        where: {
          createdAt: { gte: startDate },
          totalPrice: { not: null }
        },
        select: {
          totalPrice: true
        }
      }),
      // Recent providers by status
      prisma.provider.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    // Calculate revenue
    const totalRevenue = recentQuotes.reduce((sum, quote) => sum + (quote.totalPrice || 0), 0)

    // Calculate conversion rate
    const conversionRate = totalQuotes > 0
      ? Math.round((completedJobs / totalQuotes) * 100)
      : 0

    // Get lead distribution stats
    const leadDistribution = await prisma.leadDistribution.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true
    })

    const leadStats = {
      sent: leadDistribution.find(l => l.status === 'SENT')?._count || 0,
      viewed: leadDistribution.find(l => l.status === 'VIEWED')?._count || 0,
      accepted: leadDistribution.find(l => l.status === 'ACCEPTED')?._count || 0,
      declined: leadDistribution.find(l => l.status === 'DECLINED')?._count || 0
    }

    // Get provider tier distribution
    const providerTiers = await prisma.provider.groupBy({
      by: ['status'],
      _count: true
    })

    // Get geographic data
    const topAreas = await prisma.quote.groupBy({
      by: ['pickupCity'],
      where: {
        pickupCity: { not: null },
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: {
        _count: {
          pickupCity: 'desc'
        }
      },
      take: 5
    })

    // Get recent activity
    const recentActivity = await prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalPrice: true,
        pickupCity: true,
        createdAt: true,
        status: true,
        customerName: true
      }
    })

    const stats = {
      kpis: {
        totalRevenue,
        activeLeads: totalQuotes - completedJobs,
        activeProviders,
        conversionRate
      },
      leadFlow: {
        incoming: totalQuotes,
        distributed: leadStats.sent + leadStats.viewed + leadStats.accepted,
        accepted: leadStats.accepted,
        completed: completedJobs
      },
      providerTiers: {
        elite: providerTiers.find(p => p.status === 'ACTIVE')?._count || 0,
        professional: providerTiers.find(p => p.status === 'PENDING')?._count || 0,
        basic: providerTiers.find(p => p.status === 'SUSPENDED')?._count || 0
      },
      topAreas: topAreas.map(area => ({
        city: area.pickupCity || 'Unknown',
        leads: area._count,
        providers: Math.floor(Math.random() * 20) + 5, // TODO: Get actual provider count by area
        coverage: area._count > 20 ? 'excellent' : area._count > 10 ? 'good' : area._count > 5 ? 'low' : 'critical'
      })),
      recentActivity: recentActivity.map(quote => ({
        type: 'lead',
        message: `New $${quote.totalPrice || 0} lead in ${quote.pickupCity || 'Unknown'}`,
        time: getRelativeTime(quote.createdAt),
        urgent: quote.status === 'PENDING'
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}