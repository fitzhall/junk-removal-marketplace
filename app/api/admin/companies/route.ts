import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        customDomain: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        isActive: true,
        monthlyFee: true,
        createdAt: true,
        _count: {
          select: {
            quotes: true,
            providers: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      companies,
    })
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
