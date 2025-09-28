'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import { cn } from '@/lib/utils'

// 3D Tilt Card Effect
interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </motion.div>
  )
}

// Magnetic Button Effect
interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticButton({ children, className, strength = 0.5 }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { damping: 15, stiffness: 150 })
  const mouseYSpring = useSpring(y, { damping: 15, stiffness: 150 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = (e.clientX - centerX) * strength
    const distanceY = (e.clientY - centerY) * strength

    x.set(distanceX)
    y.set(distanceY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: mouseXSpring,
        y: mouseYSpring,
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}

// Ripple Effect on Click
interface RippleProps {
  className?: string
}

export function Ripple({ className }: RippleProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 1000)
  }

  return (
    <div
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  )
}

// Glow on Hover
interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({
  children,
  className,
  glowColor = 'rgba(139, 92, 246, 0.4)'
}: GlowCardProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
      }}
      transition={{ duration: 0.3 }}
      className={cn('relative rounded-xl', className)}
    >
      {children}
    </motion.div>
  )
}

// Stagger Children Animation
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Parallax Scroll Effect
interface ParallaxProps {
  children: ReactNode
  offset?: number
  className?: string
}

export function Parallax({ children, offset = 50, className }: ParallaxProps) {
  const y = useMotionValue(0)
  const yRange = [-offset, offset]
  const yOutput = [`${offset}px`, `-${offset}px`]

  useEffect(() => {
    const handleScroll = () => {
      y.set(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [y])

  const translateY = useTransform(y, yRange, yOutput)

  return (
    <motion.div style={{ y: translateY }} className={className}>
      {children}
    </motion.div>
  )
}

// Morphing Shape Background
export function MorphingShape({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('absolute', className)}
      animate={{
        scale: [1, 1.2, 1.2, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ['20%', '20%', '50%', '50%', '20%'],
      }}
      transition={{
        duration: 12,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        filter: 'blur(40px)',
        opacity: 0.3,
      }}
    />
  )
}

// Import missing dependencies
import { useState, useEffect } from 'react'