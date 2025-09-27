'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Lead {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  description: string
  preferredDate: string
  preferredTime: string
  photos: string[]
  items: any[]
  estimatedValue: number
  status: 'new' | 'viewed' | 'accepted' | 'declined'
  createdAt: string
  urgency: 'low' | 'medium' | 'high'
  propertyType: string
}

export default function ProviderDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'accepted' | 'declined'>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    acceptedLeads: 0,
    revenue: 0,
    conversionRate: 0
  })

  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/provider/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/provider/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAcceptLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/provider/leads/${leadId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount: selectedLead?.estimatedValue })
      })

      if (response.ok) {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, status: 'accepted' } : lead
        ))
        setSelectedLead(null)
        fetchStats()
      }
    } catch (error) {
      console.error('Error accepting lead:', error)
    }
  }

  const handleDeclineLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/provider/leads/${leadId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Not in service area' })
      })

      if (response.ok) {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, status: 'declined' } : lead
        ))
        setSelectedLead(null)
      }
    } catch (error) {
      console.error('Error declining lead:', error)
    }
  }

  const filteredLeads = leads.filter(lead =>
    filter === 'all' ? true : lead.status === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Demo Provider Account</span>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold">{stats.totalLeads}</p>
              </div>
              <BriefcaseIcon className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold">{stats.acceptedLeads}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-3xl font-bold">${stats.revenue}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion</p>
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'new', 'accepted', 'declined'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab} ({leads.filter(l => tab === 'all' || l.status === tab).length})
            </button>
          ))}
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center">
              <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{lead.customerName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        <span className={`text-sm font-medium ${getUrgencyColor(lead.urgency)}`}>
                          {lead.urgency} priority
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          {lead.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(lead.preferredDate).toLocaleDateString()} at {lead.preferredTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(lead.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <p className="mt-2 text-gray-700 line-clamp-2">{lead.description}</p>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600">${lead.estimatedValue}</p>
                      <p className="text-sm text-gray-500">Estimated value</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Name:</span> {selectedLead.customerName}
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      {selectedLead.customerPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      {selectedLead.customerEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      {selectedLead.address}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Property Type:</span> {selectedLead.propertyType}
                    </div>
                    <div>
                      <span className="font-medium">Preferred Date:</span> {new Date(selectedLead.preferredDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Preferred Time:</span> {selectedLead.preferredTime}
                    </div>
                    <div>
                      <span className="font-medium">Urgency:</span>
                      <span className={`ml-2 ${getUrgencyColor(selectedLead.urgency)}`}>
                        {selectedLead.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedLead.description}</p>
              </div>

              {selectedLead.items && selectedLead.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Identified Items</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedLead.items.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Condition: {item.condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.photos && selectedLead.photos.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedLead.photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Estimated Value</h3>
                  <p className="text-3xl font-bold text-green-600">${selectedLead.estimatedValue}</p>
                </div>

                {selectedLead.status === 'new' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAcceptLead(selectedLead.id)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Accept Lead
                    </button>
                    <button
                      onClick={() => handleDeclineLead(selectedLead.id)}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
                    >
                      Decline Lead
                    </button>
                  </div>
                )}

                {selectedLead.status === 'accepted' && (
                  <div className="text-center py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                    ✓ You accepted this lead
                  </div>
                )}

                {selectedLead.status === 'declined' && (
                  <div className="text-center py-3 bg-red-100 text-red-800 rounded-lg font-medium">
                    ✗ You declined this lead
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}