'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SwipeableLeadCard } from './swipeable-lead-card'
import { Briefcase, TrendingUp, DollarSign, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadStackProps {
  leads: any[]
  onAccept: (leadId: string) => void
  onDecline: (leadId: string) => void
  onViewDetails: (lead: any) => void
  className?: string
}

export function LeadStack({
  leads,
  onAccept,
  onDecline,
  onViewDetails,
  className
}: LeadStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({
    reviewed: 0,
    accepted: 0,
    declined: 0,
    acceptRate: 0
  })

  const visibleLeads = leads.slice(currentIndex, currentIndex + 3)

  const handleAccept = (leadId: string) => {
    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      accepted: prev.accepted + 1,
      declined: prev.declined,
      acceptRate: Math.round(((prev.accepted + 1) / (prev.reviewed + 1)) * 100)
    }))
    onAccept(leadId)
    setCurrentIndex(prev => prev + 1)
  }

  const handleDecline = (leadId: string) => {
    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      accepted: prev.accepted,
      declined: prev.declined + 1,
      acceptRate: Math.round((prev.accepted / (prev.reviewed + 1)) * 100)
    }))
    onDecline(leadId)
    setCurrentIndex(prev => prev + 1)
  }

  if (visibleLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600 mb-6">You've reviewed all available leads</p>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
            <p className="text-xs text-gray-600">Reviewed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-gray-600">Accepted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.acceptRate}%</p>
            <p className="text-xs text-gray-600">Accept Rate</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            Lead {currentIndex + 1} of {leads.length}
          </p>
          <p className="text-sm text-gray-500">
            {leads.length - currentIndex - 1} remaining
          </p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / leads.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Quick Stats Bar */}
      {stats.reviewed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-around mb-6 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">{stats.reviewed} reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{stats.accepted} accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{stats.acceptRate}% rate</span>
          </div>
        </motion.div>
      )}

      {/* Lead Stack */}
      <div className="relative h-[600px]">
        <AnimatePresence mode="popLayout">
          {visibleLeads.map((lead, index) => (
            <SwipeableLeadCard
              key={lead.id}
              lead={lead}
              index={index}
              onAccept={() => handleAccept(lead.id)}
              onDecline={() => handleDecline(lead.id)}
              onViewDetails={() => onViewDetails(lead)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Action Buttons (Alternative to swiping) */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDecline(visibleLeads[0]?.id)}
          className="h-14 w-14 rounded-full bg-white border-2 border-red-500 text-red-500 flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
        >
          <X className="h-6 w-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onViewDetails(visibleLeads[0])}
          className="h-12 w-12 rounded-full bg-white border-2 border-gray-300 text-gray-600 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
        >
          <Info className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAccept(visibleLeads[0]?.id)}
          className="h-14 w-14 rounded-full bg-white border-2 border-green-500 text-green-500 flex items-center justify-center shadow-lg hover:bg-green-50 transition-colors"
        >
          <Check className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  )
}

// Import statements need adjustment
import { X, Check, Info } from 'lucide-react'