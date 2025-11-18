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

  // Minimalist Desktop view
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">PROVIDER DASHBOARD</h1>
              <p className="text-sm text-gray-600 mt-1">Manage leads</p>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={handleRefresh}
                className="text-gray-600 hover:text-black transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
              </button>
              <a
                href="/provider/settings"
                className="text-sm font-medium hover:underline"
              >
                Settings
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Minimal Stats */}
        <div className="grid grid-cols-4 gap-px bg-black mb-8">
          <div className="bg-white p-6">
            <div className="text-sm text-gray-600">Total Leads</div>
            <div className="text-3xl font-bold mt-2">{stats.totalLeads}</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-sm text-gray-600">Won</div>
            <div className="text-3xl font-bold mt-2">{stats.acceptedLeads}</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-3xl font-bold mt-2">${stats.revenue}</div>
          </div>
          <div className="bg-white p-6">
            <div className="text-sm text-gray-600">Conversion</div>
            <div className="text-3xl font-bold mt-2">{stats.conversionRate}%</div>
          </div>
        </div>

        {/* Minimal Filter Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "text-sm font-medium transition-colors",
                filter === tab.id
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Minimal Leads List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400">No leads found</div>
          </div>
        ) : (
          <div className="space-y-px bg-black">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-bold">{lead.customerName}</h3>
                      {lead.urgency === 'high' && (
                        <span className="text-xs font-bold text-red-600">[URGENT]</span>
                      )}
                      {lead.status === 'new' && (
                        <span className="text-xs font-bold">[NEW]</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{lead.address}</div>
                      <div>{new Date(lead.preferredDate).toLocaleDateString()} at {lead.preferredTime}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${lead.estimatedValue}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {lead.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimal Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-black max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="border-b border-black p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">LEAD DETAILS</h2>
                  <p className="text-sm text-gray-600 mt-1">ID: {selectedLead.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Customer & Job Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold mb-4">CUSTOMER</h3>
                    <div className="space-y-2 text-sm">
                      <div>{selectedLead.customerName}</div>
                      <div className="text-gray-600">{selectedLead.customerPhone}</div>
                      <div className="text-gray-600">{selectedLead.customerEmail}</div>
                      <div className="text-gray-600">{selectedLead.address}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">JOB</h3>
                    <div className="space-y-2 text-sm">
                      <div>Date: {new Date(selectedLead.preferredDate).toLocaleDateString()}</div>
                      <div>Time: {selectedLead.preferredTime}</div>
                      <div>Type: {selectedLead.propertyType}</div>
                      <div>Priority: {selectedLead.urgency.toUpperCase()}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">DESCRIPTION</h3>
                  <p className="text-sm text-gray-700">{selectedLead.description}</p>
                </div>

                {/* Items */}
                {selectedLead.items && selectedLead.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-4">ITEMS</h3>
                    <div className="space-y-2">
                      {selectedLead.items.map((item: any, index: number) => (
                        <div key={index} className="border border-gray-200 p-3 text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600 ml-4">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedLead.photos && selectedLead.photos.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-4">PHOTOS</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedLead.photos.map((photo, index) => (
                        <div key={index} className="aspect-square border border-black overflow-hidden">
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

              {/* Modal Footer */}
              <div className="border-t border-black p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">${selectedLead.estimatedValue}</div>
                    <div className="text-sm text-gray-600">Estimated value</div>
                  </div>

                  <div className="flex gap-4">
                    {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                      <>
                        {selectedLead.status === 'new' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'contacted')}
                            className="px-6 py-2 border border-black hover:bg-gray-100 transition-colors font-medium"
                          >
                            MARK CONTACTED
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'won')}
                          className="px-6 py-2 bg-black text-white hover:bg-gray-900 transition-colors font-medium"
                        >
                          WON JOB
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'lost')}
                          className="px-6 py-2 border border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600 transition-colors font-medium"
                        >
                          LOST JOB
                        </button>
                      </>
                    )}

                    {selectedLead.status === 'won' && (
                      <div className="px-6 py-2 bg-black text-white font-medium">
                        JOB WON
                      </div>
                    )}

                    {selectedLead.status === 'lost' && (
                      <div className="px-6 py-2 border border-gray-400 text-gray-400 font-medium">
                        JOB LOST
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