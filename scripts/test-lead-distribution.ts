import { PrismaClient } from '@prisma/client'
import { distributeLeadToProviders } from '../lib/lead-distribution-new'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Testing lead distribution...\n')

  // Find the most recent quote
  const quote = await prisma.quote.findFirst({
    where: {
      status: 'PENDING',
      pickupZip: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  })

  if (!quote) {
    console.error('❌ No PENDING quotes found')
    return
  }

  console.log('📋 Found quote:')
  console.log(`   ID: ${quote.id}`)
  console.log(`   Customer: ${quote.customerName}`)
  console.log(`   Location: ${quote.pickupZip}`)
  console.log(`   Price: $${quote.priceRangeMin}-$${quote.priceRangeMax}`)
  console.log(`   Items: ${quote.items.length}\n`)

  // Distribute the lead
  const result = await distributeLeadToProviders({
    id: quote.id,
    pickupZip: quote.pickupZip!,
    priceRangeMin: quote.priceRangeMin,
    priceRangeMax: quote.priceRangeMax,
    items: quote.items.map(item => ({
      itemType: item.itemType,
      quantity: item.quantity
    }))
  })

  if (result.success) {
    console.log('✅ Lead distributed successfully!')
    console.log(`   Providers notified: ${result.providersNotified}`)
    console.log('\n📨 Providers:')
    result.providers.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.businessName} (Distribution ID: ${provider.distributionId})`)
    })
    console.log('\n✨ Providers can now see this lead in their dashboard!')
    console.log('   Go to: http://localhost:3002/provider')
  } else {
    console.error('❌ Lead distribution failed:', result.message)
  }

  // Show all lead distributions
  console.log('\n📊 All lead distributions for this quote:')
  const distributions = await prisma.leadDistribution.findMany({
    where: { quoteId: quote.id },
    include: { provider: { select: { businessName: true } } }
  })

  distributions.forEach((dist, index) => {
    console.log(`   ${index + 1}. ${dist.provider.businessName} - Status: ${dist.status} - Sent: ${dist.sentAt.toLocaleString()}`)
  })
}

main()
  .catch((e) => {
    console.error('Error testing lead distribution:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
