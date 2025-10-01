'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react'

interface JobNotificationProps {
  jobId: string
  finalPrice: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  pickupAddress?: string
  pickupCity?: string
  pickupState?: string
  pickupZip?: string
  preferredDate?: string
  items: Array<{
    itemType: string
    quantity: number
  }>
  onViewDetails?: () => void
}

export default function JobNotification({
  jobId,
  finalPrice,
  customerName,
  customerEmail,
  customerPhone,
  pickupAddress,
  pickupCity,
  pickupState,
  pickupZip,
  preferredDate,
  items,
  onViewDetails
}: JobNotificationProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl border-2 border-green-500 p-6 max-w-2xl"
    >
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Job Assigned!</h2>
          <p className="text-sm text-gray-600">Job #{jobId.substring(0, 8)}</p>
        </div>
      </div>

      {/* Price Highlight */}
      <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Job Value</p>
              <p className="text-3xl font-bold text-green-600">${finalPrice}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Items</p>
            <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <p className="font-medium text-gray-900">Pickup Location</p>
            {pickupAddress && <p className="text-gray-700">{pickupAddress}</p>}
            <p className="text-gray-700">
              {pickupCity}, {pickupState} {pickupZip}
            </p>
          </div>
        </div>

        {/* Preferred Date */}
        {preferredDate && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">Preferred Date</p>
              <p className="text-gray-700">
                {new Date(preferredDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Customer Contact */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="font-medium text-gray-900 mb-3">Customer Contact</p>
          {customerName && (
            <p className="text-gray-700 font-medium">{customerName}</p>
          )}
          {customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a
                href={`tel:${customerPhone}`}
                className="text-green-600 hover:underline"
              >
                {customerPhone}
              </a>
            </div>
          )}
          {customerEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${customerEmail}`}
                className="text-green-600 hover:underline"
              >
                {customerEmail}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-gray-400" />
          <p className="font-medium text-gray-900">Items to Remove</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            >
              {item.quantity > 1 && `${item.quantity}x `}
              {item.itemType}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            View Full Details
          </button>
        )}
        <button
          onClick={() => window.location.href = `/provider/jobs/${jobId}`}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Go to Job Dashboard
        </button>
      </div>

      {/* Next Steps */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Contact customer to confirm details</li>
              <li>Schedule pickup time</li>
              <li>Prepare equipment and crew</li>
              <li>Update job status when complete</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
