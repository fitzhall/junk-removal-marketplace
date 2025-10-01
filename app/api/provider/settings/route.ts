import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      providerId,
      autoBidEnabled,
      bidStrategy,
      bidPercentage,
      bidFixedAmount,
      maxJobsPerDay,
      minJobValue,
      maxJobValue
    } = body

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // Validate bid strategy
    if (autoBidEnabled) {
      if (!bidStrategy || !['PERCENTAGE_BELOW', 'FIXED_AMOUNT'].includes(bidStrategy)) {
        return NextResponse.json(
          { error: 'Valid bid strategy is required when auto-bid is enabled' },
          { status: 400 }
        )
      }

      if (bidStrategy === 'PERCENTAGE_BELOW' && (!bidPercentage || bidPercentage < 0 || bidPercentage > 50)) {
        return NextResponse.json(
          { error: 'Bid percentage must be between 0 and 50' },
          { status: 400 }
        )
      }

      if (bidStrategy === 'FIXED_AMOUNT' && (!bidFixedAmount || bidFixedAmount < 0)) {
        return NextResponse.json(
          { error: 'Fixed bid amount must be greater than 0' },
          { status: 400 }
        )
      }
    }

    // Update provider settings
    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        autoBidEnabled,
        bidStrategy: autoBidEnabled ? bidStrategy : null,
        bidPercentage: autoBidEnabled && bidStrategy === 'PERCENTAGE_BELOW' ? bidPercentage : null,
        bidFixedAmount: autoBidEnabled && bidStrategy === 'FIXED_AMOUNT' ? bidFixedAmount : null,
        maxJobsPerDay,
        minJobValue,
        maxJobValue
      }
    })

    return NextResponse.json({
      success: true,
      provider: {
        id: updatedProvider.id,
        autoBidEnabled: updatedProvider.autoBidEnabled,
        bidStrategy: updatedProvider.bidStrategy,
        bidPercentage: updatedProvider.bidPercentage,
        bidFixedAmount: updatedProvider.bidFixedAmount,
        maxJobsPerDay: updatedProvider.maxJobsPerDay,
        minJobValue: updatedProvider.minJobValue,
        maxJobValue: updatedProvider.maxJobValue
      }
    })
  } catch (error: any) {
    console.error('Error updating provider settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
