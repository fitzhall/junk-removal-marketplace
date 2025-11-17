import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get first provider
    const provider = await prisma.provider.findFirst()

    // Get all lead distributions
    const allDistributions = await prisma.leadDistribution.findMany({
      include: {
        provider: { select: { businessName: true } },
        quote: { select: { customerName: true } }
      }
    })

    // Get distributions for first provider
    const providerDistributions = await prisma.leadDistribution.findMany({
      where: { providerId: provider?.id },
      include: {
        quote: {
          include: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({
      firstProvider: {
        id: provider?.id,
        name: provider?.businessName
      },
      allDistributions: allDistributions.length,
      allDistributionsList: allDistributions.map(d => ({
        id: d.id,
        providerId: d.providerId,
        providerName: d.provider.businessName,
        customerName: d.quote.customerName,
        status: d.status
      })),
      providerDistributions: providerDistributions.length,
      providerDistributionsList: providerDistributions.map(d => ({
        id: d.id,
        quoteId: d.quoteId,
        status: d.status,
        hasQuote: !!d.quote
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
