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
import { createClient } from '@/lib/supabase/client'

// Dynamically import mobile dashboard to reduce initial bundle
const MobileProviderDashboard = dynamic(
  () => import('@/components/provider/MobileProviderDashboard'),
  { ssr: false }
)

interface Lead {
  id: string
  distributionId: string
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
  status: 'new' | 'contacted' | 'won' | 'lost'
  createdAt: string
  deliveredAt: string
  urgency: 'low' | 'medium' | 'high'
  propertyType: string
}

export default function ModernProviderDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'won' | 'lost'>('all')
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
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user logged in')
        setLoading(false)
        return
      }

      // Get provider record
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (!provider) {
        console.error('No provider found')
        setLoading(false)
        return
      }

      // Get leads with quotes
      const { data: leadDistributions, error } = await supabase
        .from('lead_distributions')
        .select(`
          *,
          quotes (*)
        `)
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching leads:', error)
        setLoading(false)
        return
      }

      // Transform to match expected format
      const transformedLeads = (leadDistributions || []).map(dist => {
        const quote = dist.quotes
        return {
          id: quote.id,
          distributionId: dist.id,
          customerName: quote.customer_name || 'Customer',
          customerEmail: quote.customer_email || 'not provided',
          customerPhone: quote.customer_phone || 'not provided',
          address: `${quote.pickup_address || ''}, ${quote.pickup_city || ''}, ${quote.pickup_state || ''} ${quote.pickup_zip || ''}`,
          description: 'Junk removal needed',
          preferredDate: quote.preferred_date,
          preferredTime: quote.preferred_time || 'Flexible',
          photos: Array.isArray(quote.photos) ? quote.photos : [],
          items: quote.items || [],
          estimatedValue: quote.estimated_price || 0,
          status: dist.status === 'sent' ? 'new' :
                  dist.status === 'accepted' ? 'won' :
                  dist.status === 'declined' ? 'lost' : 'contacted',
          createdAt: quote.created_at,
          deliveredAt: dist.sent_at,
          urgency: quote.is_urgent ? 'high' : 'medium',
          propertyType: 'Residential'
        }
      })

      setLeads(transformedLeads)
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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: provider } = await supabase
        .from('providers')
        .select('id, total_jobs, rating')
        .eq('auth_user_id', user.id)
        .single()

      if (!provider) return

      // Get lead stats
      const { data: leadDistributions } = await supabase
        .from('lead_distributions')
        .select('status')
        .eq('provider_id', provider.id)

      const stats = {
        totalLeads: leadDistributions?.length || 0,
        activeLeads: leadDistributions?.filter(l => l.status === 'sent' || l.status === 'viewed').length || 0,
        wonLeads: leadDistributions?.filter(l => l.status === 'accepted').length || 0,
        revenue: 0,
        conversionRate: 0,
        rating: provider.rating || 0,
        completedJobs: provider.total_jobs || 0
      }

      if (stats.totalLeads > 0) {
        stats.conversionRate = Math.round((stats.wonLeads / stats.totalLeads) * 100)
      }

      // Get revenue from completed jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('final_price')
        .eq('provider_id', provider.id)
        .eq('status', 'completed')

      if (jobs) {
        stats.revenue = jobs.reduce((sum, job) => sum + (job.final_price || 0), 0)
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpdateStatus = async (leadId: string, distributionId: string, newStatus: 'contacted' | 'won' | 'lost') => {
    try {
      const supabase = createClient()

      const statusMap = {
        'contacted': 'viewed',
        'won': 'accepted',
        'lost': 'declined'
      }

      const { error } = await supabase
        .from('lead_distributions')
        .update({
          status: statusMap[newStatus],
          responded_at: new Date().toISOString(),
          response_message: `Status updated to ${newStatus}`
        })
        .eq('id', distributionId)

      if (!error) {
        // Refresh the lead list to get updated data
        await fetchLeads()
        fetchStats()
      } else {
        console.error('Error updating lead status:', error)
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const handleAcceptLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      await handleUpdateStatus(leadId, lead.distributionId, 'won')
    }
  }

  const handleDeclineLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      await handleUpdateStatus(leadId, lead.distributionId, 'lost')
    }
  }

  const filteredLeads = leads.filter(lead =>
    filter === 'all' ? true : lead.status === filter
  )

  const filterTabs = [
    { id: 'all', label: 'All', count: leads.length },
    { id: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { id: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { id: 'won', label: 'Won', count: leads.filter(l => l.status === 'won').length },
    { id: 'lost', label: 'Lost', count: leads.filter(l => l.status === 'lost').length },
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
              <div className="border-t border-gray-100 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Value</p>
                    <p className="text-3xl font-bold text-gradient-success">${selectedLead.estimatedValue}</p>
                  </div>

                  <div className="flex gap-3">
                    {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                      <>
                        {selectedLead.status === 'new' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'contacted')}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                          >
                            Mark Contacted
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'won')}
                          className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                        >
                          Won Job
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'lost')}
                          className="px-6 py-3 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
                        >
                          Lost Job
                        </motion.button>
                      </>
                    )}

                    {selectedLead.status === 'won' && (
                      <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        You won this job!
                      </div>
                    )}

                    {selectedLead.status === 'lost' && (
                      <div className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Job lost
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}