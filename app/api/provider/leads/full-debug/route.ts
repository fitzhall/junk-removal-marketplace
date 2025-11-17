import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({ take: 1 })
    const providerId = providers[0]?.id

    if (!providerId) {
      return NextResponse.json({ error: 'No provider found' })
    }

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

    // Transform into lead format (same as main API)
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

    return NextResponse.json({
      providerId,
      providerName: providers[0]?.businessName,
      distributionsFound: leadDistributions.length,
      leads
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
