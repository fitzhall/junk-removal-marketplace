import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { markLeadAsWon } from '@/lib/lead-distribution-new'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, distributionId } = await request.json()
    const quoteId = params.id

    // If marking as won, create the job and mark other distributions as lost
    if (status === 'won') {
      const result = await markLeadAsWon(distributionId)

      if (!result.success) {
        return NextResponse.json(
          { error: result.message || 'Failed to mark lead as won' },
          { status: 500 }
        )
      }

      console.log(`Lead ${quoteId} won! Job created: ${result.jobId}`)

      return NextResponse.json({
        success: true,
        message: 'Lead marked as won and job created',
        jobId: result.jobId
      })
    }

    // For other statuses (contacted, lost), just update the distribution
    const statusMap: Record<string, string> = {
      'contacted': 'VIEWED',
      'lost': 'DECLINED'
    }

    const dbStatus = statusMap[status] || 'SENT'

    await prisma.leadDistribution.update({
      where: { id: distributionId },
      data: {
        status: dbStatus as any,
        respondedAt: status !== 'new' ? new Date() : undefined,
        responseReason: status === 'lost' ? 'Provider declined' : undefined
      }
    })

    console.log(`Lead ${quoteId} status updated to: ${status}`)

    return NextResponse.json({
      success: true,
      message: `Lead marked as ${status}`
    })
  } catch (error) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}
