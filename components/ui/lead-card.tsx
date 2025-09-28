'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, AlertCircle, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface LeadCardProps {
  lead: {
    id: string
    name: string
    location: string
    service: string
    estimatedValue: number
    createdAt: string | Date
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'new' | 'contacted' | 'accepted' | 'declined'
    distance?: string
    phone?: string
    email?: string
    preferredTime?: string
  }
  onAccept?: () => void
  onDecline?: () => void
  onViewDetails?: () => void
  className?: string
}

const priorityStyles = {
  low: 'border-l-4 border-l-gray-400',
  medium: 'border-l-4 border-l-yellow-500',
  high: 'border-l-4 border-l-orange-500',
  urgent: 'border-l-4 border-l-red-500 animate-pulse-subtle',
}

const statusStyles = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-gray-100 text-gray-700',
}

const priorityBadgeStyles = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  urgent: 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse',
}

export function LeadCard({
  lead,
  onAccept,
  onDecline,
  onViewDetails,
  className,
}: LeadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-lg',
        priorityStyles[lead.priority],
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                statusStyles[lead.status]
              )}
            >
              {lead.status}
            </span>
            {lead.priority !== 'low' && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
                  priorityBadgeStyles[lead.priority]
                )}
              >
                {lead.priority}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(lead.estimatedValue)}
          </div>
          <p className="text-xs text-gray-500">Estimated value</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{lead.location}</span>
          {lead.distance && (
            <span className="text-xs text-gray-500">• {lead.distance}</span>
          )}
        </div>

        {lead.preferredTime && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{lead.preferredTime}</span>
          </div>
        )}

        <div className="pt-2">
          <p className="line-clamp-2 text-gray-700">{lead.service}</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex items-center gap-2">
        {onAccept && (
          <button
            onClick={onAccept}
            className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02]"
          >
            Accept Lead
          </button>
        )}
        {onDecline && (
          <button
            onClick={onDecline}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Pass
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 transition-all hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Time stamp */}
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">
          Posted {formatDate(lead.createdAt)}
        </p>
      </div>

      {/* Urgent indicator animation */}
      {lead.priority === 'urgent' && (
        <div className="absolute -right-1 -top-1">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </div>
      )}
    </motion.div>
  )
}