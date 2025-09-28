'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Spinner variants
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={cn(
        'rounded-full border-purple-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Dots loading animation
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            delay: i * 0.2
          }}
          className="h-2 w-2 bg-purple-600 rounded-full"
        />
      ))}
    </div>
  )
}

// Pulse loader
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 2
        }}
        className="h-16 w-16 bg-purple-600 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          repeat: Infinity,
          duration: 2
        }}
        className="absolute inset-0 h-16 w-16 bg-purple-600 rounded-full"
      />
    </div>
  )
}

// Bar loader
export function BarLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            height: ['12px', '24px', '12px']
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
            delay: i * 0.1
          }}
          className="w-1 bg-gradient-to-t from-purple-600 to-indigo-600 rounded-full"
          style={{ height: 12 }}
        />
      ))}
    </div>
  )
}

// Page loading overlay
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <PulseLoader className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </motion.div>
    </div>
  )
}

// Content loader with fade in
export function ContentLoader({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <DotsLoader />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Progress bar
export function ProgressBar({ progress, className }: { progress: number, className?: string }) {
  return (
    <div className={cn('h-2 bg-gray-200 rounded-full overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
      />
    </div>
  )
}

// Circular progress
export function CircularProgress({ progress, size = 60 }: { progress: number, size?: number }) {
  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-purple-600"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{progress}%</span>
      </div>
    </div>
  )
}

// Loading button
export function LoadingButton({
  children,
  isLoading,
  loadingText = 'Loading...',
  className,
  ...props
}: {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
  className?: string
  [key: string]: any
}) {
  return (
    <button
      disabled={isLoading}
      className={cn(
        'relative flex items-center justify-center',
        isLoading && 'cursor-not-allowed opacity-80',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}