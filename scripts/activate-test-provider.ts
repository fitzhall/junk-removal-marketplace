import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activateTestProvider() {
  console.log('🔧 Activating most recent test provider...\n')

  // Find the most recent PENDING provider
  const provider = await prisma.provider.findFirst({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true, name: true }
      }
    }
  })

  if (!provider) {
    console.log('❌ No pending providers found')
    return
  }

  console.log('📋 Found Provider:')
  console.log(`   Business: ${provider.businessName}`)
  console.log(`   Email: ${provider.user.email}`)
  console.log(`   Current Status: ${provider.status}\n`)

  // Activate the provider
  const updated = await prisma.provider.update({
    where: { id: provider.id },
    data: { status: 'ACTIVE' }
  })

  console.log('✅ Provider activated!')
  console.log(`   Status: ${updated.status}`)
  console.log(`\n💡 Provider can now:`)
  console.log(`   - Log in at http://localhost:3002/provider`)
  console.log(`   - Receive leads in their service areas`)
  console.log(`   - Access the provider dashboard`)
}

activateTestProvider()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
