import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteId, scheduledDate, timeSlot, isUrgent } = body

    // Validate required fields
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    if (!isUrgent && (!scheduledDate || !timeSlot)) {
      return NextResponse.json(
        { error: 'Scheduled date and time slot are required' },
        { status: 400 }
      )
    }

    // Get the quote
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Calculate final price with urgency multiplier
    let finalPrice = quote.totalPrice
    if (isUrgent) {
      finalPrice = Math.round(finalPrice * 1.5)
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        quoteId: quote.id,
        status: 'PENDING',
        scheduledDate: isUrgent ? new Date() : new Date(scheduledDate),
        timeSlot: timeSlot || 'ASAP',
        isUrgent: isUrgent || false,
        estimatedPrice: finalPrice,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        pickupAddress: quote.pickupAddress,
        pickupZip: quote.pickupZip,
        pickupCity: quote.pickupCity,
        pickupState: quote.pickupState
      }
    })

    // Update quote status
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'BOOKED' }
    })

    // TODO: Send confirmation email
    // TODO: Notify providers

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        scheduledDate: booking.scheduledDate,
        timeSlot: booking.timeSlot,
        estimatedPrice: booking.estimatedPrice,
        status: booking.status
      }
    })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'