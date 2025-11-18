'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react'

export default function ProviderRegister() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'processing' | 'payment'>('form')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Business Info
    businessName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',

    // Service Areas (comma-separated ZIP codes)
    serviceAreas: '',

    // Contact Person
    firstName: '',
    lastName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('processing')

    try {
      // Parse service areas from comma-separated string
      const zipCodes = formData.serviceAreas
        .split(',')
        .map(zip => zip.trim())
        .filter(zip => zip.length === 5)

      if (zipCodes.length === 0) {
        setError('Please enter at least one valid 5-digit ZIP code')
        setStep('form')
        return
      }

      const response = await fetch('/api/provider/register-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          businessAddress: formData.businessAddress,
          firstName: formData.firstName,
          lastName: formData.lastName,
          serviceAreas: zipCodes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        setStep('payment')
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('form')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Our Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Start receiving qualified junk removal leads in your area
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Provider Plan</h3>
              <p className="text-gray-600">One-time activation fee</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">$99</div>
              <div className="text-sm text-gray-500">then pay per lead</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Unlimited lead access in your service areas</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Real-time lead notifications</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Track lead status and conversions</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>No monthly fees - only pay when you win jobs</span>
            </div>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Business Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Acme Junk Removal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="contact@acmejunk.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <input
                      type="text"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Service Areas
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Codes (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="94102, 94103, 94104"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the ZIP codes where you provide service, separated by commas
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Continue to Payment ($99)
              </button>

              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Creating your account...</p>
            </div>
          )}

          {step === 'payment' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to secure payment...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
