import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📝 Creating test quote...')

  const quote = await prisma.quote.create({
    data: {
      status: 'PENDING',
      customerName: 'John Test Customer',
      customerEmail: 'john@test.com',
      customerPhone: '+14155559999',
      pickupAddress: '123 Market St',
      pickupZip: '94102', // San Francisco - matches Bay Area Junk Pros
      pickupCity: 'San Francisco',
      pickupState: 'CA',
      photoUrls: ['https://example.com/photo1.jpg'],
      estimatedVolume: 'HALF',
      priceRangeMin: 200,
      priceRangeMax: 350,
      totalPrice: 275,
      isUrgent: false,
      source: 'web',
      items: {
        create: [
          {
            itemType: 'Sofa',
            quantity: 1,
            aiConfidence: 0.95,
            requiresSpecialHandling: false
          },
          {
            itemType: 'Mattress',
            quantity: 2,
            aiConfidence: 0.92,
            requiresSpecialHandling: false
          }
        ]
      }
    },
    include: {
      items: true
    }
  })

  console.log('✅ Created test quote:')
  console.log(`   ID: ${quote.id}`)
  console.log(`   Customer: ${quote.customerName}`)
  console.log(`   Location: ${quote.pickupZip}`)
  console.log(`   Price: $${quote.priceRangeMin}-$${quote.priceRangeMax}`)
  console.log(`   Items: ${quote.items.length}`)
  console.log('\n✅ This quote should now be visible in the provider dashboard!')
  console.log('   Go to: http://localhost:3002/provider')
}

main()
  .catch((e) => {
    console.error('Error creating test quote:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
