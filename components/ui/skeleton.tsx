'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'stat' | 'lead' | 'text'
  animate?: boolean
}

export function Skeleton({
  className,
  variant = 'default',
  animate = true
}: SkeletonProps) {
  const baseClass = cn(
    'rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    animate && 'animate-shimmer',
    className
  )

  if (variant === 'text') {
    return <div className={cn(baseClass, 'h-4 w-full')} />
  }

  return <div className={baseClass} />
}

// Skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="card-modern p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  )
}

// Skeleton for lead cards
export function LeadCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-modern p-5 border-l-4 border-l-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="text-right">
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </motion.div>
  )
}

// Pipeline skeleton
export function PipelineSkeleton() {
  return (
    <div className="card-modern p-6">
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="flex items-center justify-between gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto mb-3" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-3 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Pipeline and Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PipelineSkeleton />
        </div>
        <div className="card-modern p-6">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-modern p-6">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="h-2 w-2 rounded-full mt-1" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}