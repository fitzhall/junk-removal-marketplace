'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface BookingSchedulerProps {
  quoteId: string
  onBookingComplete: (bookingData: any) => void
  estimatedPrice: { min: number; max: number }
}

export default function BookingScheduler({ quoteId, onBookingComplete, estimatedPrice }: BookingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip Sundays for example
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          available: true
        })
      }
    }

    return dates
  }

  // Time slots
  const timeSlots = [
    { value: 'morning', label: '8:00 AM - 12:00 PM', icon: '🌅' },
    { value: 'afternoon', label: '12:00 PM - 4:00 PM', icon: '☀️' },
    { value: 'evening', label: '4:00 PM - 8:00 PM', icon: '🌆' }
  ]

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both date and time')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          scheduledDate: selectedDate,
          timeSlot: selectedTimeSlot,
          isUrgent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const data = await response.json()
      onBookingComplete(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const availableDates = getAvailableDates()

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">📅 Schedule Your Pickup</h2>
        <p className="text-gray-600">Choose a convenient date and time</p>
      </div>

      {/* Urgent Service Option */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ExclamationCircleIcon className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Same-Day Service</span>
              <span className="text-sm text-amber-700">+50% rush fee</span>
            </div>
            <p className="text-sm text-amber-800">
              Available for pickup within 4 hours. Subject to availability.
            </p>
          </div>
        </label>
      </div>

      {!isUrgent && (
        <>
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Select Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableDates.map((date) => (
                <motion.button
                  key={date.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(date.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedDate === date.value
                      ? 'border-green-500 bg-green-50 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm">{date.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Select Time Window
              </label>
              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <motion.button
                    key={slot.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedTimeSlot(slot.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTimeSlot === slot.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{slot.icon}</span>
                      <div>
                        <div className="font-medium">{slot.label}</div>
                        <div className="text-xs text-gray-500">2-hour arrival window</div>
                      </div>
                      {selectedTimeSlot === slot.value && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Price Summary */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Estimated Total</span>
          <span className="text-2xl font-bold text-green-600">
            ${isUrgent ? Math.round(estimatedPrice.max * 1.5) : estimatedPrice.max}
          </span>
        </div>
        {isUrgent && (
          <p className="text-xs text-amber-700">Includes 50% same-day surcharge</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Final price confirmed on-site. No payment required now.
        </p>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Button */}
      <button
        onClick={handleBooking}
        disabled={loading || (!isUrgent && (!selectedDate || !selectedTimeSlot))}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Confirming...
          </span>
        ) : (
          'Confirm Booking'
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center mt-4">
        By booking, you agree to our terms of service.
        Free cancellation up to 24 hours before scheduled pickup.
      </p>
    </div>
  )
}