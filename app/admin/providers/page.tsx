'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  CreditCardIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface Provider {
  id: string
  name: string
  email: string
  phone: string
  company: string
  tier: 'BASIC' | 'PROFESSIONAL' | 'ELITE'
  status: 'pending' | 'active' | 'suspended'
  joinedDate: string
  serviceAreas: string[]
  leadCredits: number
  creditsUsed: number
  totalLeads: number
  acceptanceRate: number
  avgResponseTime: number
  rating: number
  revenue: number
  balance: number
  lastActive: string
  autoBidEnabled: boolean
  maxBidAmount: number
}

export default function AdminProvidersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Mock provider data
  const mockProviders: Provider[] = [
    {
      id: 'PRV-001',
      name: 'John Smith',
      email: 'john@junkpro.com',
      phone: '415-555-0123',
      company: 'JunkPro Services',
      tier: 'ELITE',
      status: 'active',
      joinedDate: '2024-01-15',
      serviceAreas: ['San Francisco', 'Oakland', 'San Mateo'],
      leadCredits: 32,
      creditsUsed: 18,
      totalLeads: 245,
      acceptanceRate: 85,
      avgResponseTime: 12,
      rating: 4.8,
      revenue: 45600,
      balance: 0,
      lastActive: '2 hours ago',
      autoBidEnabled: true,
      maxBidAmount: 75
    },
    {
      id: 'PRV-002',
      name: 'Sarah Johnson',
      email: 'sarah@quickhaul.com',
      phone: '415-555-0124',
      company: 'QuickHaul',
      tier: 'PROFESSIONAL',
      status: 'active',
      joinedDate: '2024-02-20',
      serviceAreas: ['San Jose', 'Palo Alto'],
      leadCredits: 12,
      creditsUsed: 13,
      totalLeads: 156,
      acceptanceRate: 72,
      avgResponseTime: 28,
      rating: 4.6,
      revenue: 28900,
      balance: 250,
      lastActive: '5 min ago',
      autoBidEnabled: true,
      maxBidAmount: 50
    },
    {
      id: 'PRV-003',
      name: 'Mike Chen',
      email: 'mike@ecojunk.com',
      phone: '415-555-0125',
      company: 'EcoJunk Removal',
      tier: 'BASIC',
      status: 'suspended',
      joinedDate: '2024-03-10',
      serviceAreas: ['Berkeley'],
      leadCredits: 2,
      creditsUsed: 8,
      totalLeads: 67,
      acceptanceRate: 58,
      avgResponseTime: 45,
      rating: 4.2,
      revenue: 12300,
      balance: -150,
      lastActive: '3 days ago',
      autoBidEnabled: false,
      maxBidAmount: 25
    },
    {
      id: 'PRV-004',
      name: 'Emily Davis',
      email: 'emily@newprovider.com',
      phone: '415-555-0126',
      company: 'Fresh Start Hauling',
      tier: 'BASIC',
      status: 'pending',
      joinedDate: '2024-03-27',
      serviceAreas: ['Fremont', 'Hayward'],
      leadCredits: 10,
      creditsUsed: 0,
      totalLeads: 0,
      acceptanceRate: 0,
      avgResponseTime: 0,
      rating: 0,
      revenue: 0,
      balance: 0,
      lastActive: 'Never',
      autoBidEnabled: false,
      maxBidAmount: 30
    }
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ELITE': return 'bg-purple-100 text-purple-800'
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-800'
      case 'BASIC': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === 'all' || provider.tier === tierFilter
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter
    return matchesSearch && matchesTier && matchesStatus
  })

  const pendingProviders = mockProviders.filter(p => p.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Provider Management</h1>
              <nav className="ml-10 flex space-x-4">
                <a href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Overview
                </a>
                <a href="/admin/leads" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Leads
                </a>
                <a href="/admin/providers" className="text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-500">
                  Providers
                </a>
                <a href="/admin/finance" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Finance
                </a>
              </nav>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Add Provider
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Approvals Alert */}
        {pendingProviders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <span className="font-medium">{pendingProviders.length} providers</span> waiting for approval
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Review Now →
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{mockProviders.length}</p>
            <p className="text-sm text-gray-600">Total Providers</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {mockProviders.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              ${mockProviders.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(mockProviders.reduce((sum, p) => sum + p.acceptanceRate, 0) / mockProviders.length)}%
            </p>
            <p className="text-sm text-gray-600">Avg Acceptance</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {Math.round(mockProviders.reduce((sum, p) => sum + p.avgResponseTime, 0) / mockProviders.length)}m
            </p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="ELITE">Elite</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="BASIC">Basic</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Provider Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Areas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{provider.name}</p>
                        <p className="text-sm text-gray-600">{provider.company}</p>
                        <p className="text-xs text-gray-500">{provider.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(provider.tier)}`}>
                        {provider.tier}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{provider.serviceAreas.length} areas</p>
                      <p className="text-xs text-gray-500">{provider.serviceAreas.slice(0, 2).join(', ')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{provider.leadCredits} left</p>
                      <p className="text-xs text-gray-500">{provider.creditsUsed} used</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-900">{provider.acceptanceRate}%</p>
                          <p className="text-xs text-gray-500">Accept</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{provider.avgResponseTime}m</p>
                          <p className="text-xs text-gray-500">Response</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-900">{provider.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">${provider.revenue.toLocaleString()}</p>
                      {provider.balance !== 0 && (
                        <p className={`text-xs ${provider.balance < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          Balance: ${provider.balance}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProvider(provider)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {provider.status === 'pending' && (
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Approve
                          </button>
                        )}
                        {provider.status === 'active' && (
                          <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                            Suspend
                          </button>
                        )}
                        {provider.status === 'suspended' && (
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <button className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">Bulk Credit Adjustment</p>
                <p className="text-sm text-gray-500 mt-1">Add/remove credits in bulk</p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-blue-600" />
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">Send Broadcast</p>
                <p className="text-sm text-gray-500 mt-1">Message all providers</p>
              </div>
              <EnvelopeIcon className="w-8 h-8 text-green-600" />
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">Performance Report</p>
                <p className="text-sm text-gray-500 mt-1">Generate analytics</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">Tier Management</p>
                <p className="text-sm text-gray-500 mt-1">Bulk tier changes</p>
              </div>
              <SparklesIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </button>
        </div>
      </div>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Provider Details</h2>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedProvider.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium">{selectedProvider.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedProvider.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Account Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Subscription Tier</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(selectedProvider.tier)}`}>
                        {selectedProvider.tier}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProvider.status)}`}>
                        {selectedProvider.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium">{new Date(selectedProvider.joinedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Active</p>
                      <p className="font-medium">{selectedProvider.lastActive}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedProvider.totalLeads}</p>
                  <p className="text-sm text-gray-600">Total Leads</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${selectedProvider.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Revenue Generated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProvider.acceptanceRate}%</p>
                  <p className="text-sm text-gray-600">Acceptance Rate</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Service Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.serviceAreas.map((area) => (
                    <span key={area} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Edit Provider
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Add Credits
                </button>
                <button className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700">
                  View Activity
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}