import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // For demo, we'll get all quotes as leads
    // In production, this would filter by provider's service area and subscription
    const quotes = await prisma.quote.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Transform quotes into lead format
    const leads = quotes.map(quote => ({
      id: quote.id,
      customerName: quote.customerName || 'Customer',
      customerEmail: quote.customerEmail || 'not provided',
      customerPhone: quote.customerPhone || 'not provided',
      address: `${quote.pickupAddress || ''}, ${quote.pickupCity || ''}, ${quote.pickupState || ''} ${quote.pickupZip || ''}`,
      description: (quote.aiAnalysis as any)?.summary || 'Junk removal needed',
      preferredDate: quote.preferredDate,
      preferredTime: quote.preferredTimeWindow || 'Flexible',
      photos: Array.isArray(quote.photoUrls) ? quote.photoUrls : [],
      items: (quote.aiAnalysis as any)?.items || [],
      estimatedValue: quote.totalPrice || Math.floor(Math.random() * 800) + 200,
      status: quote.status === 'ACCEPTED' ? 'accepted' : quote.status === 'EXPIRED' ? 'declined' : 'new',
      createdAt: quote.createdAt,
      urgency: quote.isUrgent ? 'high' : 'medium',
      propertyType: 'Residential'
    }))

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}