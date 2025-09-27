import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // TODO: Get the actual provider ID from session/auth
    // For now, we'll return aggregate stats for all providers

    // Get total leads distributed to providers
    const totalLeads = await prisma.leadDistribution.count()

    // Get accepted leads
    const acceptedLeads = await prisma.leadDistribution.count({
      where: { status: 'ACCEPTED' }
    })

    // Get completed jobs and calculate revenue
    const completedJobs = await prisma.job.findMany({
      where: { status: 'COMPLETED' },
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