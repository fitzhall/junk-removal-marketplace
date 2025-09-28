'use client'

import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  TrendingUp,
  Star,
  Zap,
  ChevronRight,
  CheckCircle,
  XCircle,
  Timer,
  Home
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

interface EnhancedLeadCardProps {
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
    propertyType?: string
    responseDeadline?: Date
    photos?: string[]
    rating?: number
  }
  onAccept?: () => void
  onDecline?: () => void
  onViewDetails?: () => void
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function EnhancedLeadCard({
  lead,
  onAccept,
  onDecline,
  onViewDetails,
  variant = 'default',
  className,
}: EnhancedLeadCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()

  // Calculate time remaining
  useEffect(() => {
    if (lead.responseDeadline) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const deadline = new Date(lead.responseDeadline!).getTime()
        const difference = deadline - now

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft('Expired')
        }
      }, 60000)

      return () => clearInterval(timer)
    }
  }, [lead.responseDeadline])

  // Priority-based styling
  const priorityConfig = {
    low: {
      border: 'border-l-gray-400',
      badge: 'bg-gray-100 text-gray-700',
      glow: '',
      icon: null,
    },
    medium: {
      border: 'border-l-yellow-500',
      badge: 'bg-yellow-100 text-yellow-700',
      glow: '',
      icon: null,
    },
    high: {
      border: 'border-l-orange-500',
      badge: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
      glow: 'hover:shadow-orange-200',
      icon: <TrendingUp className="h-3 w-3" />,
    },
    urgent: {
      border: 'border-l-red-600',
      badge: 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse',
      glow: 'shadow-red-100 hover:shadow-red-200',
      icon: <Zap className="h-3 w-3" />,
    },
  }

  const config = priorityConfig[lead.priority]

  // Handle card animations
  useEffect(() => {
    if (lead.priority === 'urgent') {
      controls.start({
        scale: [1, 1.01, 1],
        transition: { repeat: Infinity, duration: 2 }
      })
    }
  }, [lead.priority, controls])

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300',
        'hover:shadow-xl border-l-4',
        config.border,
        config.glow,
        className
      )}
    >
      {/* Animated Background Pattern */}
      {lead.priority === 'urgent' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500 blur-3xl animate-pulse" />
        </div>
      )}

      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Priority Badge */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
                  config.badge
                )}
              >
                {config.icon}
                {lead.priority}
              </motion.span>

              {/* Status Badge */}
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                lead.status === 'new' && 'bg-blue-100 text-blue-700',
                lead.status === 'contacted' && 'bg-yellow-100 text-yellow-700',
                lead.status === 'accepted' && 'bg-green-100 text-green-700',
                lead.status === 'declined' && 'bg-gray-100 text-gray-700'
              )}>
                {lead.status}
              </span>

              {/* Time Remaining */}
              {timeLeft && lead.status === 'new' && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="h-3 w-3" />
                  {timeLeft}
                </span>
              )}
            </div>

            {/* Customer Name with Rating */}
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
              {lead.rating && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < lead.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Value Display */}
          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            className="text-right"
          >
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(lead.estimatedValue)}
            </div>
            <p className="text-xs text-gray-500">Est. value</p>
          </motion.div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{lead.location}</span>
            {lead.distance && (
              <span className="text-xs text-purple-600 font-medium">• {lead.distance}</span>
            )}
          </div>

          {lead.propertyType && (
            <div className="flex items-center gap-2 text-gray-600">
              <Home className="h-4 w-4 text-gray-400" />
              <span>{lead.propertyType}</span>
            </div>
          )}

          {lead.preferredTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="truncate">{lead.preferredTime}</span>
            </div>
          )}

          {lead.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${lead.phone}`} className="hover:text-purple-600 transition-colors">
                {lead.phone}
              </a>
            </div>
          )}
        </div>

        {/* Service Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">{lead.service}</p>
        </div>

        {/* Photo Preview (if available) */}
        {lead.photos && lead.photos.length > 0 && (
          <div className="flex gap-1 mb-4">
            {lead.photos.slice(0, 4).map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100"
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </motion.div>
            ))}
            {lead.photos.length > 4 && (
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">+{lead.photos.length - 4}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onAccept && lead.status === 'new' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            >
              <CheckCircle className="h-4 w-4" />
              Accept Lead
            </motion.button>
          )}

          {onDecline && lead.status === 'new' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDecline}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <XCircle className="h-4 w-4" />
              Pass
            </motion.button>
          )}

          {onViewDetails && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewDetails}
              className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-700 transition-all hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Posted {new Date(lead.createdAt).toLocaleString()}</span>
          {lead.priority === 'urgent' && (
            <span className="font-medium text-red-600">⚡ Respond quickly!</span>
          )}
        </div>
      </div>

      {/* Visual Priority Indicators */}
      {lead.priority === 'urgent' && (
        <>
          {/* Animated corner badge */}
          <div className="absolute -right-1 -top-1">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
          </div>

          {/* Bottom gradient bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        </>
      )}

      {lead.priority === 'high' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
      )}
    </motion.div>
  )
}