'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  change?: {
    value: number
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  className?: string
  children?: ReactNode
}

const variantStyles = {
  default: 'border-gray-200',
  success: 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50',
  warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50',
  danger: 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50',
  primary: 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50',
}

const iconColors = {
  default: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  primary: 'text-purple-600',
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  variant = 'default',
  className,
  children,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/40 to-white/0" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {value}
              </p>
              {change && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.value > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.value > 0 ? '+' : ''}{change.value}% {change.label}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-lg bg-white/50 p-3',
                iconColors[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  )
}