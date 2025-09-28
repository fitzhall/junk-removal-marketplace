'use client'

import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { useState } from 'react'
import { Check, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnhancedLeadCard } from './enhanced-lead-card'

interface SwipeableLeadCardProps {
  lead: any
  onAccept: () => void
  onDecline: () => void
  onViewDetails: () => void
  className?: string
  index?: number
}

export function SwipeableLeadCard({
  lead,
  onAccept,
  onDecline,
  onViewDetails,
  className,
  index = 0
}: SwipeableLeadCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const controls = useAnimation()

  // Swipe motion values
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  // Color overlays based on swipe direction
  const acceptOverlay = useTransform(
    x,
    [0, 100],
    ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.4)']
  )
  const declineOverlay = useTransform(
    x,
    [-100, 0],
    ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0)']
  )

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0) {
        // Swiped right - Accept
        setExitDirection('right')
        controls.start({
          x: window.innerWidth,
          opacity: 0,
          transition: { duration: 0.2 }
        }).then(() => onAccept())
      } else {
        // Swiped left - Decline
        setExitDirection('left')
        controls.start({
          x: -window.innerWidth,
          opacity: 0,
          transition: { duration: 0.2 }
        }).then(() => onDecline())
      }
    } else {
      // Snap back to center
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300 } })
    }
  }

  return (
    <motion.div
      className={cn('relative w-full', className)}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{
        scale: 1 - index * 0.02,
        opacity: 1,
        y: index * -8,
        transition: { delay: index * 0.1 }
      }}
      style={{
        zIndex: 10 - index,
        position: index > 0 ? 'absolute' : 'relative',
        top: 0,
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, rotate, opacity }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {/* Accept Overlay */}
        <motion.div
          className="absolute inset-0 z-10 rounded-xl flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: acceptOverlay }}
        >
          <motion.div
            className="bg-green-500 text-white rounded-full p-4 shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: x.get() > 50 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Decline Overlay */}
        <motion.div
          className="absolute inset-0 z-10 rounded-xl flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: declineOverlay }}
        >
          <motion.div
            className="bg-red-500 text-white rounded-full p-4 shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: x.get() < -50 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <X className="h-8 w-8" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Lead Card */}
        <div className="relative">
          <EnhancedLeadCard
            lead={lead}
            onViewDetails={onViewDetails}
            variant="default"
          />
        </div>

        {/* Swipe Hints */}
        {index === 0 && (
          <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-between px-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <X className="h-3 w-3" />
              <span>Swipe left to pass</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>Tap for details</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Swipe right to accept</span>
              <Check className="h-3 w-3" />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}