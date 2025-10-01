'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  DollarSign,
  Target,
  TrendingDown,
  Save,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

interface ProviderSettingsProps {
  providerId: string
  currentSettings?: {
    autoBidEnabled: boolean
    bidStrategy: string | null
    bidPercentage: number | null
    bidFixedAmount: number | null
    maxJobsPerDay: number
    minJobValue: number | null
    maxJobValue: number | null
  }
  onSave?: () => void
}

export default function ProviderSettings({
  providerId,
  currentSettings,
  onSave
}: ProviderSettingsProps) {
  const [autoBidEnabled, setAutoBidEnabled] = useState(
    currentSettings?.autoBidEnabled ?? false
  )
  const [bidStrategy, setBidStrategy] = useState<'PERCENTAGE_BELOW' | 'FIXED_AMOUNT'>(
    (currentSettings?.bidStrategy as 'PERCENTAGE_BELOW' | 'FIXED_AMOUNT') || 'PERCENTAGE_BELOW'
  )
  const [bidPercentage, setBidPercentage] = useState(
    currentSettings?.bidPercentage ?? 15
  )
  const [bidFixedAmount, setBidFixedAmount] = useState(
    currentSettings?.bidFixedAmount ?? 200
  )
  const [maxJobsPerDay, setMaxJobsPerDay] = useState(
    currentSettings?.maxJobsPerDay ?? 5
  )
  const [minJobValue, setMinJobValue] = useState(
    currentSettings?.minJobValue ?? null
  )
  const [maxJobValue, setMaxJobValue] = useState(
    currentSettings?.maxJobValue ?? null
  )

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/provider/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          autoBidEnabled,
          bidStrategy,
          bidPercentage: bidStrategy === 'PERCENTAGE_BELOW' ? bidPercentage : null,
          bidFixedAmount: bidStrategy === 'FIXED_AMOUNT' ? bidFixedAmount : null,
          maxJobsPerDay,
          minJobValue: minJobValue || null,
          maxJobValue: maxJobValue || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onSave?.()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">Auto-Bid Settings</h2>
      </div>

      {/* Enable/Disable */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoBidEnabled}
            onChange={(e) => setAutoBidEnabled(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <div>
            <p className="font-medium text-gray-900">Enable Auto-Bidding</p>
            <p className="text-sm text-gray-600 mt-1">
              Automatically bid on new jobs in your service area based on your preset preferences.
              You'll be instantly assigned jobs when you have the best bid.
            </p>
          </div>
        </label>
      </div>

      {autoBidEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* Bid Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bid Strategy
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bidStrategy === 'PERCENTAGE_BELOW'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="bidStrategy"
                  checked={bidStrategy === 'PERCENTAGE_BELOW'}
                  onChange={() => setBidStrategy('PERCENTAGE_BELOW')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-gray-900">Percentage Below</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bid X% below the estimated price
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bidStrategy === 'FIXED_AMOUNT'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="bidStrategy"
                  checked={bidStrategy === 'FIXED_AMOUNT'}
                  onChange={() => setBidStrategy('FIXED_AMOUNT')}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-gray-900">Fixed Amount</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Bid a fixed price regardless of estimate
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Bid Amount */}
          {bidStrategy === 'PERCENTAGE_BELOW' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Percentage Below Estimate
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={bidPercentage}
                  onChange={(e) => setBidPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="w-20 text-right">
                  <span className="text-2xl font-bold text-green-600">{bidPercentage}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Example: If estimate is $200, you'll bid ${Math.round(200 * (1 - bidPercentage / 100))}
              </p>
            </div>
          )}

          {bidStrategy === 'FIXED_AMOUNT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Bid Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={bidFixedAmount}
                  onChange={(e) => setBidFixedAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You'll bid this amount on every job in your service area
              </p>
            </div>
          )}

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Jobs Per Day
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxJobsPerDay}
              onChange={(e) => setMaxJobsPerDay(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-2">
              Auto-bidding stops when you reach this daily limit
            </p>
          </div>

          {/* Job Value Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Job Value (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={minJobValue || ''}
                  onChange={(e) => setMinJobValue(e.target.value ? Number(e.target.value) : null)}
                  placeholder="No minimum"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Job Value (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={maxJobValue || ''}
                  onChange={(e) => setMaxJobValue(e.target.value ? Number(e.target.value) : null)}
                  placeholder="No maximum"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">How Auto-Bidding Works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>New jobs in your service area trigger automatic bidding</li>
                <li>System compares all eligible providers' bids</li>
                <li>Lowest bid wins and gets instantly assigned</li>
                <li>You receive notification with customer details</li>
                <li>Contact customer to confirm and schedule</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">Settings saved successfully!</p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
