import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireProviderAuth } from '@/lib/auth-middleware'

export async function GET(request: Request) {
  try {
    // Get provider ID from authenticated session
    const authResult = await requireProviderAuth()
    if ('error' in authResult) {
      return authResult
    }
    const { providerId } = authResult

    if (!providerId) {
      return NextResponse.json({ leads: [] })
    }

    // Get leads that were distributed to this provider
    const leadDistributions = await prisma.leadDistribution.findMany({
      where: {
        providerId: providerId
      },
      include: {
        quote: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Transform into lead format
    const leads = leadDistributions.map(dist => {
      const quote = dist.quote
      return {
        id: quote.id,
        distributionId: dist.id,
        customerName: quote.customerName || 'Customer',
        customerEmail: quote.customerEmail || 'not provided',
        customerPhone: quote.customerPhone || 'not provided',
        address: `${quote.pickupAddress || ''}, ${quote.pickupCity || ''}, ${quote.pickupState || ''} ${quote.pickupZip || ''}`,
        description: (quote.aiAnalysis as any)?.summary || 'Junk removal needed',
        preferredDate: quote.preferredDate,
        preferredTime: quote.preferredTimeWindow || 'Flexible',
        photos: Array.isArray(quote.photoUrls) ? quote.photoUrls : [],
        items: (quote.aiAnalysis as any)?.items || [],
        estimatedValue: quote.totalPrice || quote.priceRangeMax || 0,
        // Map statuses: SENT=new, VIEWED=contacted, ACCEPTED=won, DECLINED=lost
        status: dist.status === 'SENT' ? 'new' :
                dist.status === 'VIEWED' ? 'contacted' :
                dist.status === 'ACCEPTED' ? 'won' :
                dist.status === 'DECLINED' ? 'lost' : 'new',
        createdAt: quote.createdAt,
        deliveredAt: dist.sentAt,
        urgency: quote.isUrgent ? 'high' : 'medium',
        propertyType: 'Residential'
      }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}