'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { CheckCircleIcon, ChatBubbleLeftRightIcon, PhoneIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('id')
  const estimatedPrice = searchParams.get('price')

  useEffect(() => {
    // Track thank you page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_thank_you', {
        quote_id: quoteId,
        value: estimatedPrice ? parseFloat(estimatedPrice) : 0
      })
    }
  }, [quoteId, estimatedPrice])

  const handleTextClick = () => {
    // Open SMS with pre-filled message
    window.location.href = `sms:+18005865669?body=Hi! I just got quote ${quoteId}. Can you help me?`
  }

  const handleCallClick = () => {
    window.location.href = 'tel:+18005865669'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💬 Get Your Quote
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            Quote ID: <span className="font-semibold text-gray-900">{quoteId || 'PENDING'}</span>
          </p>

          {/* Price Block */}
          {estimatedPrice && (
            <div className="bg-white border-2 border-green-200 rounded-2xl p-8 mt-8 inline-block shadow-lg">
              <p className="text-sm text-gray-600 mb-3">Estimated Price Range:</p>
              <p className="text-5xl font-bold text-green-600 mb-3">
                ${estimatedPrice} - ${parseInt(estimatedPrice) + 125}
              </p>
              <p className="text-sm text-gray-500">Final price confirmed on-site</p>

              {/* Trust Badges - RIGHT BELOW PRICE */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    No hidden fees
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    Licensed & insured
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="mt-6 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              We found local haulers who can pick up as early as today
            </span>
          </div>
        </motion.div>

        {/* Want Faster Service - MICROCOPY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">
            ⚡ Want faster service?
          </p>
          <p className="text-gray-600 mb-4">
            Send us photos and get an instant bid
          </p>
          <button
            onClick={handleTextClick}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Text Photos Now
          </button>
        </motion.div>

        {/* Need Help Section - PRIMARY CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Need help or want faster service?
          </h2>

          {/* Text CTA - PRIMARY */}
          <button
            onClick={handleTextClick}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg mb-4 group"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <ChatBubbleLeftRightIcon className="w-8 h-8 group-hover:animate-bounce" />
              <span className="text-2xl font-bold">Text us for instant help</span>
            </div>
            <p className="text-green-100 text-sm">
              📱 Fastest Response • Typically reply in 2-5 minutes
            </p>
          </button>

          {/* Call CTA - SECONDARY */}
          <button
            onClick={handleCallClick}
            className="w-full flex items-center justify-center gap-2 text-gray-700 py-3 hover:text-green-600 transition-colors"
          >
            <PhoneIcon className="w-5 h-5" />
            <span className="font-medium">Prefer to talk? Call us</span>
          </button>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Text or Call Us</h3>
                <p className="text-gray-600">Send us photos for the most accurate quote, or call to discuss your needs.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Confirm Your Quote</h3>
                <p className="text-gray-600">We'll finalize details and confirm the exact price based on your items.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Schedule Your Pickup</h3>
                <p className="text-gray-600">Book same-day or next-day service. We handle everything - you don't lift a finger!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reserve Pickup CTA - FORWARD MOMENTUM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleTextClick}
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            Reserve Your Spot Today
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 mt-3">
            No payment required • Cancel anytime
          </p>
        </motion.div>

        {/* Trust Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              No spam
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              Cancel anytime
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              Eco-friendly disposal
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Your quote is saved and valid for 30 days. We only notify you about your quote.
          </p>
        </div>
      </div>

      {/* FIXED STICKY BAR - BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl border-t-4 border-green-700 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 animate-bounce" />
              <div>
                <p className="font-bold text-lg">Questions? Text Us Now</p>
                <p className="text-sm text-green-100">Fastest Response • Usually reply in 2-5 min</p>
              </div>
            </div>
            <button
              onClick={handleTextClick}
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
            >
              <span className="text-2xl">💬</span>
              Text Us →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
