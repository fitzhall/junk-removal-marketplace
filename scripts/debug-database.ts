import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Debugging database state...\n')

  // Check all providers
  const providers = await prisma.provider.findMany({
    include: {
      serviceAreas: true
    }
  })

  console.log(`📊 Total providers: ${providers.length}`)
  providers.forEach((provider, index) => {
    console.log(`\n${index + 1}. ${provider.businessName}`)
    console.log(`   ID: ${provider.id}`)
    console.log(`   Status: ${provider.status}`)
    console.log(`   Service Areas: ${provider.serviceAreas.map(sa => sa.zipCode).join(', ')}`)
  })

  // Check first provider (what the API uses)
  const firstProvider = await prisma.provider.findFirst()
  console.log(`\n🎯 First provider (used by dashboard):`)
  console.log(`   ID: ${firstProvider?.id}`)
  console.log(`   Name: ${firstProvider?.businessName}`)

  // Check all lead distributions
  console.log(`\n📨 All Lead Distributions:`)
  const distributions = await prisma.leadDistribution.findMany({
    include: {
      provider: { select: { businessName: true } },
      quote: { select: { id: true, customerName: true, pickupZip: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`   Total distributions: ${distributions.length}`)
  distributions.forEach((dist, index) => {
    console.log(`\n   ${index + 1}. Distribution ID: ${dist.id}`)
    console.log(`      Provider: ${dist.provider.businessName} (${dist.providerId})`)
    console.log(`      Quote: ${dist.quote.customerName} in ${dist.quote.pickupZip}`)
    console.log(`      Status: ${dist.status}`)
    console.log(`      Sent: ${dist.sentAt}`)
  })

  // Check if first provider has any distributions
  if (firstProvider) {
    const firstProviderDistributions = await prisma.leadDistribution.findMany({
      where: { providerId: firstProvider.id },
      include: {
        quote: { select: { customerName: true } }
      }
    })
    console.log(`\n✅ Distributions for first provider (${firstProvider.businessName}):`)
    console.log(`   Count: ${firstProviderDistributions.length}`)
    firstProviderDistributions.forEach(dist => {
      console.log(`   - ${dist.quote.customerName} (${dist.status})`)
    })
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
