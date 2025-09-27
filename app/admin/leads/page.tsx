'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

interface Lead {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  value: number
  status: 'new' | 'distributed' | 'accepted' | 'completed' | 'expired' | 'disputed'
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
  distributedTo: number
  acceptedBy: string | null
  photoCount: number
  itemCount: number
}

export default function AdminLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Mock leads data
  const mockLeads: Lead[] = [
    {
      id: 'L-2024-001',
      customerName: 'John Smith',
      customerPhone: '415-555-0123',
      customerEmail: 'john@email.com',
      address: '123 Main St, San Francisco, CA 94102',
      value: 450,
      status: 'new',
      urgency: 'high',
      createdAt: '2024-01-27T10:30:00',
      distributedTo: 0,
      acceptedBy: null,
      photoCount: 3,
      itemCount: 5
    },
    {
      id: 'L-2024-002',
      customerName: 'Sarah Johnson',
      customerPhone: '415-555-0124',
      customerEmail: 'sarah@email.com',
      address: '456 Oak Ave, Oakland, CA 94612',
      value: 780,
      status: 'distributed',
      urgency: 'medium',
      createdAt: '2024-01-27T09:15:00',
      distributedTo: 3,
      acceptedBy: null,
      photoCount: 5,
      itemCount: 8
    },
    {
      id: 'L-2024-003',
      customerName: 'Mike Chen',
      customerPhone: '415-555-0125',
      customerEmail: 'mike@email.com',
      address: '789 Pine St, San Jose, CA 95110',
      value: 1200,
      status: 'accepted',
      urgency: 'low',
      createdAt: '2024-01-27T08:00:00',
      distributedTo: 4,
      acceptedBy: 'Provider #234',
      photoCount: 7,
      itemCount: 12
    },
    {
      id: 'L-2024-004',
      customerName: 'Emily Davis',
      customerPhone: '415-555-0126',
      customerEmail: 'emily@email.com',
      address: '321 Elm St, Berkeley, CA 94704',
      value: 320,
      status: 'disputed',
      urgency: 'high',
      createdAt: '2024-01-26T16:45:00',
      distributedTo: 2,
      acceptedBy: 'Provider #156',
      photoCount: 2,
      itemCount: 3
    }
  ]

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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'medium': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      default: return <CheckCircleIcon className="w-4 h-4 text-green-500" />
    }
  }

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on leads:`, selectedLeads)
    // Implement bulk actions
    setSelectedLeads([])
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
            <p className="text-2xl font-bold text-blue-600">{mockLeads.filter(l => l.status === 'new').length}</p>
            <p className="text-sm text-gray-600">New</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{mockLeads.filter(l => l.status === 'distributed').length}</p>
            <p className="text-sm text-gray-600">Distributed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{mockLeads.filter(l => l.status === 'accepted').length}</p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{mockLeads.filter(l => l.status === 'completed').length}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{mockLeads.filter(l => l.status === 'expired').length}</p>
            <p className="text-sm text-gray-600">Expired</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{mockLeads.filter(l => l.status === 'disputed').length}</p>
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
                  <span className="text-sm text-gray-600">{selectedLeads.length} selected</span>
                  <button
                    onClick={() => handleBulkAction('redistribute')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Redistribute
                  </button>
                  <button
                    onClick={() => handleBulkAction('refund')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Refund Credits
                  </button>
                  <button
                    onClick={() => handleBulkAction('expire')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                  >
                    Mark Expired
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(filteredLeads.map(l => l.id))
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distribution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(lead.urgency)}
                        <span className="font-medium text-gray-900">{lead.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{lead.customerName}</p>
                        <p className="text-sm text-gray-500">{lead.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{lead.address.split(',')[0]}</p>
                      <p className="text-xs text-gray-500">{lead.address.split(',').slice(1).join(',')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">${lead.value}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {lead.acceptedBy ? (
                        <div>
                          <p className="text-sm text-gray-900">{lead.acceptedBy}</p>
                          <p className="text-xs text-gray-500">1 of {lead.distributedTo}</p>
                        </div>
                      ) : lead.distributedTo > 0 ? (
                        <p className="text-sm text-gray-900">Sent to {lead.distributedTo}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not distributed</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDetails(lead.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {lead.status === 'new' && (
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            Distribute
                          </button>
                        )}
                        {lead.status === 'disputed' && (
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Resolve
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

        {/* Quick Stats Panel */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Orphaned Leads</h3>
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-xs text-gray-500 mt-1">Need manual distribution</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</h3>
            <p className="text-2xl font-bold text-blue-600">12 min</p>
            <p className="text-xs text-gray-500 mt-1">↓ 3 min from yesterday</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Revenue</h3>
            <p className="text-2xl font-bold text-green-600">$1,847</p>
            <p className="text-xs text-gray-500 mt-1">From 23 accepted leads</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold text-purple-600">72%</p>
            <p className="text-xs text-gray-500 mt-1">↑ 5% from last week</p>
          </div>
        </div>
      </div>
    </div>
  )
}