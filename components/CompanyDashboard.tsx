'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Company {
  id: string
  slug: string
  businessName: string
  logoUrl: string | null
  primaryColor: string
  subscriptionStatus: string
}

interface Quote {
  id: string
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  pickupAddress: string | null
  pickupCity: string | null
  pickupState: string | null
  pickupZip: string | null
  estimatedVolume: string | null
  priceRangeMin: number | null
  priceRangeMax: number | null
  photoUrls: any
  createdAt: Date
  status: string
  items: Array<{
    id: string
    itemType: string
    quantity: number
  }>
}

interface CompanyDashboardProps {
  company: Company
  quotes: Quote[]
}

export default function CompanyDashboard({ company, quotes }: CompanyDashboardProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredQuotes = quotes.filter(q =>
    q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerPhone?.includes(searchTerm) ||
    q.pickupZip?.includes(searchTerm)
  )

  const truckLoadLabels: Record<string, string> = {
    QUARTER: '1/4 Truck',
    HALF: '1/2 Truck',
    THREE_QUARTER: '3/4 Truck',
    FULL: 'Full Truck',
    MULTIPLE: 'Multiple Trucks'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.businessName} className="h-10" />
              ) : (
                <h1 className="text-2xl font-bold" style={{ color: company.primaryColor }}>
                  {company.businessName}
                </h1>
              )}
              <span className="text-sm text-gray-500">Lead Dashboard</span>
            </div>
            <a
              href={`/quote/${company.slug}`}
              target="_blank"
              className="text-sm text-blue-600 hover:underline"
            >
              View Widget →
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Total Leads</div>
            <div className="text-3xl font-bold">{quotes.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">This Week</div>
            <div className="text-3xl font-bold">
              {quotes.filter(q => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(q.createdAt) > weekAgo
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Today</div>
            <div className="text-3xl font-bold">
              {quotes.filter(q => {
                const today = new Date()
                const qDate = new Date(q.createdAt)
                return qDate.toDateString() === today.toDateString()
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Avg Quote Value</div>
            <div className="text-3xl font-bold">
              ${Math.round(quotes.reduce((sum, q) => sum + ((q.priceRangeMin || 0) + (q.priceRangeMax || 0)) / 2, 0) / quotes.length || 0)}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <input
            type="text"
            placeholder="Search by name, phone, or ZIP code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No leads match your search' : 'No leads yet. Share your widget to start receiving leads!'}
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{quote.customerName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{quote.customerPhone}</div>
                      {quote.customerEmail && (
                        <div className="text-sm text-gray-400">{quote.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quote.pickupCity && quote.pickupState ? (
                        <>{quote.pickupCity}, {quote.pickupState}</>
                      ) : (
                        quote.pickupZip || '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {truckLoadLabels[quote.estimatedVolume || 'HALF'] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${quote.priceRangeMin} - ${quote.priceRangeMax}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Lead Details</h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div><span className="font-medium">Name:</span> {selectedQuote.customerName}</div>
                  <div>
                    <span className="font-medium">Phone:</span>{' '}
                    <a href={`tel:${selectedQuote.customerPhone}`} className="text-blue-600 hover:underline">
                      {selectedQuote.customerPhone}
                    </a>
                  </div>
                  {selectedQuote.customerEmail && (
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${selectedQuote.customerEmail}`} className="text-blue-600 hover:underline">
                        {selectedQuote.customerEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Quote Details</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      {truckLoadLabels[selectedQuote.estimatedVolume || 'HALF']}
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${selectedQuote.priceRangeMin} - ${selectedQuote.priceRangeMax}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedQuote.pickupAddress && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Pickup Location</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div>{selectedQuote.pickupAddress}</div>
                    <div>{selectedQuote.pickupCity}, {selectedQuote.pickupState} {selectedQuote.pickupZip}</div>
                  </div>
                </div>
              )}

              {/* Items */}
              {selectedQuote.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {selectedQuote.items.map((item) => (
                        <li key={item.id}>
                          <span className="font-medium">{item.itemType}</span> × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedQuote.photoUrls && Array.isArray(selectedQuote.photoUrls) && selectedQuote.photoUrls.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedQuote.photoUrls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedQuote.customerPhone}`}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-center font-medium hover:bg-blue-700"
                >
                  📞 Call Customer
                </a>
                {selectedQuote.customerEmail && (
                  <a
                    href={`mailto:${selectedQuote.customerEmail}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg text-center font-medium hover:bg-gray-200"
                  >
                    ✉️ Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
