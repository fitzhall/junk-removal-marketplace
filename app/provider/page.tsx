'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Filter,
  RefreshCw,
  Settings,
  AlertCircle,
  Star
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { LeadCard } from '@/components/ui/lead-card'
import { cn } from '@/lib/utils'

// Dynamically import mobile dashboard to reduce initial bundle
const MobileProviderDashboard = dynamic(
  () => import('@/components/provider/MobileProviderDashboard'),
  { ssr: false }
)

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

export default function ModernProviderDashboard() {
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchLeads()
    fetchStats()

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  const handleRefresh = async () => {
    setLoading(true)
    await fetchLeads()
    await fetchStats()
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

  const filterTabs = [
    { id: 'all', label: 'All', count: leads.length },
    { id: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { id: 'accepted', label: 'Accepted', count: leads.filter(l => l.status === 'accepted').length },
    { id: 'declined', label: 'Declined', count: leads.filter(l => l.status === 'declined').length },
  ]

  // Use mobile component on small screens
  if (isMobile) {
    return (
      <MobileProviderDashboard
        leads={leads}
        stats={stats}
        onAcceptLead={handleAcceptLead}
        onDeclineLead={handleDeclineLead}
        onRefresh={handleRefresh}
      />
    )
  }

  // Desktop view with modern design
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-40 glass-effect glass-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Provider Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your leads and grow your business</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("h-5 w-5 text-gray-600", loading && "animate-spin")} />
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Professional Plan</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>7 credits remaining</span>
                </div>
              </div>
              <a
                href="/provider/settings"
                className="btn-primary flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            icon={Briefcase}
            variant="primary"
            change={{ value: 12, label: 'vs last week' }}
          />
          <StatCard
            title="Accepted Leads"
            value={stats.acceptedLeads}
            icon={CheckCircle}
            variant="success"
            change={{ value: 8, label: 'vs last week' }}
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenue}`}
            icon={DollarSign}
            variant="success"
            change={{ value: 23, label: 'vs last week' }}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={TrendingUp}
            variant="warning"
            change={{ value: -5, label: 'vs last week' }}
          />
        </div>

        {/* Filter Tabs with Modern Styling */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  filter === tab.id
                    ? "bg-gradient-primary text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                )}
              >
                {tab.label}
                <span className="ml-2 text-sm opacity-80">({tab.count})</span>
              </motion.button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">More filters</span>
          </button>
        </div>

        {/* Modern Leads Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading your leads...</p>
            </motion.div>
          ) : filteredLeads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass text-center py-20"
            >
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">New leads will appear here when they arrive</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
            >
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LeadCard
                    lead={{
                      id: lead.id,
                      name: lead.customerName,
                      location: lead.address,
                      service: lead.description,
                      estimatedValue: lead.estimatedValue,
                      createdAt: lead.createdAt,
                      priority: lead.urgency === 'high' ? 'urgent' : lead.urgency as any,
                      status: lead.status as any,
                      phone: lead.customerPhone,
                      email: lead.customerEmail,
                      preferredTime: `${new Date(lead.preferredDate).toLocaleDateString()} at ${lead.preferredTime}`,
                    }}
                    onAccept={() => handleAcceptLead(lead.id)}
                    onDecline={() => handleDeclineLead(lead.id)}
                    onViewDetails={() => setSelectedLead(lead)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-gradient-primary p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Lead Details</h2>
                    <p className="text-white/80 mt-1">Review and take action on this lead</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Customer & Job Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="card-modern p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      Customer Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">Name:</div>
                        <div className="font-medium">{selectedLead.customerName}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${selectedLead.customerPhone}`} className="text-purple-600 hover:underline">
                          {selectedLead.customerPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${selectedLead.customerEmail}`} className="text-purple-600 hover:underline">
                          {selectedLead.customerEmail}
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>{selectedLead.address}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-modern p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      Job Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">Property:</div>
                        <div className="font-medium">{selectedLead.propertyType}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">Date:</div>
                        <div className="font-medium">{new Date(selectedLead.preferredDate).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">Time:</div>
                        <div className="font-medium">{selectedLead.preferredTime}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">Priority:</div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                          selectedLead.urgency === 'high' && "bg-red-100 text-red-700",
                          selectedLead.urgency === 'medium' && "bg-yellow-100 text-yellow-700",
                          selectedLead.urgency === 'low' && "bg-gray-100 text-gray-700"
                        )}>
                          {selectedLead.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="card-modern p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedLead.description}</p>
                </div>

                {/* Items Grid */}
                {selectedLead.items && selectedLead.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Identified Items</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedLead.items.map((item: any, index: number) => (
                        <div key={index} className="card-modern p-3">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>Condition: {item.condition}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedLead.photos && selectedLead.photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedLead.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform">
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
              </div>

              {/* Modal Footer with Actions */}
              <div className="border-t border-gray-100 p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Value</p>
                    <p className="text-3xl font-bold text-gradient-success">${selectedLead.estimatedValue}</p>
                  </div>

                  {selectedLead.status === 'new' && (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeclineLead(selectedLead.id)}
                        className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Pass on Lead
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptLead(selectedLead.id)}
                        className="btn-secondary px-8 py-3"
                      >
                        Accept Lead
                      </motion.button>
                    </div>
                  )}

                  {selectedLead.status === 'accepted' && (
                    <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      You accepted this lead
                    </div>
                  )}

                  {selectedLead.status === 'declined' && (
                    <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-medium flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      You declined this lead
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}