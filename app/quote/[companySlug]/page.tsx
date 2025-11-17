import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import WhiteLabelQuoteWidget from '@/components/WhiteLabelQuoteWidget'

interface PageProps {
  params: Promise<{ companySlug: string }>
}

export default async function CompanyQuotePage({ params }: PageProps) {
  const { companySlug } = await params

  // Fetch company data
  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  })

  if (!company) {
    notFound()
  }

  // Check if subscription is active
  if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIALING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Unavailable</h1>
          <p className="text-gray-600">This quote widget is currently inactive.</p>
        </div>
      </div>
    )
  }

  return <WhiteLabelQuoteWidget company={company} />
}
