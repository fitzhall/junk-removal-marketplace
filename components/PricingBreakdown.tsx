'use client'

import { motion } from 'framer-motion'
import {
  TruckIcon,
  ClockIcon,
  TrashIcon,
  MapPinIcon,
  ScaleIcon,
  CubeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface PricingBreakdownProps {
  breakdown?: {
    laborCost: number
    disposalCost: number
    fuelSurcharge: number
    totalVolume: string
    totalWeight: number
    laborHours: string
    locationMultiplier: number
  }
  truckLoads?: string
  showDetails?: boolean
}

export default function PricingBreakdown({ breakdown, truckLoads, showDetails = true }: PricingBreakdownProps) {
  if (!breakdown || !showDetails) return null

  const getTruckLoadDisplay = (loads: string) => {
    const loadMap: Record<string, string> = {
      'QUARTER': '¼ Truck',
      'HALF': '½ Truck',
      'THREE_QUARTER': '¾ Truck',
      'FULL': 'Full Truck',
    }

    if (loads.includes('_TRUCKS')) {
      const num = loads.split('_')[0]
      return `${num} Trucks`
    }

    return loadMap[loads] || loads
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">AI-Powered Pricing Breakdown</h3>
      </div>

      <div className="space-y-3">
        {/* Volume & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
            <CubeIcon className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Total Volume</p>
              <p className="font-semibold">{breakdown.totalVolume} yd³</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
            <ScaleIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Est. Weight</p>
              <p className="font-semibold">{breakdown.totalWeight} lbs</p>
            </div>
          </div>
        </div>

        {/* Truck Load */}
        {truckLoads && (
          <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
            <TruckIcon className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Truck Space Needed</p>
              <p className="font-semibold">{getTruckLoadDisplay(truckLoads)}</p>
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">Labor ({breakdown.laborHours} hrs)</span>
            </div>
            <span className="font-medium">${breakdown.laborCost}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <TrashIcon className="w-4 h-4" />
              <span className="text-sm">Disposal & Recycling</span>
            </div>
            <span className="font-medium">${breakdown.disposalCost}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm">Fuel & Transport</span>
            </div>
            <span className="font-medium">${breakdown.fuelSurcharge}</span>
          </div>

          {breakdown.locationMultiplier > 1 && (
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Location adjustment</span>
              <span>×{breakdown.locationMultiplier.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* AI Confidence Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-800">
            <strong>AI Estimate:</strong> Final price confirmed after on-site inspection.
            Estimates based on detected items and typical dimensions.
          </p>
        </div>
      </div>
    </motion.div>
  )
}