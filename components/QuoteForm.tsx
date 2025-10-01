'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import imageCompression from 'browser-image-compression'
import PhotoUpload from './PhotoUpload'
import TestMode from './TestMode'
import MobileHandoff from './MobileHandoff'
import DebugPanel from './DebugPanel'
import ErrorDisplay from './ErrorDisplay'
import ApiTester from './ApiTester'
import LoadingSkeleton from './LoadingSkeleton'
import ItemEditor from './ItemEditor'
import PricingBreakdown from './PricingBreakdown'
import BookingScheduler from './BookingScheduler'
import {
  MapPinIcon,
  UserIcon,
  CameraIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { Loader2 } from 'lucide-react'

export default function QuoteForm() {
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [location, setLocation] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<{ priceMin: number; priceMax: number; items: Array<{ type: string; quantity: number; confidence?: number; requiresSpecialHandling?: boolean; category?: string }>; id?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showItemEditor, setShowItemEditor] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const steps = [
    { number: 1, title: 'Photos', icon: CameraIcon },
    { number: 2, title: 'Location', icon: MapPinIcon },
    { number: 3, title: 'Contact', icon: UserIcon },
    { number: 4, title: 'Quote', icon: SparklesIcon }
  ]

  const handlePhotoUpload = (files: File[]) => {
    setPhotos(files)
  }

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling

    console.log('=== Form Submit Started ===')
    console.log('Photos:', photos.length)
    console.log('Location:', location)
    console.log('Customer:', customerInfo)

    setLoading(true)
    setError(null) // Clear any previous errors

    try {
      // Check file sizes before uploading
      const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0)

      console.log(`Uploading ${photos.length} photos, total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)

      // Compress images before upload to avoid Vercel's 4.5MB limit
      const compressionOptions = {
        maxSizeMB: 1,          // Max 1MB per image
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: 'image/jpeg'  // Convert to JPEG for better compression
      }

      console.log('Compressing images...')
      const compressedPhotos = await Promise.all(
        photos.map(async (photo, index) => {
          try {
            console.log(`Compressing photo ${index + 1}: ${photo.name} (${(photo.size / 1024 / 1024).toFixed(2)}MB)`)
            const compressed = await imageCompression(photo, compressionOptions)
            console.log(`Compressed photo ${index + 1}: ${compressed.name} (${(compressed.size / 1024 / 1024).toFixed(2)}MB)`)
            return compressed
          } catch (compressionError) {
            console.error(`Failed to compress photo ${index + 1}, using original:`, compressionError)
            return photo // Fall back to original if compression fails
          }
        })
      )

      const compressedTotalSize = compressedPhotos.reduce((sum, photo) => sum + photo.size, 0)
      console.log(`Compressed total size: ${(compressedTotalSize / 1024 / 1024).toFixed(2)}MB (was ${(totalSize / 1024 / 1024).toFixed(2)}MB)`)

      // Ensure compressed size is under Vercel's limit
      if (compressedTotalSize > 4 * 1024 * 1024) { // 4MB to be safe (Vercel limit is 4.5MB)
        throw new Error(`Images are too large even after compression (${(compressedTotalSize / 1024 / 1024).toFixed(1)}MB). Please use fewer or smaller images.`)
      }

      const formData = new FormData()
      compressedPhotos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo)
      })
      formData.append('location', JSON.stringify(location))
      formData.append('customerInfo', JSON.stringify(customerInfo))

      console.log('Submitting quote request...')

      // Add timeout wrapper for mobile networks
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let response
      try {
        response = await fetch('/api/quotes/create', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        // Handle specific mobile network errors
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.')
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.')
        } else {
          throw new Error(`Failed to connect to server: ${fetchError.message}`)
        }
      } finally {
        clearTimeout(timeoutId)
      }

      console.log('Response status:', response.status)
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      })

      // Check if response is ok BEFORE trying to read the body
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`
        try {
          const errorText = await response.text()
          console.error('Error response text:', errorText)
          errorMessage += `: ${errorText.substring(0, 500)}`
        } catch (readError) {
          console.error('Failed to read error response:', readError)
          errorMessage += ': Unable to read error details'
        }
        throw new Error(errorMessage)
      }

      // Check if response is JSON before trying to parse
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content-type:', contentType)
        // Try to read the response for debugging
        let responseText = ''
        try {
          responseText = await response.text()
          console.error('Non-JSON response:', responseText.substring(0, 500))
        } catch (readError) {
          console.error('Failed to read response:', readError)
        }
        throw new Error(`Server returned non-JSON response. Content-Type: ${contentType}. Response preview: "${responseText.substring(0, 200)}..."`)
      }

      // Now safely parse JSON
      let data
      try {
        const responseText = await response.text()
        console.log('Raw response:', responseText)

        // Handle empty response
        if (!responseText || responseText.trim() === '') {
          throw new Error('Server returned empty response')
        }

        data = JSON.parse(responseText)
        console.log('Parsed response data:', JSON.stringify(data, null, 2))
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error(`Failed to parse server response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      // Check if Vision API failed and we got mock data
      if (data.mockData) {
        console.warn('Vision API failed, using mock data:', data.details)
        setError(`Vision API Error: ${data.details?.message || 'Unknown error'}. Using mock data for demonstration.`)
      }

      // Log what we received for debugging
      console.log('Quote response received:', {
        success: data.success,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        items: data.items,
        hasData: !!data
      })

      if (data.success && data.priceMin !== undefined && data.priceMax !== undefined) {
        console.log('Setting quote and showing item editor')
        setQuote(data)
        // Show item editor after getting initial quote
        setShowItemEditor(true)
        // Force a small delay to ensure state update completes
        setTimeout(() => {
          // Scroll to top on mobile to ensure editor is visible
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        console.error('Invalid response format:', data)
        // Show more detail about what's wrong
        const errorMsg = `Response missing required fields:
Success: ${data.success}
PriceMin: ${data.priceMin}
PriceMax: ${data.priceMax}
Full response: ${JSON.stringify(data).substring(0, 200)}...`
        setError(errorMsg)
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      // Show the actual error message on mobile
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      // Don't use alert - use ErrorDisplay component instead
      setError(errorMessage + '\n\n' + String(error).substring(0, 500))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Helper Components */}
      <TestMode onSelectTestImages={(files) => {
        setPhotos(files)
        if (files.length > 0 && step === 1) {
          // Auto-advance to step 2 when test images are loaded
          setStep(2)
        }
      }} />
      <MobileHandoff />
      <DebugPanel />
      <ApiTester />
      <ErrorDisplay error={error} onClose={() => setError(null)} />

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex-1">
              <div className="relative flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: step >= s.number ? '#22c55e' : '#e5e7eb',
                    scale: step === s.number ? 1.1 : 1
                  }}
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  {step > s.number ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <s.icon className={`w-6 h-6 ${step >= s.number ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </motion.div>

                {index < steps.length - 1 && (
                  <div className="absolute left-12 right-0 top-6 h-[2px]">
                    <div className="relative h-full bg-gray-200">
                      <motion.div
                        initial={false}
                        animate={{
                          width: step > s.number ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute h-full bg-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className={`mt-2 text-sm font-medium ${
                step >= s.number ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">
                📸 Show Us Your Junk
              </h2>
              <p className="text-gray-600 text-lg">
                Take clear photos from different angles. Our AI will identify and price each item.
              </p>
            </div>

            <PhotoUpload onPhotosSelected={handlePhotoUpload} />

            {photos.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setStep(2)}
                className="mt-8 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Continue to Location
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleLocationSubmit}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">
                📍 Where&apos;s the Pickup?
              </h2>
              <p className="text-gray-600 text-lg">
                We&apos;ll match you with the best local providers in your area.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="CA"
                      maxLength={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors uppercase"
                      value={location.state}
                      onChange={(e) => setLocation({ ...location, state: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      placeholder="94105"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                      value={location.zipCode}
                      onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Continue to Contact
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && !loading && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleCustomerInfoSubmit}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">
                ✉️ Get Your Quote
              </h2>
              <p className="text-gray-600 text-lg">
                We&apos;ll send your instant quote and connect you with providers.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    Get Instant Quote
                    <SparklesIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        )}

        {/* Item Editor */}
        {showItemEditor && quote && !loading && (
          <motion.div
            key="itemEditor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <ItemEditor
              items={quote.items || []}
              onUpdate={(updatedItems) => {
                setQuote({ ...quote, items: updatedItems })
              }}
              onConfirm={() => {
                setShowItemEditor(false)
                setStep(4)
              }}
            />
          </motion.div>
        )}

        {/* Step 4: Quote Display */}
        {step === 4 && quote && !showItemEditor && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
              >
                <CheckIcon className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">
                Your Instant Quote is Ready!
              </h2>
              <p className="text-gray-600 text-lg">
                Based on AI analysis of your {photos.length} photo{photos.length > 1 ? 's' : ''}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8"
            >
              <p className="text-center text-sm text-gray-600 mb-3">Estimated Price Range</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-bold text-green-600">${quote.priceMin}</span>
                <span className="text-2xl text-gray-400">-</span>
                <span className="text-5xl font-bold text-green-600">${quote.priceMax}</span>
              </div>
              <p className="text-center text-gray-600 mt-4">
                Final price depends on actual volume and items
              </p>
            </motion.div>

            {quote.items && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">AI Detected Items:</h3>
                  <button
                    onClick={() => setShowItemEditor(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit Items
                  </button>
                </div>
                <div className="space-y-3">
                  {quote.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.type}</span>
                        {item.requiresSpecialHandling && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            Special Handling
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {item.confidence !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  item.confidence >= 90 ? 'bg-green-500' :
                                  item.confidence >= 70 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${item.confidence}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              item.confidence >= 90 ? 'text-green-600' :
                              item.confidence >= 70 ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                              {item.confidence}%
                            </span>
                          </div>
                        )}
                        <span className="text-gray-600 font-medium">Qty: {item.quantity}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Confidence score indicates AI detection accuracy
                </p>
              </motion.div>
            )}

            {/* Pricing Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PricingBreakdown
                breakdown={(quote as any).breakdown}
                truckLoads={(quote as any).truckLoads}
                showDetails={!!(quote as any).breakdown}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid md:grid-cols-2 gap-4 mt-8"
            >
              <button
                onClick={() => alert('Save functionality coming soon!')}
                className="bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
              >
                Save Quote for Later
              </button>
              <button
                onClick={() => setShowBooking(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
              >
                Book Pickup Now →
              </button>
            </motion.div>

            <p className="text-center text-sm text-gray-500 mt-6">
              ✅ 3 local providers available • Average arrival: 2-4 hours
            </p>
          </motion.div>
        )}

        {/* Booking Scheduler */}
        {showBooking && quote && !bookingConfirmed && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BookingScheduler
              quoteId={quote.id || ''}
              estimatedPrice={{ min: quote.priceMin, max: quote.priceMax }}
              onBookingComplete={(bookingData) => {
                setBookingConfirmed(true)
                setShowBooking(false)
              }}
            />
          </motion.div>
        )}

        {/* Booking Confirmation */}
        {bookingConfirmed && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
            >
              <CheckIcon className="w-12 h-12 text-green-600" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-3">Booking Confirmed! 🎉</h2>
            <p className="text-xl text-gray-600 mb-8">
              We'll send you a confirmation email shortly
            </p>

            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold mb-4">What's Next?</h3>
              <ol className="text-left space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  <span>Local providers will review your request</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  <span>You'll receive bids within 1 hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  <span>Choose your preferred provider</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                  <span>Confirm final details and schedule</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}