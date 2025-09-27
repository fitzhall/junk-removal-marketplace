import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date()
    const previousPeriodStart = new Date()

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        previousPeriodStart.setDate(now.getDate() - 14)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        previousPeriodStart.setMonth(now.getMonth() - 2)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        previousPeriodStart.setMonth(now.getMonth() - 6)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        previousPeriodStart.setFullYear(now.getFullYear() - 2)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
        previousPeriodStart.setMonth(now.getMonth() - 2)
    }

    // Fetch financial data
    const [
      currentPeriodJobs,
      previousPeriodJobs,
      allCompletedJobs,
      allProviders,
      recentJobs,
      pendingJobs
    ] = await Promise.all([
      // Current period jobs
      prisma.job.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        select: {
          finalPrice: true,
          platformFee: true,
          providerPayout: true,
          createdAt: true
        }
      }),

      // Previous period jobs for comparison
      prisma.job.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate
          }
        },
        select: {
          platformFee: true
        }
      }),

      // All completed jobs for LTV calculation
      prisma.job.findMany({
        where: {
          status: 'COMPLETED'
        },
        select: {
          platformFee: true,
          providerId: true,
          quote: {
            select: {
              userId: true,
              createdAt: true
            }
          }
        }
      }),

      // All providers for tier revenue calculation
      prisma.provider.findMany({
        select: {
          id: true,
          rating: true,
          jobs: {
            where: {
              status: 'COMPLETED',
              createdAt: { gte: startDate }
            },
            select: {
              platformFee: true
            }
          }
        }
      }),

      // Recent transactions (completed jobs as transactions)
      prisma.job.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        include: {
          provider: {
            select: {
              businessName: true
            }
          },
          quote: {
            select: {
              customerName: true,
              customerEmail: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),

      // Pending invoices (jobs not completed but confirmed)
      prisma.job.findMany({
        where: {
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS']
          }
        },
        include: {
          provider: {
            select: {
              businessName: true
            }
          },
          quote: {
            select: {
              customerName: true,
              totalPrice: true,
              pickupAddress: true
            }
          }
        },
        orderBy: { scheduledDate: 'asc' }
      })
    ])

    // Calculate revenue metrics
    const currentRevenue = currentPeriodJobs.reduce((sum, job) => sum + (job.platformFee || 0), 0)
    const previousRevenue = previousPeriodJobs.reduce((sum, job) => sum + (job.platformFee || 0), 0)
    const totalRevenue = currentRevenue + previousRevenue

    // Calculate MRR (Monthly Recurring Revenue)
    // For this business model, we'll use average monthly platform fees
    const daysInPeriod = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const mrr = daysInPeriod > 0 ? (currentRevenue / daysInPeriod) * 30 : 0

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12

    // Calculate revenue growth
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    // Calculate revenue by tier (based on provider rating)
    const revenueByTier = {
      elite: 0,
      professional: 0,
      basic: 0
    }

    allProviders.forEach(provider => {
      const providerRevenue = provider.jobs.reduce((sum, job) => sum + (job.platformFee || 0), 0)
      if (provider.rating >= 4.5) {
        revenueByTier.elite += providerRevenue
      } else if (provider.rating >= 3.5) {
        revenueByTier.professional += providerRevenue
      } else {
        revenueByTier.basic += providerRevenue
      }
    })

    // Calculate churn rate
    // For this business, we'll calculate provider churn (providers who haven't completed jobs recently)
    const activeProviders = await prisma.provider.count({
      where: {
        status: 'ACTIVE',
        jobs: {
          some: {
            status: 'COMPLETED',
            createdAt: { gte: startDate }
          }
        }
      }
    })

    const totalActiveProviders = await prisma.provider.count({
      where: { status: 'ACTIVE' }
    })

    const churnRate = totalActiveProviders > 0
      ? ((totalActiveProviders - activeProviders) / totalActiveProviders) * 100
      : 0

    // Calculate LTV (Lifetime Value)
    // Average revenue per customer
    const customerRevenue = new Map<string, number>()
    allCompletedJobs.forEach(job => {
      const customerId = job.quote?.userId || 'anonymous'
      const current = customerRevenue.get(customerId) || 0
      customerRevenue.set(customerId, current + (job.platformFee || 0))
    })

    const avgLtv = customerRevenue.size > 0
      ? Array.from(customerRevenue.values()).reduce((a, b) => a + b, 0) / customerRevenue.size
      : 0

    // Calculate CAC (Customer Acquisition Cost)
    // Estimated based on marketing spend per quote
    const estimatedMarketingCostPerLead = 50 // This should come from actual marketing data
    const totalQuotes = await prisma.quote.count({
      where: {
        createdAt: { gte: startDate }
      }
    })
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: startDate }
      }
    })

    const cac = totalCustomers > 0
      ? (estimatedMarketingCostPerLead * totalQuotes) / totalCustomers
      : 0

    // Transform transactions
    const transactions = recentJobs.map(job => ({
      id: job.id,
      date: job.createdAt.toISOString(),
      customer: job.quote?.customerName || 'Anonymous',
      provider: job.provider.businessName,
      amount: job.finalPrice || 0,
      commission: job.platformFee || 0,
      status: 'completed' as const,
      type: 'job_completion' as const,
      method: 'credit_card' as const // This should come from actual payment data
    }))

    // Transform pending invoices
    const invoices = pendingJobs.map(job => ({
      id: job.id,
      dueDate: job.scheduledDate?.toISOString() || new Date().toISOString(),
      customer: job.quote?.customerName || 'Anonymous',
      provider: job.provider.businessName,
      amount: job.quote?.totalPrice || 0,
      status: job.status === 'CONFIRMED' ? ('pending' as const) : ('overdue' as const),
      description: `Job at ${job.quote?.pickupAddress || 'Unknown location'}`
    }))

    // Calculate collection rate
    const totalExpectedRevenue = currentRevenue + invoices.reduce((sum, inv) => sum + inv.amount * 0.15, 0) // 15% platform fee
    const collectionRate = totalExpectedRevenue > 0
      ? (currentRevenue / totalExpectedRevenue) * 100
      : 100

    // Calculate total transactions count for pagination
    const totalTransactions = await prisma.job.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      }
    })

    return NextResponse.json({
      metrics: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        ltv: Math.round(avgLtv * 100) / 100,
        cac: Math.round(cac * 100) / 100,
        collectionRate: Math.round(collectionRate * 10) / 10
      },
      revenueByTier: {
        elite: Math.round(revenueByTier.elite * 100) / 100,
        professional: Math.round(revenueByTier.professional * 100) / 100,
        basic: Math.round(revenueByTier.basic * 100) / 100
      },
      transactions,
      invoices,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        pages: Math.ceil(totalTransactions / limit)
      },
      summary: {
        currentPeriodRevenue: Math.round(currentRevenue * 100) / 100,
        previousPeriodRevenue: Math.round(previousRevenue * 100) / 100,
        activeProviders,
        totalProviders: totalActiveProviders,
        completedJobs: currentPeriodJobs.length,
        pendingInvoices: invoices.length,
        averageTransactionValue: currentPeriodJobs.length > 0
          ? Math.round((currentRevenue / currentPeriodJobs.length) * 100) / 100
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching admin finance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finance data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}