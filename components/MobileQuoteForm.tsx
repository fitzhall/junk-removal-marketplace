'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import imageCompression from 'browser-image-compression'
import LoadingSkeleton from './LoadingSkeleton'
import ItemEditor from './ItemEditor'
import {
  MapPinIcon,
  UserIcon,
  CameraIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon,
  PhotoIcon,
  MapIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import { Loader2 } from 'lucide-react'

interface MobileQuoteFormProps {
  onComplete?: (quoteData: any) => void
  companyId?: string
  companySlug?: string
  primaryColor?: string
}

export default function MobileQuoteForm({ onComplete, companyId, companySlug, primaryColor }: MobileQuoteFormProps) {
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
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
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showItemEditor, setShowItemEditor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Detect user location
  const detectLocation = async () => {
    setDetectingLocation(true)
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // Here you would normally call a reverse geocoding API
            // For now, we'll just set the coordinates
            setLocation(prev => ({
              ...prev,
              address: `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              // In production, use a geocoding service to get actual address
            }))
            setDetectingLocation(false)
          },
          (error) => {
            console.error('Location error:', error)
            setDetectingLocation(false)
          }
        )
      }
    } catch (err) {
      setDetectingLocation(false)
    }
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setPhotos(prev => [...prev, ...files])

      // Create preview URLs
      files.forEach(file => {
        const url = URL.createObjectURL(file)
        setPhotoUrls(prev => [...prev, url])
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(photoUrls[index])
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Compress images
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const
      }

      const compressedPhotos = await Promise.all(
        photos.map(async (photo) => {
          try {
            return await imageCompression(photo, compressionOptions)
          } catch (err) {
            return photo
          }
        })
      )

      const formData = new FormData()
      compressedPhotos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo)
      })
      formData.append('location', JSON.stringify(location))
      formData.append('customer', JSON.stringify(customerInfo))

      // Include company data for white-label widget
      if (companyId) {
        formData.append('companyId', companyId)
      }
      if (companySlug) {
        formData.append('companySlug', companySlug)
      }

      const response = await fetch('/api/quotes/create', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to get quote')
      }

      const data = await response.json()
      setQuote(data)
      // Show item editor first before final quote
      setShowItemEditor(true)

      // Don't call onComplete immediately - wait for user to finish viewing quote
      // if (onComplete) {
      //   onComplete(data)
      // }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const phone = value.replace(/\D/g, '')
    if (phone.length <= 3) return phone
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
  }

  useEffect(() => {
    // Cleanup URLs on unmount
    return () => {
      photoUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`p-2 ${step === 1 ? 'invisible' : ''}`}
              disabled={step === 1}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold">Get Your Quote</h1>
              <p className="text-xs text-gray-500">Step {step} of 4</p>
            </div>

            <button className="p-2 invisible">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Photos */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">📸 Take Photos of Your Items</h2>
              <p className="text-gray-600">Snap a few photos so we can give you an accurate quote</p>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {photoUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative aspect-square"
                >
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {/* Add Photo Button */}
              {photos.length < 9 && (
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <PlusIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>

            {/* Hidden inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <CameraIcon className="w-5 h-5" />
                Take Photos
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <PhotoIcon className="w-5 h-5" />
                Choose from Gallery
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">📷 Photo Tips:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Show the full area or items</li>
                <li>• Take photos from different angles</li>
                <li>• Good lighting helps accuracy</li>
              </ul>
            </div>

            {/* Next Button */}
            {photos.length > 0 && (
              <button
                onClick={() => setStep(2)}
                className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">📍 Where are the items?</h2>
              <p className="text-gray-600">We'll match you with local providers</p>
            </div>

            {/* Quick Location Detection */}
            <button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="w-full bg-blue-50 text-blue-600 py-4 rounded-xl font-medium flex items-center justify-center gap-2 mb-4"
            >
              {detectingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapIcon className="w-5 h-5" />
                  Use My Current Location
                </>
              )}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-x-0 top-2.5 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-3 text-sm text-gray-500">or enter manually</span>
              </div>
            </div>

            {/* Location Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={location.zipCode}
                  onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="94102"
                  maxLength={5}
                />
              </div>
            </form>

            {/* Continue Button */}
            <button
              onClick={() => setStep(3)}
              disabled={!location.zipCode}
              className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-300"
            >
              Continue
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <LoadingSkeleton />
          </motion.div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && !loading && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">👋 How can we reach you?</h2>
              <p className="text-gray-600">We'll send your instant quote here</p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: formatPhone(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                🔒 Your information is secure and will only be shared with verified service providers in your area.
              </p>
            </div>

            {/* Get Quote Button */}
            <button
              onClick={handleSubmit}
              disabled={!customerInfo.name || !customerInfo.phone || loading}
              className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Your Quote...
                </>
              ) : (
                <>
                  Get My Quote
                  <SparklesIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Item Editor */}
        {showItemEditor && quote && !loading && (
          <motion.div
            key="itemEditor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4"
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

        {/* Step 4: Quote Result */}
        {step === 4 && quote && !showItemEditor && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 pb-24"
          >
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3"
              >
                <CheckIcon className="w-8 h-8 text-green-600" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">💬 Get Your Quote</h2>

              {/* Humanizing Line */}
              <p className="text-sm text-gray-600 mb-1">
                We found local haulers who can pick up as early as <span className="font-semibold text-green-600">today</span>
              </p>

              {/* Social Proof */}
              <p className="text-xs text-gray-500">
                Trusted by homeowners in your area
              </p>
            </div>

            {/* Price Range - More Compact */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white mb-3 text-center">
              <p className="text-xs opacity-90 mb-1">Estimated Price Range</p>
              <div className="text-3xl font-bold">
                ${quote.priceMin} - ${quote.priceMax}
              </div>
              <p className="text-xs opacity-90 mt-1">Final price confirmed on-site</p>

              {/* Trust Badges - Immediately Below Price */}
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  No hidden fees
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckIcon className="w-3 h-3" />
                  Licensed & insured
                </span>
              </div>
            </div>

            {/* Expected Time */}
            <div className="mb-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm w-full justify-center">
              <svg className="w-4 h-4 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900">
                Your bids usually arrive in 12–22 minutes
              </span>
            </div>

            {/* PRIMARY CTA - Text Us (ABOVE THE FOLD) */}
            <button
              onClick={() => {
                window.location.href = `sms:+18005865669?body=Hi! I just got quote ${quote.id}. Can you help me?`
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold mb-2 flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Text Us for Instant Help
            </button>

            {/* Secondary - Call Us Link */}
            <button
              onClick={() => {
                window.location.href = 'tel:+18005865669'
              }}
              className="w-full text-gray-600 py-2 text-sm mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Prefer to talk? Call us
            </button>

            {/* Identified Items */}
            {quote.items && quote.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">We Identified:</h3>
                  <button
                    onClick={() => setShowItemEditor(true)}
                    className="text-blue-600 text-xs flex items-center gap-1"
                  >
                    <PencilSquareIcon className="w-3 h-3" />
                    Edit
                  </button>
                </div>
                <div className="space-y-2">
                  {quote.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.type}</span>
                      <div className="flex items-center gap-3">
                        {item.confidence && (
                          <span className="text-xs text-gray-400">{item.confidence}%</span>
                        )}
                        <span className="text-gray-600 font-medium">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Want Faster Service */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                ⚡ Want faster service?
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Send us photos and get an instant bid
              </p>
              <button
                onClick={() => {
                  window.location.href = `sms:+18005865669?body=Hi! I just got quote ${quote.id}. Can you help me?`
                }}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Text Photos Now
              </button>
            </div>

            {/* What Happens Next - More Immediate Language */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-sm mb-3">What Happens Next (Starting Now):</h3>
              <ol className="text-sm text-gray-600 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">1</span>
                  <span><strong className="text-gray-900">Haulers are reviewing</strong> your request right now...</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">2</span>
                  <span><strong className="text-gray-900">You'll get bids</strong> in 12–22 minutes...</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">3</span>
                  <span><strong className="text-gray-900">You choose</strong> the best price...</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">4</span>
                  <span><strong className="text-gray-900">Pickup happens</strong> today or tomorrow!</span>
                </li>
              </ol>
            </div>

            {/* Forward CTA - Reserve Spot */}
            <div className="text-center mb-4">
              <button
                onClick={() => {
                  window.location.href = `sms:+18005865669?body=Hi! I just got quote ${quote.id}. I'd like to reserve my spot today.`
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl"
              >
                Reserve Your Spot Today
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-500 mt-2">
                No payment required • Cancel anytime
              </p>
            </div>

            {/* Small Secondary Action */}
            <button
              onClick={() => {
                setStep(1)
                setPhotos([])
                setPhotoUrls([])
                setQuote(null)
              }}
              className="w-full text-gray-400 py-2 text-xs"
            >
              Get Another Quote
            </button>

            {/* FIXED STICKY BAR - Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl border-t-4 border-green-700 z-50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-6 h-6 animate-bounce flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">Questions? Text Us Now</p>
                      <p className="text-xs text-green-100 truncate">Fastest Response • 2-5 min</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = `sms:+18005865669?body=Hi! I just got quote ${quote.id}. Can you help me?`
                    }}
                    className="bg-white text-green-600 px-4 py-2.5 rounded-lg font-bold text-sm shadow-xl flex-shrink-0 flex items-center gap-1"
                  >
                    <span className="text-base">💬</span>
                    Text Us →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}