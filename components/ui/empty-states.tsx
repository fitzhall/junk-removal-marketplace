'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  MapPin,
  TrendingUp,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Inbox,
  FileText,
  Bell,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-4"
        >
          {icon}
        </motion.div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{description}</p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

// Specific empty states for different scenarios

export function NoLeadsEmpty({ onAddLead }: { onAddLead?: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <Briefcase className="h-12 w-12 text-indigo-600" />
        </div>
      }
      title="No Leads Available"
      description="New leads will appear here when customers request junk removal services in your area."
      action={onAddLead ? {
        label: "Check Settings",
        onClick: onAddLead
      } : undefined}
    />
  )
}

export function NoProvidersEmpty({ onInvite }: { onInvite?: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-24 w-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <Users className="h-12 w-12 text-purple-600" />
        </div>
      }
      title="No Providers Yet"
      description="Start inviting junk removal companies to join your platform and receive leads."
      action={onInvite ? {
        label: "Invite Providers",
        onClick: onInvite
      } : undefined}
    />
  )
}

export function NoDataEmpty() {
  return (
    <EmptyState
      icon={
        <div className="h-24 w-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <TrendingUp className="h-12 w-12 text-gray-600" />
        </div>
      }
      title="No Data Available"
      description="Data will appear here once there's activity on your platform."
    />
  )
}

export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={
        <div className="h-24 w-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
          <Search className="h-12 w-12 text-orange-600" />
        </div>
      }
      title="No Results Found"
      description={query ? `No results found for "${query}". Try adjusting your search terms.` : "No results found. Try adjusting your filters."}
    />
  )
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={
        <div className="h-24 w-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
          <Bell className="h-12 w-12 text-green-600" />
        </div>
      }
      title="All Caught Up!"
      description="You have no new notifications. We'll let you know when something important happens."
    />
  )
}

export function NoRevenueEmpty() {
  return (
    <EmptyState
      icon={
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="h-24 w-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center"
        >
          <DollarSign className="h-12 w-12 text-green-600" />
        </motion.div>
      }
      title="No Revenue Yet"
      description="Start accepting leads to generate revenue. Your earnings will be displayed here."
    />
  )
}

// Animated illustrations for empty states
export function AnimatedInbox() {
  return (
    <motion.div className="relative h-32 w-32">
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }}
        className="absolute inset-0"
      >
        <Inbox className="h-32 w-32 text-gray-300" strokeWidth={1} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-4 w-4 bg-purple-500 rounded-full" />
      </motion.div>
    </motion.div>
  )
}

export function AnimatedPackage() {
  return (
    <motion.div className="relative h-32 w-32">
      <motion.div
        animate={{
          rotate: [0, 5, -5, 5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut"
        }}
      >
        <Package className="h-32 w-32 text-gray-300" strokeWidth={1} />
      </motion.div>
    </motion.div>
  )
}

// Loading placeholder with animation
export function LoadingEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"
      />
      <p className="text-gray-600">Loading...</p>
    </div>
  )
}