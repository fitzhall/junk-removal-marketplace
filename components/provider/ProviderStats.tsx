import { DocumentTextIcon, CheckCircleIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface ProviderStatsProps {
  stats: {
    todaysLeads: number
    totalLeads: number
    acceptedLeads: number
    acceptanceRate: number
    pendingLeads: number
  }
}

export default function ProviderStats({ stats }: ProviderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-3">
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Today&apos;s Leads</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.todaysLeads}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-purple-100 rounded-lg p-3">
            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Leads</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalLeads}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-green-100 rounded-lg p-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Accepted</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.acceptedLeads}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-lg p-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Accept Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.acceptanceRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}