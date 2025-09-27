import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { bidAmount } = await request.json()
    const leadId = params.id

    // Log the bid amount for tracking
    console.log(`Lead ${leadId} accepted with bid amount: $${bidAmount}`)

    // For demo, we'll just update a flag in the quote
    // In production, this would update lead_distributions table
    const quote = await prisma.quote.update({
      where: { id: leadId },
      data: {
        status: 'ACCEPTED'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lead accepted successfully',
      quote
    })
  } catch (error) {
    console.error('Error accepting lead:', error)
    return NextResponse.json(
      { error: 'Failed to accept lead' },
      { status: 500 }
    )
  }
}