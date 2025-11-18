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

  // Simple Modern Desktop view
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">Lead Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="text-gray-500 hover:text-gray-900"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <a
                href="/provider/settings"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Settings
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Simple Stats Row */}
        <div className="flex items-center gap-8 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="text-2xl font-medium">{stats.totalLeads}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
          <div>
            <div className="text-2xl font-medium">{stats.acceptedLeads}</div>
            <div className="text-sm text-gray-500">Won</div>
          </div>
          <div>
            <div className="text-2xl font-medium">${stats.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-medium">{stats.conversionRate}%</div>
            <div className="text-sm text-gray-500">Win Rate</div>
          </div>
        </div>

        {/* Simple Filter Tabs */}
        <div className="flex items-center gap-6 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                "text-sm",
                filter === tab.id
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Simple Table View */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No leads found</div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                        <div className="text-sm text-gray-500">{lead.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(lead.preferredDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{lead.preferredTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-medium rounded-full",
                        lead.status === 'new' && "bg-blue-100 text-blue-800",
                        lead.status === 'contacted' && "bg-yellow-100 text-yellow-800",
                        lead.status === 'won' && "bg-green-100 text-green-800",
                        lead.status === 'lost' && "bg-gray-100 text-gray-800"
                      )}>
                        {lead.status}
                        {lead.urgency === 'high' && ' • URGENT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">${lead.estimatedValue}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Info Grid */}
                <dl className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedLead.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedLead.customerPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedLead.customerEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedLead.preferredDate).toLocaleDateString()} at {selectedLead.preferredTime}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedLead.address}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedLead.description}</dd>
                  </div>
                </dl>

                {/* Items */}
                {selectedLead.items && selectedLead.items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                    <ul className="text-sm text-gray-900 space-y-1">
                      {selectedLead.items.map((item: any, index: number) => (
                        <li key={index}>{item.name} (Qty: {item.quantity})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Photos */}
                {selectedLead.photos && selectedLead.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Photos</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedLead.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded overflow-hidden">
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
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-medium text-gray-900">${selectedLead.estimatedValue}</div>
                    <div className="text-sm text-gray-500">Estimated value</div>
                  </div>

                  <div className="flex gap-3">
                    {(selectedLead.status === 'new' || selectedLead.status === 'contacted') && (
                      <>
                        {selectedLead.status === 'new' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'contacted')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Mark Contacted
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'won')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Won Job
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedLead.id, selectedLead.distributionId, 'lost')}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Lost Job
                        </button>
                      </>
                    )}

                    {selectedLead.status === 'won' && (
                      <div className="px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md">
                        ✓ Job Won
                      </div>
                    )}

                    {selectedLead.status === 'lost' && (
                      <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md">
                        Job Lost
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