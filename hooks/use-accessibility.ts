'use client'

import { useEffect, useRef, useState } from 'react'

// Focus trap hook for modals and dialogs
export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !ref.current) return

    const element = ref.current
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return ref
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case '/':
          // Focus search
          e.preventDefault()
          const searchInput = document.querySelector('[data-search-input]') as HTMLElement
          searchInput?.focus()
          break
        case 'Escape':
          // Close modals or clear focus
          const modal = document.querySelector('[data-modal]') as HTMLElement
          if (modal) {
            const closeButton = modal.querySelector('[data-modal-close]') as HTMLElement
            closeButton?.click()
          }
          break
        case '?':
          // Show keyboard shortcuts
          if (e.shiftKey) {
            console.log('Keyboard shortcuts:')
            console.log('/ - Focus search')
            console.log('Escape - Close modal')
            console.log('Alt+N - New lead')
            console.log('Alt+S - Settings')
          }
          break
      }

      // Alt key combinations
      if (e.altKey) {
        switch (e.key) {
          case 'n':
            // New lead
            e.preventDefault()
            window.location.href = '/provider'
            break
          case 's':
            // Settings
            e.preventDefault()
            window.location.href = '/provider/settings'
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])
}

// Announce screen reader messages
export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!announcement) return

    const timer = setTimeout(() => {
      setAnnouncement('')
    }, 1000)

    return () => clearTimeout(timer)
  }, [announcement])

  const announce = (message: string) => {
    setAnnouncement(message)
  }

  const Announcer = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )

  return { announce, Announcer }
}

// Reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 bg-purple-600 text-white px-4 py-2 rounded-lg z-50"
    >
      Skip to main content
    </a>
  )
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// ARIA live region for dynamic updates
export function LiveRegion({
  children,
  mode = 'polite'
}: {
  children: React.ReactNode
  mode?: 'polite' | 'assertive'
}) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  )
}