import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test providers...')

  // Provider 1: San Francisco Bay Area
  const user1 = await prisma.user.create({
    data: {
      email: 'joe@bayjunk.com',
      name: 'Joe Martinez',
      phone: '+14155551234',
      role: 'PROVIDER'
    }
  })

  const provider1 = await prisma.provider.create({
    data: {
      userId: user1.id,
      businessName: 'Bay Area Junk Pros',
      businessPhone: '+14155551234',
      licenseNumber: 'CA-JR-12345',
      rating: 4.8,
      totalJobs: 147,
      status: 'ACTIVE',
      autoBidEnabled: true,
      bidStrategy: 'PERCENTAGE_BELOW',
      bidPercentage: 8, // Bid 8% below estimate
      maxJobsPerDay: 10,
      minJobValue: 100,
      maxJobValue: 3000,
      serviceAreas: {
        create: [
          {
            zipCode: '94102',
            city: 'San Francisco',
            state: 'CA',
            isPrimary: true,
            maxRadiusMiles: 25
          },
          {
            zipCode: '94103',
            city: 'San Francisco',
            state: 'CA',
            isPrimary: false,
            maxRadiusMiles: 25
          },
          {
            zipCode: '94104',
            city: 'San Francisco',
            state: 'CA',
            isPrimary: false,
            maxRadiusMiles: 25
          }
        ]
      }
    }
  })

  console.log('✅ Created provider 1: Bay Area Junk Pros')

  // Provider 2: Oakland Area
  const user2 = await prisma.user.create({
    data: {
      email: 'maria@oaklandhaul.com',
      name: 'Maria Chen',
      phone: '+15105552345',
      role: 'PROVIDER'
    }
  })

  const provider2 = await prisma.provider.create({
    data: {
      userId: user2.id,
      businessName: 'Oakland Haul & Dump',
      businessPhone: '+15105552345',
      licenseNumber: 'CA-JR-54321',
      rating: 4.9,
      totalJobs: 203,
      status: 'ACTIVE',
      autoBidEnabled: true,
      bidStrategy: 'FIXED_AMOUNT',
      bidFixedAmount: 250, // Fixed $250 per job
      maxJobsPerDay: 8,
      minJobValue: 150,
      maxJobValue: 2500,
      serviceAreas: {
        create: [
          {
            zipCode: '94601',
            city: 'Oakland',
            state: 'CA',
            isPrimary: true,
            maxRadiusMiles: 20
          },
          {
            zipCode: '94602',
            city: 'Oakland',
            state: 'CA',
            isPrimary: false,
            maxRadiusMiles: 20
          }
        ]
      }
    }
  })

  console.log('✅ Created provider 2: Oakland Haul & Dump')

  // Provider 3: San Jose Area
  const user3 = await prisma.user.create({
    data: {
      email: 'david@sanjoseremoval.com',
      name: 'David Kim',
      phone: '+14085553456',
      role: 'PROVIDER'
    }
  })

  const provider3 = await prisma.provider.create({
    data: {
      userId: user3.id,
      businessName: 'San Jose Junk Removal',
      businessPhone: '+14085553456',
      licenseNumber: 'CA-JR-98765',
      rating: 4.7,
      totalJobs: 89,
      status: 'ACTIVE',
      autoBidEnabled: false, // Manual bidding only
      maxJobsPerDay: 5,
      serviceAreas: {
        create: [
          {
            zipCode: '95112',
            city: 'San Jose',
            state: 'CA',
            isPrimary: true,
            maxRadiusMiles: 30
          },
          {
            zipCode: '95113',
            city: 'San Jose',
            state: 'CA',
            isPrimary: false,
            maxRadiusMiles: 30
          }
        ]
      }
    }
  })

  console.log('✅ Created provider 3: San Jose Junk Removal')

  // Provider 4: Los Angeles Area
  const user4 = await prisma.user.create({
    data: {
      email: 'sarah@lajunk.com',
      name: 'Sarah Johnson',
      phone: '+13105554567',
      role: 'PROVIDER'
    }
  })

  const provider4 = await prisma.provider.create({
    data: {
      userId: user4.id,
      businessName: 'LA Junk Express',
      businessPhone: '+13105554567',
      licenseNumber: 'CA-JR-11111',
      rating: 4.6,
      totalJobs: 312,
      status: 'ACTIVE',
      autoBidEnabled: true,
      bidStrategy: 'PERCENTAGE_BELOW',
      bidPercentage: 5,
      maxJobsPerDay: 15,
      minJobValue: 75,
      maxJobValue: 5000,
      serviceAreas: {
        create: [
          {
            zipCode: '90001',
            city: 'Los Angeles',
            state: 'CA',
            isPrimary: true,
            maxRadiusMiles: 35
          },
          {
            zipCode: '90002',
            city: 'Los Angeles',
            state: 'CA',
            isPrimary: false,
            maxRadiusMiles: 35
          }
        ]
      }
    }
  })

  console.log('✅ Created provider 4: LA Junk Express')

  // Provider 5: Sacramento Area (PENDING status for testing)
  const user5 = await prisma.user.create({
    data: {
      email: 'mike@sachaul.com',
      name: 'Mike Thompson',
      phone: '+19165555678',
      role: 'PROVIDER'
    }
  })

  const provider5 = await prisma.provider.create({
    data: {
      userId: user5.id,
      businessName: 'Sacramento Haul Away',
      businessPhone: '+19165555678',
      licenseNumber: 'CA-JR-22222',
      rating: 0, // New provider
      totalJobs: 0,
      status: 'PENDING', // Not active yet
      autoBidEnabled: false,
      maxJobsPerDay: 5,
      serviceAreas: {
        create: [
          {
            zipCode: '95814',
            city: 'Sacramento',
            state: 'CA',
            isPrimary: true,
            maxRadiusMiles: 25
          }
        ]
      }
    }
  })

  console.log('✅ Created provider 5: Sacramento Haul Away (pending)')

  console.log('\n🎉 Successfully seeded 5 test providers!')
  console.log('\nProvider Coverage:')
  console.log('  • SF Bay Area: Bay Area Junk Pros (94102, 94103, 94104)')
  console.log('  • Oakland: Oakland Haul & Dump (94601, 94602)')
  console.log('  • San Jose: San Jose Junk Removal (95112, 95113)')
  console.log('  • Los Angeles: LA Junk Express (90001, 90002)')
  console.log('  • Sacramento: Sacramento Haul Away (95814) - PENDING')
}

main()
  .catch((e) => {
    console.error('Error seeding providers:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
