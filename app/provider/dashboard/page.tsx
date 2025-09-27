import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { leadService } from '@/lib/lead-service'
import LeadCard from '@/components/provider/LeadCard'
import ProviderStats from '@/components/provider/ProviderStats'

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'PROVIDER') {
    redirect('/dashboard')
  }

  // Get provider details
  const provider = await prisma.provider.findUnique({
    where: { userId: user.id },
    include: { serviceAreas: true }
  })

  if (!provider) {
    redirect('/provider/onboarding')
  }

  // Get recent leads for this provider
  const leads = await prisma.leadDistribution.findMany({
    where: { providerId: provider.id },
    include: {
      quote: {
        include: {
          items: true
        }
      }
    },
    orderBy: { sentAt: 'desc' },
    take: 20
  })

  // Get provider stats
  const stats = await leadService.getProviderLeadStats(provider.id)

  // Calculate today's leads
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysLeads = leads.filter(lead =>
    new Date(lead.sentAt) >= today
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
              <p className="mt-1 text-sm text-gray-600">Provider Dashboard</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              provider.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {provider.status}
            </div>
          </div>
        </div>

        {/* Stats */}
        <ProviderStats
          stats={{
            todaysLeads,
            totalLeads: stats.total,
            acceptedLeads: stats.accepted,
            acceptanceRate: stats.acceptanceRate,
            pendingLeads: stats.pending
          }}
        />

        {/* Leads Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option>All Leads</option>
                <option>Pending</option>
                <option>Accepted</option>
                <option>Declined</option>
              </select>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No leads yet. Make sure your service areas are configured.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onAccept={() => {/* TODO: Handle accept */}}
                  onDecline={() => {/* TODO: Handle decline */}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}