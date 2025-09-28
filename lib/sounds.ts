// Sound Effect System (Optional - disabled by default)
// To enable sounds, users can set localStorage.setItem('enableSounds', 'true')

class SoundManager {
  private enabled: boolean = false
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('enableSounds') === 'true'
      if (this.enabled && typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext()
      }
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Success sound (pleasant chime)
  success() {
    this.playTone(523.25, 0.1) // C5
    setTimeout(() => this.playTone(659.25, 0.1), 100) // E5
    setTimeout(() => this.playTone(783.99, 0.2), 200) // G5
  }

  // Error sound (descending tone)
  error() {
    this.playTone(440, 0.1) // A4
    setTimeout(() => this.playTone(349.23, 0.2), 100) // F4
  }

  // Click sound (subtle pop)
  click() {
    this.playTone(1000, 0.02, 'square')
  }

  // Notification sound (attention grabber)
  notification() {
    this.playTone(880, 0.1) // A5
    setTimeout(() => this.playTone(880, 0.1), 150) // A5
  }

  // Swipe sound (whoosh effect)
  swipe() {
    const osc = this.audioContext?.createOscillator()
    const gain = this.audioContext?.createGain()

    if (!osc || !gain || !this.audioContext) return

    osc.connect(gain)
    gain.connect(this.audioContext.destination)

    osc.frequency.setValueAtTime(800, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

    osc.start(this.audioContext.currentTime)
    osc.stop(this.audioContext.currentTime + 0.1)
  }

  // Milestone sound (celebratory fanfare)
  milestone() {
    this.playTone(523.25, 0.1) // C5
    setTimeout(() => this.playTone(659.25, 0.1), 100) // E5
    setTimeout(() => this.playTone(783.99, 0.1), 200) // G5
    setTimeout(() => this.playTone(1046.5, 0.3), 300) // C6
  }

  // Toggle sounds on/off
  toggle() {
    this.enabled = !this.enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('enableSounds', this.enabled ? 'true' : 'false')

      if (this.enabled && !this.audioContext && typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext()
      }
    }
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }
}

// Export singleton instance
export const sounds = new SoundManager()

// React Hook for sound preferences
import { useState, useEffect } from 'react'

export function useSounds() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(sounds.isEnabled())
  }, [])

  const toggleSounds = () => {
    const newState = sounds.toggle()
    setEnabled(newState)
    return newState
  }

  return { enabled, toggleSounds, sounds }
}