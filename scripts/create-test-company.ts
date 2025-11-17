import { prisma } from '../lib/prisma'

async function createTestCompany() {
  const company = await prisma.company.create({
    data: {
      slug: 'demo-junk',
      businessName: 'Demo Junk Removal',
      contactEmail: 'leads@demo-junk.com',
      contactPhone: '(555) 123-4567',
      logoUrl: null,
      primaryColor: '#2563EB', // Blue
      secondaryColor: '#1E40AF', // Darker blue
      subscriptionStatus: 'ACTIVE',
      notificationEmail: 'leads@demo-junk.com',
      activationPaidAt: new Date(),
    }
  })

  console.log('✅ Test company created!')
  console.log('🔗 Widget URL: http://localhost:3000/quote/demo-junk')
  console.log('📧 Notification email:', company.notificationEmail)
  console.log('🆔 Company ID:', company.id)
}

createTestCompany()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
