'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, PhoneIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('id')
  const estimatedPrice = searchParams.get('price')
  const [timeLeft, setTimeLeft] = useState(20 * 60) // 20 minutes in seconds

  useEffect(() => {
    // Track thank you page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_thank_you', {
        quote_id: quoteId,
        value: estimatedPrice ? parseFloat(estimatedPrice) : 0
      })
    }

    // Countdown timer for urgency
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quoteId, estimatedPrice])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You! Your Free Quote is Ready
          </h1>

          <p className="text-xl text-gray-600 mb-2">
            Quote ID: <span className="font-semibold text-gray-900">{quoteId || 'PENDING'}</span>
          </p>

          {estimatedPrice && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-6 inline-block">
              <p className="text-sm text-gray-600 mb-2">Estimated Price Range:</p>
              <p className="text-3xl font-bold text-green-600">
                ${estimatedPrice} - ${parseInt(estimatedPrice) + 125}
              </p>
              <p className="text-sm text-gray-500 mt-2">Final price confirmed on-site</p>
            </div>
          )}
        </div>

        {/* Special Offer Banner */}
        {timeLeft > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">🔥 Limited Time Offer!</h2>
                <p className="text-lg">Book now and save 20% on your service</p>
                <p className="text-sm opacity-90 mt-1">This offer expires in: {formatTime(timeLeft)}</p>
              </div>
              <button
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                onClick={() => window.location.href = 'tel:1-800-JUNK-NOW'}
              >
                <PhoneIcon className="w-5 h-5" />
                Call Now to Save 20%
              </button>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We\'ll Call You Within 15 Minutes</h3>
                <p className="text-gray-600">Our team will call to confirm your quote and schedule a convenient pickup time.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Schedule Your Pickup</h3>
                <p className="text-gray-600">Choose a time that works for you - we offer same-day and next-day service.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We Handle Everything</h3>
                <p className="text-gray-600">Our team arrives, loads everything, cleans up, and hauls it away. You don\'t lift a finger!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Need Immediate Service?</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="tel:1-800-JUNK-NOW"
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-center group"
            >
              <PhoneIcon className="w-8 h-8 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Call Us Now</p>
              <p className="text-sm opacity-90">1-800-JUNK-NOW</p>
              <p className="text-xs opacity-75 mt-2">Mon-Sun: 7am-9pm</p>
            </a>

            <a
              href={`mailto:service@junkremoval.com?subject=Quote ${quoteId}`}
              className="bg-white border-2 border-gray-200 text-gray-900 p-6 rounded-xl hover:border-green-500 transition-colors text-center"
            >
              <ClockIcon className="w-8 h-8 mx-auto mb-3" />
              <p className="font-bold text-lg mb-1">Schedule Online</p>
              <p className="text-sm text-gray-600">We\'ll confirm within 1 hour</p>
              <p className="text-xs text-gray-500 mt-2">Response time: ~30 min</p>
            </a>
          </div>
        </div>

        {/* Photo Upload Upsell */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-blue-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Want a More Accurate Quote?
            </h2>

            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upload photos of your items for an instant AI-powered quote that\'s 95% accurate.
              Get exact pricing in seconds and lock in your rate!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={`/?quoteId=${quoteId}`}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Photos for Precise Quote
              </a>

              <span className="text-sm text-gray-500">
                Takes only 2 minutes • No obligation
              </span>
            </div>

            <div className="mt-6 flex justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                95% Accurate Pricing
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                Instant Results
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                Price Lock Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Need:</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">🏠 Full Home Cleanout</h3>
              <p className="text-sm text-gray-600">Moving? We can clear your entire home quickly.</p>
            </div>

            <div className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">🛋️ Furniture Removal</h3>
              <p className="text-sm text-gray-600">Old couch? Broken appliance? We\'ll haul it away.</p>
            </div>

            <div className="border rounded-lg p-4 hover:border-green-500 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">🏗️ Construction Cleanup</h3>
              <p className="text-sm text-gray-600">Post-renovation debris? We handle that too.</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-12 pb-8">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <span>✓ Licensed & Insured</span>
            <span>✓ 100% Satisfaction Guarantee</span>
            <span>✓ Eco-Friendly Disposal</span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Your quote is saved and valid for 30 days. No obligation to book.
          </p>
        </div>
      </div>
    </div>
  )
}