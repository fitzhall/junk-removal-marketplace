'use client'

import { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Lead {
  id: string
  customer: {
    name: string
    phone: string
    email: string
  }
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  value: number
  status: 'new' | 'distributed' | 'accepted' | 'completed' | 'expired' | 'disputed'
  urgent: boolean
  date: string
  distributedTo: number
  acceptedBy: {
    name: string
    rating: number
    responseTime: string | null
  } | null
  photos: number
  items: number
  revenue: number
  commission: number
}

interface LeadStats {
  new: number
  distributed: number
  accepted: number
  completed: number
  expired: number
  disputed: number
  orphaned: number
  avgResponseTime: string
  todayRevenue: number
  conversionRate: string
}

export default function AdminLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({
    new: 0,
    distributed: 0,
    accepted: 0,
    completed: 0,
    expired: 0,
    disputed: 0,
    orphaned: 0,
    avgResponseTime: '0 min',
    todayRevenue: 0,
    conversionRate: '0%'
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLeads()
  }, [searchTerm, statusFilter, page])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: page.toString(),
        limit: '10'
      })

      const response = await fetch(`/api/admin/leads?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setStats(data.stats)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'distributed': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyIcon = (urgent: boolean) => {
    if (urgent) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
    }
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on leads:`, selectedLeads)
    // Implement bulk actions
    setSelectedLeads([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
              <nav className="ml-10 flex space-x-4">
                <a href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Overview
                </a>
                <a href="/admin/leads" className="text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-blue-500">
                  Leads
                </a>
                <a href="/admin/providers" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Providers
                </a>
                <a href="/admin/finance" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Finance
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-sm text-gray-600">New</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.distributed}</p>
            <p className="text-sm text-gray-600">Distributed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.expired}</p>
            <p className="text-sm text-gray-600">Expired</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
            <p className="text-sm text-gray-600">Disputed</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, name, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="distributed">Distributed</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedLeads.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedLeads.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('distribute')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Distribute
                  </button>
                  <button
                    onClick={() => handleBulkAction('expire')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Mark Expired
                  </button>
                  <button
                    onClick={() => setSelectedLeads([])}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No leads found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(leads.map(l => l.id))
                          } else {
                            setSelectedLeads([])
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads([...selectedLeads, lead.id])
                            } else {
                              setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getUrgencyIcon(lead.urgent)}
                          <div>
                            <p className="font-medium text-gray-900">{lead.id.slice(0, 8)}...</p>
                            <p className="text-xs text-gray-500">{formatDate(lead.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{lead.customer.name}</p>
                          <p className="text-sm text-gray-500">{lead.customer.phone}</p>
                          {lead.customer.email && (
                            <p className="text-xs text-gray-500">{lead.customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{lead.address.city}, {lead.address.state}</p>
                          <p className="text-xs text-gray-500">{lead.address.zip}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(lead.value)}</p>
                          <p className="text-xs text-gray-500">
                            {lead.items} items • {lead.photos} photos
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.distributedTo > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Sent to {lead.distributedTo}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.acceptedBy ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{lead.acceptedBy.name}</p>
                            <p className="text-xs text-gray-500">
                              ⭐ {lead.acceptedBy.rating.toFixed(1)} • {lead.acceptedBy.responseTime || 'Quick'}
                            </p>
                            {lead.revenue > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                Revenue: {formatCurrency(lead.commission)}
                              </p>
                            )}
                          </div>
                        ) : lead.distributedTo > 0 ? (
                          <p className="text-sm text-gray-500">Pending acceptance</p>
                        ) : (
                          <p className="text-sm text-gray-400">Not distributed</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                          {lead.status === 'new' && (
                            <button className="text-green-600 hover:text-green-800 text-sm">
                              Distribute
                            </button>
                          )}
                          {lead.status === 'disputed' && (
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Orphaned Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.orphaned}</p>
              <p className="text-xs text-gray-500 mt-1">Need redistribution</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}</p>
              <p className="text-xs text-gray-500 mt-1">Provider average</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">Platform fees</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}</p>
              <p className="text-xs text-gray-500 mt-1">Accepted/Distributed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}