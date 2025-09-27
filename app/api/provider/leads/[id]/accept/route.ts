import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { leadService } from '@/lib/lead-service'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get provider
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Verify this lead belongs to this provider
    const leadDistribution = await prisma.leadDistribution.findFirst({
      where: {
        id: params.id,
        providerId: provider.id
      }
    })

    if (!leadDistribution) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check if already responded
    if (leadDistribution.status !== 'SENT' && leadDistribution.status !== 'VIEWED') {
      return NextResponse.json(
        { error: 'Lead already responded to' },
        { status: 400 }
      )
    }

    // Accept the lead
    const updatedLead = await leadService.acceptLead(params.id, 25) // TODO: Dynamic pricing

    // TODO: Charge the provider for the lead
    // - Check subscription or credits
    // - Create charge record
    // - Send receipt

    return NextResponse.json({
      success: true,
      lead: updatedLead
    })

  } catch (error) {
    console.error('Error accepting lead:', error)
    return NextResponse.json(
      { error: 'Failed to accept lead' },
      { status: 500 }
    )
  }
}