import { PrismaClient, Role, ProviderStatus, QuoteStatus, VolumeSize } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@junkremoval.com' },
    update: {},
    create: {
      email: 'admin@junkremoval.com',
      hashedPassword: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create provider users and profiles
  const providerPassword = await bcrypt.hash('provider123', 10)

  const provider1User = await prisma.user.upsert({
    where: { email: 'provider1@example.com' },
    update: {},
    create: {
      email: 'provider1@example.com',
      hashedPassword: providerPassword,
      name: 'John Smith',
      phone: '555-0101',
      role: Role.PROVIDER,
      emailVerified: new Date(),
    },
  })

  const provider1 = await prisma.provider.upsert({
    where: { userId: provider1User.id },
    update: {},
    create: {
      userId: provider1User.id,
      businessName: 'Quick Haul Junk Removal',
      businessAddress: '123 Main St, San Francisco, CA 94102',
      businessPhone: '555-0101',
      licenseNumber: 'LIC-12345',
      insuranceInfo: { provider: 'StateFarm', policyNumber: 'POL-98765' },
      rating: 4.8,
      totalJobs: 127,
      status: ProviderStatus.ACTIVE,
      capabilities: {
        hasLargeTruck: true,
        hasHazmatCert: false,
        maxWeight: 5000,
      },
      serviceAreas: {
        create: [
          { zipCode: '94102', city: 'San Francisco', state: 'CA', isPrimary: true },
          { zipCode: '94103', city: 'San Francisco', state: 'CA' },
          { zipCode: '94104', city: 'San Francisco', state: 'CA' },
        ],
      },
    },
  })
  console.log('✅ Created provider:', provider1.businessName)

  const provider2User = await prisma.user.upsert({
    where: { email: 'provider2@example.com' },
    update: {},
    create: {
      email: 'provider2@example.com',
      hashedPassword: providerPassword,
      name: 'Sarah Johnson',
      phone: '555-0202',
      role: Role.PROVIDER,
      emailVerified: new Date(),
    },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: provider2User.id },
    update: {},
    create: {
      userId: provider2User.id,
      businessName: 'EcoHaul Green Disposal',
      businessAddress: '456 Oak Ave, Oakland, CA 94601',
      businessPhone: '555-0202',
      licenseNumber: 'LIC-54321',
      insuranceInfo: { provider: 'AllState', policyNumber: 'POL-56789' },
      rating: 4.9,
      totalJobs: 89,
      status: ProviderStatus.ACTIVE,
      capabilities: {
        hasLargeTruck: true,
        hasHazmatCert: true,
        maxWeight: 7500,
      },
      serviceAreas: {
        create: [
          { zipCode: '94601', city: 'Oakland', state: 'CA', isPrimary: true },
          { zipCode: '94602', city: 'Oakland', state: 'CA' },
          { zipCode: '94102', city: 'San Francisco', state: 'CA' },
        ],
      },
    },
  })
  console.log('✅ Created provider:', provider2.businessName)

  // Create customer users
  const customerPassword = await bcrypt.hash('customer123', 10)

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      hashedPassword: customerPassword,
      name: 'Alice Brown',
      phone: '555-1001',
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created customer:', customer1.email)

  // Create sample quotes/leads
  const quote1 = await prisma.quote.create({
    data: {
      userId: customer1.id,
      status: QuoteStatus.PENDING,
      customerName: 'Alice Brown',
      customerEmail: 'customer1@example.com',
      customerPhone: '555-1001',
      pickupAddress: '789 Market St',
      pickupZip: '94102',
      pickupCity: 'San Francisco',
      pickupState: 'CA',
      photoUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        'https://images.unsplash.com/photo-1611175694989-4870fafa4494?w=600',
      ],
      aiAnalysis: {
        items: [
          { name: 'Sofa', quantity: 1, category: 'furniture' },
          { name: 'Mattress', quantity: 2, category: 'furniture' },
          { name: 'Boxes', quantity: 5, category: 'general' },
        ],
        summary: 'Living room furniture and household items for disposal',
      },
      estimatedVolume: VolumeSize.HALF,
      basePrice: 300,
      totalPrice: 350,
      priceRangeMin: 300,
      priceRangeMax: 400,
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      preferredTimeWindow: '9AM-12PM',
      isUrgent: false,
      source: 'web',
      items: {
        create: [
          { itemType: 'Sofa', quantity: 1, aiConfidence: 0.95 },
          { itemType: 'Mattress', quantity: 2, aiConfidence: 0.92 },
          { itemType: 'Boxes', quantity: 5, aiConfidence: 0.88 },
        ],
      },
    },
  })
  console.log('✅ Created quote:', quote1.id)

  const quote2 = await prisma.quote.create({
    data: {
      status: QuoteStatus.PENDING,
      customerName: 'Bob Wilson',
      customerEmail: 'bob@example.com',
      customerPhone: '555-2002',
      pickupAddress: '321 Pine St',
      pickupZip: '94601',
      pickupCity: 'Oakland',
      pickupState: 'CA',
      photoUrls: [
        'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600',
      ],
      aiAnalysis: {
        items: [
          { name: 'Refrigerator', quantity: 1, category: 'appliance' },
          { name: 'Washer', quantity: 1, category: 'appliance' },
        ],
        summary: 'Large appliances requiring special handling',
      },
      estimatedVolume: VolumeSize.THREE_QUARTER,
      basePrice: 450,
      totalPrice: 500,
      priceRangeMin: 450,
      priceRangeMax: 550,
      preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      preferredTimeWindow: '2PM-5PM',
      isUrgent: true,
      source: 'web',
      items: {
        create: [
          { itemType: 'Refrigerator', quantity: 1, aiConfidence: 0.98, requiresSpecialHandling: true },
          { itemType: 'Washer', quantity: 1, aiConfidence: 0.96, requiresSpecialHandling: true },
        ],
      },
    },
  })
  console.log('✅ Created quote:', quote2.id)

  // Distribute leads to providers
  await prisma.leadDistribution.create({
    data: {
      quoteId: quote1.id,
      providerId: provider1.id,
      status: 'SENT',
      sentAt: new Date(),
    },
  })

  await prisma.leadDistribution.create({
    data: {
      quoteId: quote1.id,
      providerId: provider2.id,
      status: 'SENT',
      sentAt: new Date(),
    },
  })

  await prisma.leadDistribution.create({
    data: {
      quoteId: quote2.id,
      providerId: provider2.id,
      status: 'VIEWED',
      sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      viewedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    },
  })

  console.log('✅ Distributed leads to providers')

  // Create pricing rules
  await prisma.pricingRule.create({
    data: {
      name: 'San Francisco Default',
      description: 'Default pricing for San Francisco area',
      city: 'San Francisco',
      state: 'CA',
      isDefault: false,
      quarterTruckPrice: 150,
      halfTruckPrice: 300,
      threeQuarterTruckPrice: 450,
      fullTruckPrice: 600,
      heavyItemFee: 50,
      stairsFee: 25,
      longCarryFee: 35,
      sameDayFee: 75,
      weekendFee: 50,
      isActive: true,
    },
  })

  await prisma.pricingRule.create({
    data: {
      name: 'Default National',
      description: 'Default pricing for all areas',
      isDefault: true,
      quarterTruckPrice: 125,
      halfTruckPrice: 250,
      threeQuarterTruckPrice: 375,
      fullTruckPrice: 500,
      heavyItemFee: 40,
      stairsFee: 20,
      longCarryFee: 30,
      sameDayFee: 60,
      weekendFee: 40,
      isActive: true,
    },
  })

  console.log('✅ Created pricing rules')

  console.log('✨ Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('Admin: admin@junkremoval.com / admin123')
  console.log('Provider 1: provider1@example.com / provider123')
  console.log('Provider 2: provider2@example.com / provider123')
  console.log('Customer: customer1@example.com / customer123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })