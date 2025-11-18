import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Removed NextAuth dependency - using Supabase auth directly in dashboard

export async function GET() {
  // This API route is deprecated - provider dashboard now uses Supabase directly
  return NextResponse.json(
    { message: 'This API is deprecated. Use Supabase client directly.' },
    { status: 410 }
  )
}

export async function GET_DEPRECATED() {
  try {
    // Old implementation kept for reference
    return NextResponse.json({ error: 'Deprecated' }, { status: 410 })
    }
    const { providerId } = authResult

    // Get total leads distributed to this specific provider
    const totalLeads = await prisma.leadDistribution.count({
      where: { providerId }
    })

    // Get accepted leads for this provider
    const acceptedLeads = await prisma.leadDistribution.count({
      where: {
        providerId,
        status: 'ACCEPTED'
      }
    })

    // Get completed jobs and calculate revenue for this provider
    const completedJobs = await prisma.job.findMany({
      where: {
        providerId,
        status: 'COMPLETED'
      },
      select: { finalPrice: true }
    })

    const revenue = completedJobs.reduce((sum, job) => sum + (job.finalPrice || 0), 0)

    // Calculate conversion rate
    const conversionRate = totalLeads > 0
      ? Math.round((acceptedLeads / totalLeads) * 100)
      : 0

    const stats = {
      totalLeads,
      acceptedLeads,
      revenue,
      conversionRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching provider stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}