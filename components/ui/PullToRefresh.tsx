'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, isPulling, isReadyToRefresh } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    refreshTimeout: 1500
  })

  const rotation = Math.min(pullDistance * 3, 360)
  const scale = Math.min(pullDistance / 80, 1)

  return (
    <>
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{
              opacity: 1,
              y: 0,
              height: Math.min(pullDistance, 80)
            }}
            exit={{ opacity: 0, y: -50 }}
            className="flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent"
          >
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : rotation,
                scale: scale
              }}
              transition={{
                rotate: isRefreshing ? {
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                } : {
                  duration: 0
                }
              }}
              className={`flex items-center justify-center p-2 rounded-full ${
                isReadyToRefresh ? 'bg-blue-600' : 'bg-gray-400'
              } transition-colors`}
            >
              <ArrowPathIcon className={`w-6 h-6 ${
                isReadyToRefresh ? 'text-white' : 'text-gray-200'
              }`} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh status message */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white py-2 text-center text-sm font-medium shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              Refreshing leads...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        animate={{
          y: isPulling && !isRefreshing ? Math.min(pullDistance * 0.5, 40) : 0
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {children}
      </motion.div>
    </>
  )
}