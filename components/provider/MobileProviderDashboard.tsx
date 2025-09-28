'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
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
  ChartBarIcon,
  HomeIcon,
  BellIcon,
  UserIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid'

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

interface MobileProviderDashboardProps {
  leads: Lead[]
  stats: {
    totalLeads: number
    acceptedLeads: number
    revenue: number
    conversionRate: number
  }
  onAcceptLead: (leadId: string) => void
  onDeclineLead: (leadId: string) => void
  onRefresh: () => Promise<void>
}

export default function MobileProviderDashboard({
  leads,
  stats,
  onAcceptLead,
  onDeclineLead,
  onRefresh
}: MobileProviderDashboardProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'accepted' | 'declined'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'leads' | 'stats' | 'profile'>('leads')
  const [swipedCards, setSwipedCards] = useState<Set<string>>(new Set())

  const filteredLeads = leads.filter(lead =>
    filter === 'all' ? true : lead.status === filter
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleSwipe = (leadId: string, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      // Swipe right - Accept
      onAcceptLead(leadId)
      setSwipedCards(prev => new Set(prev).add(leadId))
    } else if (info.offset.x < -threshold) {
      // Swipe left - Decline
      onDeclineLead(leadId)
      setSwipedCards(prev => new Set(prev).add(leadId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      default: return '📋'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">
              {activeTab === 'leads' ? 'Leads' : activeTab === 'stats' ? 'Stats' : 'Profile'}
            </h1>
            <div className="flex items-center gap-3">
              <button className="relative">
                <BellIcon className="w-6 h-6 text-gray-600" />
                {leads.filter(l => l.status === 'new').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {leads.filter(l => l.status === 'new').length}
                  </span>
                )}
              </button>
              <button
                onClick={handleRefresh}
                className={`p-2 ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Filter Pills - Only show on leads tab */}
          {activeTab === 'leads' && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4">
              {(['all', 'new', 'accepted', 'declined'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                    filter === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab} ({leads.filter(l => tab === 'all' || l.status === tab).length})
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'leads' ? (
          <motion.div
            key="leads"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 space-y-4"
          >
            {/* Pull to Refresh Indicator */}
            {isRefreshing && (
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Refreshing...</span>
                </div>
              </div>
            )}

            {/* Lead Cards */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No {filter !== 'all' ? filter : ''} leads</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: swipedCards.has(lead.id) ? 0 : 1,
                    y: 0,
                    scale: swipedCards.has(lead.id) ? 0.8 : 1
                  }}
                  exit={{ opacity: 0, x: swipedCards.has(lead.id) ? 300 : 0 }}
                  drag={lead.status === 'new' ? 'x' : false}
                  dragConstraints={{ left: -200, right: 200 }}
                  dragElastic={0.7}
                  onDragEnd={(e, info) => handleSwipe(lead.id, info)}
                  whileDrag={{ scale: 1.05 }}
                  className="relative"
                >
                  {/* Swipe Indicators */}
                  {lead.status === 'new' && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-green-500 rounded-lg flex items-center justify-start pl-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0 }}
                        drag={false}
                      >
                        <CheckCircleSolid className="w-8 h-8 text-white" />
                        <span className="ml-2 text-white font-bold">Accept</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end pr-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0 }}
                        drag={false}
                      >
                        <span className="mr-2 text-white font-bold">Decline</span>
                        <XCircleSolid className="w-8 h-8 text-white" />
                      </motion.div>
                    </>
                  )}

                  {/* Lead Card */}
                  <div
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative"
                    onClick={() => setSelectedLead(lead)}
                  >
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getUrgencyBadge(lead.urgency)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">${lead.estimatedValue}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <h3 className="font-semibold text-gray-900 mb-2">{lead.customerName}</h3>

                    {/* Quick Info */}
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(lead.preferredDate).toLocaleDateString()} at {lead.preferredTime}</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{lead.description}</p>

                    {/* Action Buttons for non-new leads */}
                    {lead.status === 'new' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `tel:${lead.customerPhone}`
                          }}
                          className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <PhoneIcon className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `sms:${lead.customerPhone}`
                          }}
                          className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          Text
                        </button>
                      </div>
                    )}

                    {/* Swipe Hint */}
                    {lead.status === 'new' && (
                      <p className="text-xs text-gray-400 text-center mt-2">Swipe right to accept, left to decline</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : activeTab === 'stats' ? (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
                <p className="text-xs text-gray-600">Total Leads</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{stats.acceptedLeads}</p>
                <p className="text-xs text-gray-600">Accepted</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">${stats.revenue}</p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-600">Conversion</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm">View Earnings Report</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-270" />
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm">Update Service Areas</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-270" />
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm">Manage Availability</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-270" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="bg-white rounded-lg p-4 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <h2 className="font-semibold text-lg">Provider Name</h2>
              <p className="text-sm text-gray-600">Professional Plan</p>
              <p className="text-xs text-gray-500 mt-1">7 credits remaining</p>
              <a
                href="/provider/settings"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm"
              >
                Edit Profile
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Detail Modal - Full Screen on Mobile */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Status and Value */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${selectedLead.estimatedValue}</p>
                  <p className="text-xs text-gray-500">Estimated value</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedLead.customerName}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedLead.customerPhone}`}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      Call
                    </a>
                    <a
                      href={`sms:${selectedLead.customerPhone}`}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      Text
                    </a>
                    <a
                      href={`mailto:${selectedLead.customerEmail}`}
                      className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedLead.address}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedLead.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm mt-1 inline-block"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3">Job Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Property Type</span>
                    <span className="font-medium">{selectedLead.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Date</span>
                    <span className="font-medium">{new Date(selectedLead.preferredDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Time</span>
                    <span className="font-medium">{selectedLead.preferredTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Urgency</span>
                    <span className="font-medium">{getUrgencyBadge(selectedLead.urgency)} {selectedLead.urgency}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedLead.description}</p>
              </div>

              {/* Photos - Swipeable Gallery */}
              {selectedLead.photos && selectedLead.photos.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Photos ({selectedLead.photos.length})</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedLead.photos.map((photo, index) => (
                      <div key={index} className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
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

              {/* Items */}
              {selectedLead.items && selectedLead.items.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Identified Items</h3>
                  <div className="space-y-2">
                    {selectedLead.items.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Condition: {item.condition}</p>
                        </div>
                        <span className="text-sm font-medium">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Buttons */}
            {selectedLead.status === 'new' && (
              <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                <button
                  onClick={() => {
                    onAcceptLead(selectedLead.id)
                    setSelectedLead(null)
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium"
                >
                  Accept Lead
                </button>
                <button
                  onClick={() => {
                    onDeclineLead(selectedLead.id)
                    setSelectedLead(null)
                  }}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium"
                >
                  Decline
                </button>
              </div>
            )}
            {selectedLead.status === 'accepted' && (
              <div className="sticky bottom-0 bg-white border-t p-4">
                <div className="bg-green-100 text-green-800 py-3 rounded-lg text-center font-medium">
                  ✓ You accepted this lead
                </div>
              </div>
            )}
            {selectedLead.status === 'declined' && (
              <div className="sticky bottom-0 bg-white border-t p-4">
                <div className="bg-red-100 text-red-800 py-3 rounded-lg text-center font-medium">
                  ✗ You declined this lead
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'leads' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <BriefcaseIcon className="w-6 h-6" />
            <span className="text-xs">Leads</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'stats' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ChartBarIcon className="w-6 h-6" />
            <span className="text-xs">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}