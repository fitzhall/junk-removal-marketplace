'use client'

import { useState, useEffect } from 'react'
import {
  CreditCardIcon,
  MapPinIcon,
  BellIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const subscriptionPlans = [
  {
    name: 'Basic',
    price: 299,
    credits: 10,
    features: [
      '10 leads per month included',
      'Service area: 10 mile radius',
      'Standard support',
      'Lead response time: 1 hour',
      '$25 per additional lead'
    ],
    color: 'bg-gray-100',
    popular: false
  },
  {
    name: 'Professional',
    price: 599,
    credits: 25,
    features: [
      '25 leads per month included',
      'Service area: 25 mile radius',
      'Priority support',
      'Lead response time: 30 minutes',
      'Advanced analytics',
      '$20 per additional lead'
    ],
    color: 'bg-blue-100',
    popular: true
  },
  {
    name: 'Elite',
    price: 999,
    credits: 50,
    features: [
      '50 leads per month included',
      'Service area: Unlimited',
      'Dedicated account manager',
      'Instant lead notifications',
      'Custom reporting',
      'API access',
      '$15 per additional lead'
    ],
    color: 'bg-purple-100',
    popular: false
  }
]

const serviceAreas = [
  'San Francisco, CA',
  'Oakland, CA',
  'San Jose, CA',
  'Berkeley, CA',
  'Palo Alto, CA',
  'Fremont, CA',
  'Hayward, CA',
  'San Mateo, CA',
  'Redwood City, CA',
  'Mountain View, CA'
]

export default function ProviderSettings() {
  const [currentPlan, setCurrentPlan] = useState('Professional')
  const [selectedAreas, setSelectedAreas] = useState(['San Francisco, CA', 'Oakland, CA'])
  const [leadPreferences, setLeadPreferences] = useState({
    minJobValue: 200,
    maxJobValue: 5000,
    urgentOnly: false,
    commercialJobs: true,
    residentialJobs: true,
    sameDay: true,
    scheduled: true
  })
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false
  })
  const [bidSettings, setBidSettings] = useState({
    autoBid: false,
    maxBidAmount: 50,
    targetWinRate: 30
  })

  const currentPlanData = subscriptionPlans.find(p => p.name === currentPlan)
  const creditsUsed = 18
  const creditsRemaining = (currentPlanData?.credits || 25) - creditsUsed

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  // Get provider info (mock for now - should come from Supabase)
  const [providerId] = useState('provider-123')
  const [customDomain, setCustomDomain] = useState('')
  const [subdomain] = useState('acmejunk') // Would come from provider record
  const [platformDomain, setPlatformDomain] = useState('yoursite.com')

  // Use effect to get the hostname only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPlatformDomain(window.location.hostname)
    }
  }, [])

  const campaignUrl = `https://${subdomain}.${platformDomain}`
  const directUrl = `https://${platformDomain}?ref=${providerId}`

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">Settings</h1>
            <a href="/provider" className="text-sm text-gray-500 hover:text-gray-900">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subscription */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign URLs Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Campaign URLs</h2>

              {/* Subdomain URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your White-Label URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={campaignUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(campaignUrl)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this URL for Facebook and Google ads. Leads will go directly to you.
                </p>
              </div>

              {/* Direct Campaign URL */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Campaign URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={directUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(directUrl)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Backup URL if subdomain isn't working yet.
                </p>
              </div>

              {/* Custom Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="www.yourbusiness.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use your own domain. Point your DNS to our servers.
                </p>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Copy your white-label URL above</li>
                  <li>2. Use it as the landing page in your Facebook/Google campaigns</li>
                  <li>3. All leads from your campaigns will appear in your dashboard</li>
                  <li>4. For custom domains, add CNAME record pointing to {platformDomain}</li>
                </ol>
              </div>
            </div>

            {/* Tracking Pixels Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Tracking Pixels</h2>

              {/* Facebook Pixel */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="123456789012345"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Track conversions from Facebook ads
                </p>
              </div>

              {/* Google Analytics */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Track website analytics and conversions
                </p>
              </div>

              {/* Google Ads */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Ads Conversion ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="AW-XXXXXXXXX/XXXXXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Track Google Ads conversions
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">How it works:</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Pixels fire automatically when customers visit your white-label domain</li>
                  <li>• Lead submissions are tracked as conversions</li>
                  <li>• Data flows directly to your ad accounts for optimization</li>
                  <li>• No technical setup required - just add your IDs</li>
                </ul>
              </div>
            </div>

            {/* Current Plan */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Subscription</h2>
                <span className="text-sm font-medium text-gray-900">
                  {currentPlan} Plan
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-2xl font-medium">{creditsRemaining}</p>
                  <p className="text-sm text-gray-500">Credits left</p>
                </div>
                <div>
                  <p className="text-2xl font-medium">{creditsUsed}</p>
                  <p className="text-sm text-gray-500">Used</p>
                </div>
                <div>
                  <p className="text-2xl font-medium">72%</p>
                  <p className="text-sm text-gray-500">Win rate</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Credit usage</span>
                  <span>{Math.round((creditsUsed / (currentPlanData?.credits || 25)) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-gray-900 rounded-full transition-all"
                    style={{ width: `${(creditsUsed / (currentPlanData?.credits || 25)) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Additional leads: <span className="font-medium text-gray-900">${currentPlan === 'Basic' ? 25 : currentPlan === 'Elite' ? 15 : 20}</span> each
              </p>
            </div>

            {/* Plans */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6">Change Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative border rounded-lg p-4 cursor-pointer ${
                      currentPlan === plan.name
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentPlan(plan.name)}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-white text-xs font-medium">
                        Popular
                      </span>
                    )}

                    {currentPlan === plan.name && (
                      <CheckIcon className="absolute top-4 right-4 w-6 h-6 text-blue-600" />
                    )}

                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold mb-1">
                      ${plan.price}
                      <span className="text-sm text-gray-600 font-normal">/month</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">{plan.credits} leads included</p>

                    <ul className="space-y-2 text-sm">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6" />
                Service Areas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select the areas where you provide service. Leads will be distributed based on these locations.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedAreas.includes(area)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                + Add custom area
              </button>
            </div>

            {/* Lead Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Lead Preferences</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Value Range
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={leadPreferences.minJobValue}
                          onChange={(e) => setLeadPreferences({...leadPreferences, minJobValue: parseInt(e.target.value)})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <span className="text-xs text-gray-500">Minimum</span>
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={leadPreferences.maxJobValue}
                          onChange={(e) => setLeadPreferences({...leadPreferences, maxJobValue: parseInt(e.target.value)})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <span className="text-xs text-gray-500">Maximum</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Job Types
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={leadPreferences.residentialJobs}
                        onChange={(e) => setLeadPreferences({...leadPreferences, residentialJobs: e.target.checked})}
                        className="mr-3"
                      />
                      <span>Residential Jobs</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={leadPreferences.commercialJobs}
                        onChange={(e) => setLeadPreferences({...leadPreferences, commercialJobs: e.target.checked})}
                        className="mr-3"
                      />
                      <span>Commercial Jobs</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={leadPreferences.sameDay}
                        onChange={(e) => setLeadPreferences({...leadPreferences, sameDay: e.target.checked})}
                        className="mr-3"
                      />
                      <span>Same-Day Service</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={leadPreferences.urgentOnly}
                        onChange={(e) => setLeadPreferences({...leadPreferences, urgentOnly: e.target.checked})}
                        className="mr-3"
                      />
                      <span>Urgent Jobs Only (Higher conversion rate)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Auto-Bidding Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Smart Bidding
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Enable Auto-Bidding</span>
                  <input
                    type="checkbox"
                    checked={bidSettings.autoBid}
                    onChange={(e) => setBidSettings({...bidSettings, autoBid: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>

                {bidSettings.autoBid && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Bid Per Lead
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={bidSettings.maxBidAmount}
                          onChange={(e) => setBidSettings({...bidSettings, maxBidAmount: parseInt(e.target.value)})}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Win Rate
                      </label>
                      <select
                        value={bidSettings.targetWinRate}
                        onChange={(e) => setBidSettings({...bidSettings, targetWinRate: parseInt(e.target.value)})}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value={20}>20% - Lower cost</option>
                        <option value={30}>30% - Balanced</option>
                        <option value={50}>50% - More leads</option>
                        <option value={70}>70% - Maximum leads</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Lead Notifications
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Email notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>SMS notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Push notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Next billing date</span>
                  <span className="font-medium">Feb 1, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment method</span>
                  <span className="font-medium">•••• 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current balance</span>
                  <span className="font-medium text-green-600">$0.00</span>
                </div>
              </div>
              <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                Update Payment Method
              </button>
            </div>

            {/* Save Button */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
              Save All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}