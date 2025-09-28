'use client'

import confetti from 'canvas-confetti'
import { useEffect } from 'react'

// Confetti trigger functions
export const triggerConfetti = {
  // Basic celebration
  celebrate: () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Shoot confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']
      })
    }, 250)
  },

  // Success animation (green theme)
  success: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
      zIndex: 9999
    })
  },

  // Money/revenue celebration (gold theme)
  money: () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#FFD700', '#FFA500', '#FFB300', '#FFC700'],
      zIndex: 9999
    }

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star']
      })

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
      })
    }

    setTimeout(shoot, 0)
    setTimeout(shoot, 100)
    setTimeout(shoot, 200)
  },

  // Milestone achievement (fireworks)
  milestone: () => {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']

    ;(function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999
      })

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame)
      }
    }())
  },

  // Lead accepted animation
  leadAccepted: () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#8B5CF6', '#10B981', '#3B82F6']
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    fire(0.2, {
      spread: 60,
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  },

  // Subtle sparkle effect
  sparkle: (x: number = 0.5, y: number = 0.5) => {
    confetti({
      particleCount: 10,
      spread: 40,
      origin: { x, y },
      colors: ['#8B5CF6', '#EC4899'],
      shapes: ['star'],
      scalar: 0.7,
      gravity: 0.3,
      zIndex: 9999
    })
  }
}

// Confetti Hook
export function useConfetti(type: keyof typeof triggerConfetti, trigger: boolean) {
  useEffect(() => {
    if (trigger) {
      triggerConfetti[type]()
    }
  }, [trigger, type])
}

// Confetti Button Component
interface ConfettiButtonProps {
  children: React.ReactNode
  type?: keyof typeof triggerConfetti
  onClick?: () => void
  className?: string
}

export function ConfettiButton({
  children,
  type = 'celebrate',
  onClick,
  className
}: ConfettiButtonProps) {
  const handleClick = () => {
    triggerConfetti[type]()
    onClick?.()
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}