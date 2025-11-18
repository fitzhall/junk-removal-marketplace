import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')
    const customDomain = searchParams.get('customDomain')

    if (!subdomain && !customDomain) {
      return NextResponse.json(
        { error: 'Either subdomain or customDomain is required' },
        { status: 400 }
      )
    }

    // Query company by subdomain or custom domain
    const company = await prisma.company.findFirst({
      where: subdomain
        ? { subdomain }
        : { customDomain },
      select: {
        id: true,
        slug: true,
        subdomain: true,
        customDomain: true,
        domainVerified: true,
        isActive: true,
        businessName: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        subscriptionStatus: true,
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // If using custom domain, check if it's verified
    if (customDomain && !company.domainVerified) {
      return NextResponse.json(
        { error: 'Custom domain not verified' },
        { status: 403 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error resolving company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
