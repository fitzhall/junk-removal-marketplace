import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CompanyDashboard from '@/components/CompanyDashboardProfessional'

interface PageProps {
  params: Promise<{ companySlug: string }>
}

export default async function DashboardPage({ params }: PageProps) {
  const { companySlug } = await params

  // Fetch company
  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  })

  if (!company) {
    notFound()
  }

  // Fetch all quotes for this company
  const quotes = await prisma.quote.findMany({
    where: { companyId: company.id },
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <CompanyDashboard
      company={company}
      quotes={quotes}
    />
  )
}
