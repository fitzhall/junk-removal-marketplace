'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>
            <a href="/provider" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subscription & Billing */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6" />
                  Subscription & Credits
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentPlan} Plan
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{creditsRemaining}</p>
                  <p className="text-sm text-gray-600">Credits Remaining</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{creditsUsed}</p>
                  <p className="text-sm text-gray-600">Used This Month</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">72%</p>
                  <p className="text-sm text-gray-600">Win Rate</p>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Lead Credits Usage
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.round((creditsUsed / (currentPlanData?.credits || 25)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{ width: `${(creditsUsed / (currentPlanData?.credits || 25)) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Additional leads: <span className="font-semibold">${currentPlan === 'Basic' ? 25 : currentPlan === 'Elite' ? 15 : 20}</span> each after credits are used
              </p>
            </div>

            {/* Subscription Plans */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Change Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <motion.div
                    key={plan.name}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-lg border-2 p-6 cursor-pointer ${
                      currentPlan === plan.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentPlan(plan.name)}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">
                        Most Popular
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
                  </motion.div>
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