'use client'

import { useState } from 'react'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

interface LeadCardProps {
  lead: any // TODO: Add proper typing
  onAccept: () => void
  onDecline: () => void
}

export default function LeadCard({ lead, onAccept, onDecline }: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const quote = lead.quote

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const response = await fetch(`/api/provider/leads/${lead.id}/accept`, {
        method: 'POST'
      })
      if (response.ok) {
        onAccept()
      }
    } catch (error) {
      console.error('Failed to accept lead:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      const response = await fetch(`/api/provider/leads/${lead.id}/decline`, {
        method: 'POST'
      })
      if (response.ok) {
        onDecline()
      }
    } catch (error) {
      console.error('Failed to decline lead:', error)
    } finally {
      setIsDeclining(false)
    }
  }

  const getStatusColor = () => {
    switch (lead.status) {
      case 'SENT': return 'bg-yellow-100 text-yellow-800'
      case 'VIEWED': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'DECLINED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {lead.status}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(lead.sentAt), { addSuffix: true })}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {quote.customerName || 'Anonymous Customer'}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${quote.priceRangeMin} - ${quote.priceRangeMax}
            </p>
            <p className="text-sm text-gray-600">Estimated value</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {quote.customerPhone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2" />
              {quote.customerPhone}
            </div>
          )}
          {quote.customerEmail && (
            <div className="flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              {quote.customerEmail}
            </div>
          )}
          {quote.pickupAddress && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {quote.pickupCity}, {quote.pickupState} {quote.pickupZip}
            </div>
          )}
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Items to Remove:</p>
          <div className="flex flex-wrap gap-2">
            {quote.items.slice(0, 3).map((item: any, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {item.quantity}x {item.itemType}
              </span>
            ))}
            {quote.items.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                +{quote.items.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {lead.status === 'SENT' || lead.status === 'VIEWED' ? (
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isAccepting ? 'Accepting...' : 'Accept Lead ($25)'}
            </button>
            <button
              onClick={handleDecline}
              disabled={isDeclining}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              {isDeclining ? 'Declining...' : 'Decline'}
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">
              {lead.status === 'ACCEPTED' ? 'You accepted this lead' : 'Lead declined'}
            </span>
          </div>
        )}

        {/* Expand for more details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? 'Show less' : 'Show more details'}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">All Items:</h4>
            <ul className="space-y-1">
              {quote.items.map((item: any, index: number) => (
                <li key={index} className="text-sm text-gray-600">
                  • {item.quantity}x {item.itemType}
                  {item.requiresSpecialHandling && (
                    <span className="ml-2 text-xs text-orange-600">(Special handling)</span>
                  )}
                </li>
              ))}
            </ul>

            {quote.preferredDate && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  <CalendarIcon className="inline h-4 w-4 mr-1" />
                  Preferred date: {new Date(quote.preferredDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {quote.isUrgent && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                  URGENT
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}