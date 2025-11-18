'use client'

import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  refreshTimeout?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  refreshTimeout = 2000
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull-to-refresh if we're at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return

      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current

      // Only pull down, not up
      if (distance > 0) {
        // Apply resistance to make it feel more natural
        const resistedDistance = Math.min(distance * 0.5, 150)
        setPullDistance(resistedDistance)

        // Prevent default scrolling when pulling
        if (distance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      setIsPulling(false)

      if (pullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true)

        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        }

        // Keep the refreshing state for a minimum time for UX
        timeoutId = setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, refreshTimeout)
      } else {
        setPullDistance(0)
      }
    }

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh, threshold, refreshTimeout])

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    isReadyToRefresh: pullDistance > threshold
  }
}