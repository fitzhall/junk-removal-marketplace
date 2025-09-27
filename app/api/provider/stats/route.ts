import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // For demo purposes, return mock stats
    // In production, this would calculate from lead_distributions table
    const totalQuotes = await prisma.quote.count()

    const stats = {
      totalLeads: totalQuotes,
      acceptedLeads: Math.floor(totalQuotes * 0.3),
      revenue: Math.floor(totalQuotes * 450 * 0.3), // Average job value * conversion
      conversionRate: 30
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}