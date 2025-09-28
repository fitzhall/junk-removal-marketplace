'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, Zap, Clock, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriorityIndicatorProps {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showAnimation?: boolean
  variant?: 'badge' | 'icon' | 'bar' | 'pulse'
  className?: string
}

export function PriorityIndicator({
  priority,
  size = 'md',
  showLabel = true,
  showAnimation = true,
  variant = 'badge',
  className
}: PriorityIndicatorProps) {
  const config = {
    low: {
      color: 'gray',
      icon: Clock,
      label: 'Low Priority',
      gradient: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-400',
      animation: null
    },
    medium: {
      color: 'yellow',
      icon: TrendingUp,
      label: 'Medium Priority',
      gradient: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-500',
      animation: null
    },
    high: {
      color: 'orange',
      icon: Flame,
      label: 'High Priority',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-500',
      animation: showAnimation ? 'glow' : null
    },
    urgent: {
      color: 'red',
      icon: Zap,
      label: 'Urgent',
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-600',
      animation: showAnimation ? 'pulse' : null
    }
  }

  const sizeConfig = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      icon: 'h-3 w-3',
      bar: 'h-1',
      pulse: 'h-2 w-2'
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      icon: 'h-4 w-4',
      bar: 'h-1.5',
      pulse: 'h-3 w-3'
    },
    lg: {
      badge: 'px-4 py-1.5 text-base',
      icon: 'h-5 w-5',
      bar: 'h-2',
      pulse: 'h-4 w-4'
    }
  }

  const Icon = config[priority].icon
  const sizeStyles = sizeConfig[size]

  // Badge variant
  if (variant === 'badge') {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide',
          sizeStyles.badge,
          priority === 'urgent' || priority === 'high'
            ? `bg-gradient-to-r ${config[priority].gradient} text-white shadow-sm`
            : `${config[priority].bgColor} ${config[priority].textColor}`,
          config[priority].animation === 'pulse' && 'animate-pulse',
          config[priority].animation === 'glow' && 'shadow-lg shadow-orange-200',
          className
        )}
      >
        <Icon className={sizeStyles.icon} />
        {showLabel && <span>{priority}</span>}
      </motion.span>
    )
  }

  // Icon only variant
  if (variant === 'icon') {
    return (
      <motion.div
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        className={cn(
          'inline-flex items-center justify-center rounded-lg p-2',
          priority === 'urgent' || priority === 'high'
            ? `bg-gradient-to-br ${config[priority].gradient} text-white shadow-lg`
            : `${config[priority].bgColor} ${config[priority].textColor}`,
          config[priority].animation === 'pulse' && 'animate-pulse',
          className
        )}
      >
        <Icon className={cn(sizeStyles.icon, 'stroke-2')} />
      </motion.div>
    )
  }

  // Bar indicator variant
  if (variant === 'bar') {
    return (
      <div className={cn('relative w-full', className)}>
        <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeStyles.bar)}>
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: priority === 'urgent' ? '100%' : priority === 'high' ? '75%' : priority === 'medium' ? '50%' : '25%'
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              `bg-gradient-to-r ${config[priority].gradient}`,
              config[priority].animation === 'pulse' && 'animate-pulse'
            )}
          />
        </div>
        {showLabel && (
          <div className="flex items-center justify-between mt-1">
            <span className={cn('text-xs font-medium', config[priority].textColor)}>
              {config[priority].label}
            </span>
            <Icon className={cn('h-3 w-3', config[priority].textColor)} />
          </div>
        )}
      </div>
    )
  }

  // Pulse indicator variant
  if (variant === 'pulse') {
    return (
      <div className={cn('relative inline-flex', className)}>
        {(priority === 'urgent' || priority === 'high') && showAnimation && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              priority === 'urgent' ? 'bg-red-400 animate-ping' : 'bg-orange-400 animate-pulse'
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full',
            sizeStyles.pulse,
            priority === 'urgent' ? 'bg-red-500' :
            priority === 'high' ? 'bg-orange-500' :
            priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
          )}
        />
      </div>
    )
  }

  return null
}

// Priority Level Component - Shows multiple priority levels
export function PriorityLevels({
  currentPriority,
  className
}: {
  currentPriority: 'low' | 'medium' | 'high' | 'urgent'
  className?: string
}) {
  const levels = ['low', 'medium', 'high', 'urgent'] as const
  const currentIndex = levels.indexOf(currentPriority)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {levels.map((level, index) => (
        <motion.div
          key={level}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'h-2 w-8 rounded-full',
            index <= currentIndex
              ? level === 'urgent' ? 'bg-red-500' :
                level === 'high' ? 'bg-orange-500' :
                level === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
              : 'bg-gray-200'
          )}
        />
      ))}
    </div>
  )
}

// Animated Priority Badge with effects
export function AnimatedPriorityBadge({
  priority,
  className
}: {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  className?: string
}) {
  if (priority === 'urgent') {
    return (
      <div className={cn('relative inline-flex items-center', className)}>
        {/* Animated background blur */}
        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse" />

        {/* Main badge */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-sm font-bold uppercase shadow-lg"
        >
          <Zap className="h-4 w-4" />
          URGENT
          <span className="absolute -right-1 -top-1">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          </span>
        </motion.div>
      </div>
    )
  }

  if (priority === 'high') {
    return (
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold uppercase shadow-md',
          className
        )}
      >
        <Flame className="h-4 w-4" />
        HIGH
      </motion.div>
    )
  }

  return <PriorityIndicator priority={priority} variant="badge" className={className} />
}