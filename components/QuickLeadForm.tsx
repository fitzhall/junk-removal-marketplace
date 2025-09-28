'use client'

import { useState, useEffect } from 'react'
import { PhoneIcon, MapPinIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface QuickLeadFormProps {
  headline?: string
  subheadline?: string
  buttonText?: string
  urgencyMessage?: string
  trustBadges?: boolean
  campaignId?: string
  variant?: 'A' | 'B'
}

export default function QuickLeadForm({
  headline = 'Get Your Free Junk Removal Quote',
  subheadline = 'Fast, Reliable, Same-Day Service Available',
  buttonText = 'Get Free Quote Now',
  urgencyMessage = '⚡ 2,847 quotes given today',
  trustBadges = true,
  campaignId = 'default',
  variant = 'A'
}: QuickLeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zipCode: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [utmParams, setUtmParams] = useState<Record<string, string>>({})

  useEffect(() => {
    // Capture UTM parameters and Google Click ID from URL
    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}

    // Standard UTM parameters
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach(param => {
      const value = params.get(param)
      if (value) utm[param] = value
    })

    // Also capture Google Ads specific parameters
    if (params.get('campaignid')) utm.campaign = params.get('campaignid') || ''
    if (params.get('adgroupid')) utm.adGroup = params.get('adgroupid') || ''
    if (params.get('keyword')) utm.keyword = params.get('keyword') || ''
    if (params.get('device')) utm.device = params.get('device') || ''

    setUtmParams(utm)

    // Fire Google Ads page view event (with safety check)
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_title: `Landing - ${campaignId}`,
        page_location: window.location.href,
        page_path: window.location.pathname,
        campaign_id: campaignId,
        variant: variant
      })
    }
  }, [campaignId, variant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Phone validation
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid phone number')
      }

      // Zip validation
      if (!/^\d{5}/.test(formData.zipCode)) {
        throw new Error('Please enter a valid ZIP code')
      }

      const response = await fetch('/api/leads/quick-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...utmParams,
          source: 'google-ads',
          campaign: campaignId,
          variant: variant,
          urgency: 'high' // Google Ads leads are typically urgent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      // Track conversion in Google Ads (with safety check)
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        try {
          (window as any).gtag('event', 'conversion', {
            send_to: 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with your conversion ID
            value: data.estimatedPrice?.min || 275,
            currency: 'USD',
            transaction_id: data.quoteId
          })

          // Also track for Google Analytics 4
          (window as any).gtag('event', 'generate_lead', {
            currency: 'USD',
            value: data.estimatedPrice?.min || 275,
            lead_id: data.quoteId,
            campaign_id: campaignId
          })
        } catch (gtagError) {
          console.log('Google tracking not configured yet:', gtagError)
        }
      }

      // Facebook Pixel tracking (if you use it)
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        try {
          (window as any).fbq('track', 'Lead', {
            value: data.estimatedPrice?.min || 275,
            currency: 'USD',
            lead_id: data.quoteId
          })
        } catch (fbqError) {
          console.log('Facebook tracking not configured yet:', fbqError)
        }
      }

      setSuccess(true)

      // Redirect to thank you page after 2 seconds
      setTimeout(() => {
        window.location.href = `/thank-you?id=${data.quoteId}&price=${data.estimatedPrice?.min}`
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
        <p className="text-gray-600 mb-4">Your free quote is ready</p>
        <div className="animate-pulse text-sm text-gray-500">Redirecting...</div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-2xl ${variant === 'B' ? 'border-4 border-green-500' : ''}`}>
      {variant === 'B' && (
        <div className="bg-green-500 text-white text-center py-2 px-4 rounded-t-xl">
          <p className="font-semibold">🔥 Limited Time: 20% OFF Today Only!</p>
        </div>
      )}

      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {headline}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {subheadline}
        </p>

        {urgencyMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-center">
            <p className="text-sm font-medium text-yellow-800">{urgencyMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                required
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="sr-only">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                required
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="sr-only">ZIP Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="zipCode"
                required
                maxLength={5}
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>

          {variant === 'B' && (
            <div>
              <label htmlFor="email" className="sr-only">Email (Optional)</label>
              <input
                type="email"
                id="email"
                className="block w-full px-3 py-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="Email (Optional - for quote details)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 border border-transparent rounded-lg text-white text-lg font-semibold transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Processing...' : buttonText}
          </button>
        </form>

        {trustBadges && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                Free Quote
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                No Obligation
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                Same Day Service
              </span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Your information is secure and never shared
            </p>
          </div>
        )}
      </div>
    </div>
  )
}