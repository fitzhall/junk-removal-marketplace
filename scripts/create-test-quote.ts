import { prisma } from '../lib/prisma'

async function createTestQuote() {
  // Get the demo company
  const company = await prisma.company.findUnique({
    where: { slug: 'demo-junk' }
  })

  if (!company) {
    console.error('Demo company not found. Run create-test-company.ts first')
    return
  }

  // Create a test quote
  const quote = await prisma.quote.create({
    data: {
      companyId: company.id,
      status: 'PENDING',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '(555) 123-4567',
      pickupAddress: '123 Main Street',
      pickupCity: 'San Francisco',
      pickupState: 'CA',
      pickupZip: '94102',
      estimatedVolume: 'HALF',
      priceRangeMin: 300,
      priceRangeMax: 450,
      totalPrice: 375,
      source: 'widget',
      items: {
        create: [
          { itemType: 'Couch', quantity: 1, aiConfidence: 0.95 },
          { itemType: 'Mattress', quantity: 1, aiConfidence: 0.88 },
        ]
      }
    },
    include: { items: true }
  })

  console.log('✅ Test quote created!')
  console.log('📋 View dashboard: http://localhost:3000/dashboard/demo-junk')
  console.log('Quote ID:', quote.id)
}

createTestQuote()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
