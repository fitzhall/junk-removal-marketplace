'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, PencilSquareIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

// Mock quote data to preview Step 4
const mockQuote = {
  id: 'test-quote-123',
  priceMin: 250,
  priceMax: 375,
  items: [
    { type: 'Couch', quantity: 1, confidence: 92 },
    { type: 'Mattress', quantity: 2, confidence: 88 },
    { type: 'Boxes', quantity: 5, confidence: 85 }
  ]
}

export default function QuotePreviewPage() {
  const [quote] = useState(mockQuote)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold">Quote Confirmation Preview</h1>
              <p className="text-xs text-gray-500">Step 4 Design</p>
            </div>
          </div>
        </div>
      </header>

      {/* Step 4: Quote Result */}
      <motion.div
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
    </div>
  )
}
