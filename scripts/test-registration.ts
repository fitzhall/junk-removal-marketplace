import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRegistration() {
  console.log('🧪 Testing Provider Registration Flow\n')

  const testProvider = {
    businessName: 'Test Junk Removal Co',
    email: `test-${Date.now()}@example.com`,
    phone: '+14155551234',
    businessAddress: '456 Test Street, San Francisco, CA',
    firstName: 'John',
    lastName: 'Tester',
    serviceAreas: ['94102', '94103', '94104']
  }

  console.log('📝 Test Provider Data:')
  console.log(`   Business: ${testProvider.businessName}`)
  console.log(`   Email: ${testProvider.email}`)
  console.log(`   Service Areas: ${testProvider.serviceAreas.join(', ')}\n`)

  try {
    // Call the registration API
    console.log('🌐 Calling registration API...')
    const response = await fetch('http://localhost:3002/api/provider/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProvider)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API Error:', data.error)
      return
    }

    console.log('✅ API Response:', {
      success: data.success,
      providerId: data.providerId,
      message: data.message
    })

    // Verify in database
    console.log('\n🔍 Verifying database records...\n')

    // Check User
    const user = await prisma.user.findUnique({
      where: { email: testProvider.email }
    })

    if (!user) {
      console.error('❌ User not found in database')
      return
    }

    console.log('✅ User Created:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has Password: ${!!user.hashedPassword}`)

    // Check Provider
    const provider = await prisma.provider.findUnique({
      where: { id: data.providerId },
      include: {
        serviceAreas: true,
        user: {
          select: { email: true, name: true }
        }
      }
    })

    if (!provider) {
      console.error('❌ Provider not found in database')
      return
    }

    console.log('\n✅ Provider Created:')
    console.log(`   ID: ${provider.id}`)
    console.log(`   Business Name: ${provider.businessName}`)
    console.log(`   Status: ${provider.status}`)
    console.log(`   Phone: ${provider.businessPhone}`)
    console.log(`   Address: ${provider.businessAddress}`)
    console.log(`   Max Jobs/Day: ${provider.maxJobsPerDay}`)

    console.log('\n✅ Service Areas Created:')
    provider.serviceAreas.forEach((area, index) => {
      console.log(`   ${index + 1}. ZIP: ${area.zipCode} (${area.isPrimary ? 'PRIMARY' : 'secondary'})`)
    })

    console.log('\n📊 Summary:')
    console.log(`   ✅ User account created`)
    console.log(`   ✅ Provider profile created with PENDING status`)
    console.log(`   ✅ ${provider.serviceAreas.length} service areas added`)
    console.log(`   ⏳ Status will change to ACTIVE after payment`)

    console.log('\n💡 Next Steps:')
    console.log(`   1. Provider pays $99 activation fee via Stripe`)
    console.log(`   2. Stripe webhook updates status to ACTIVE`)
    console.log(`   3. Provider can access dashboard at /provider`)
    console.log(`   4. Provider starts receiving leads in ZIP: ${testProvider.serviceAreas.join(', ')}`)

  } catch (error: any) {
    console.error('❌ Test Failed:', error.message)
    if (error.cause) {
      console.error('   Cause:', error.cause)
    }
  }
}

testRegistration()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
