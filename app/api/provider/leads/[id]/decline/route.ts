import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()
    const leadId = params.id

    // Log the decline reason for analytics
    console.log(`Lead ${leadId} declined. Reason: ${reason}`)

    // For demo, we'll just update a flag in the quote
    // In production, this would update lead_distributions table
    const quote = await prisma.quote.update({
      where: { id: leadId },
      data: {
        status: 'EXPIRED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lead declined successfully',
      quote
    })
  } catch (error) {
    console.error('Error declining lead:', error)
    return NextResponse.json(
      { error: 'Failed to decline lead' },
      { status: 500 }
    )
  }
}