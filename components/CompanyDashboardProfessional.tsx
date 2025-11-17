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
      {/* Clean Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.businessName} className="h-12" />
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {company.businessName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Lead Management</p>
                </div>
              )}
            </div>
            <a
              href={`/quote/${company.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm border border-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Widget
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Industrial Stats - Clean & Bold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Leads</div>
              <div className="bg-gray-100 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{quotes.length}</div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">This Week</div>
              <div className="bg-gray-100 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {quotes.filter(q => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(q.createdAt) > weekAgo
              }).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Last 7 days</div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today</div>
              <div className="bg-gray-100 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {quotes.filter(q => {
                const today = new Date()
                const qDate = new Date(q.createdAt)
                return qDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">New leads</div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Value</div>
              <div className="bg-gray-100 rounded-lg p-2.5">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              ${Math.round(quotes.reduce((sum, q) => sum + ((q.priceRangeMin || 0) + (q.priceRangeMax || 0)) / 2, 0) / quotes.length || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Per quote</div>
          </div>
        </div>

        {/* Clean Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, phone, or ZIP code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Professional Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          {filteredQuotes.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchTerm ? 'No leads match your search' : 'No leads yet'}
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchTerm ? 'Try different search terms' : 'Share your widget to start receiving leads'}
              </p>
              {!searchTerm && (
                <a
                  href={`/quote/${company.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  View Widget
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Load Size</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price Range</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Received</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {(quote.customerName || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{quote.customerName || 'Unknown'}</div>
                            <div className="text-sm text-gray-600">{quote.customerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {quote.pickupCity && quote.pickupState ? (
                          <>{quote.pickupCity}, {quote.pickupState}</>
                        ) : (
                          quote.pickupZip || '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-900 border border-gray-300">
                          {truckLoadLabels[quote.estimatedVolume || 'HALF'] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          ${quote.priceRangeMin} - ${quote.priceRangeMax}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                        >
                          View
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Professional Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-300">
            {/* Clean Header */}
            <div className="bg-gray-900 p-6 border-b-2 border-gray-700">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">Lead Details</h2>
                  <p className="text-gray-400 text-sm mt-1">Complete customer information</p>
                </div>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="border-2 border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 font-semibold min-w-[70px] text-sm">Name:</span>
                    <span className="text-gray-900 font-bold">{selectedQuote.customerName}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 font-semibold min-w-[70px] text-sm">Phone:</span>
                    <a href={`tel:${selectedQuote.customerPhone}`} className="text-gray-900 font-bold hover:underline">
                      {selectedQuote.customerPhone}
                    </a>
                  </div>
                  {selectedQuote.customerEmail && (
                    <div className="flex items-start gap-3">
                      <span className="text-gray-600 font-semibold min-w-[70px] text-sm">Email:</span>
                      <a href={`mailto:${selectedQuote.customerEmail}`} className="text-gray-900 font-bold hover:underline">
                        {selectedQuote.customerEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Details */}
              <div className="border-2 border-gray-900 rounded-lg p-5 bg-gray-50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 mb-4">Quote Details</h3>
                <div className="text-center bg-white rounded-lg p-6 border-2 border-gray-200">
                  <div className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    {truckLoadLabels[selectedQuote.estimatedVolume || 'HALF']}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ${selectedQuote.priceRangeMin} - ${selectedQuote.priceRangeMax}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Price Range</div>
                </div>
              </div>

              {/* Location */}
              {selectedQuote.pickupAddress && (
                <div className="border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Pickup Location
                  </h3>
                  <div className="text-gray-900 font-medium">
                    <div>{selectedQuote.pickupAddress}</div>
                    <div>{selectedQuote.pickupCity}, {selectedQuote.pickupState} {selectedQuote.pickupZip}</div>
                  </div>
                </div>
              )}

              {/* Items */}
              {selectedQuote.items.length > 0 && (
                <div className="border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 mb-4">Items</h3>
                  <ul className="space-y-2">
                    {selectedQuote.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded border border-gray-200">
                        <span className="font-semibold text-gray-900">{item.itemType}</span>
                        <span className="text-gray-700 font-bold">×{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Photos */}
              {selectedQuote.photoUrls && Array.isArray(selectedQuote.photoUrls) && selectedQuote.photoUrls.length > 0 && (
                <div className="border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 mb-4">Photos</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedQuote.photoUrls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded border-2 border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <a
                  href={`tel:${selectedQuote.customerPhone}`}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-lg text-center font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 border-2 border-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Customer
                </a>
                {selectedQuote.customerEmail && (
                  <a
                    href={`mailto:${selectedQuote.customerEmail}`}
                    className="flex-1 bg-white text-gray-900 py-4 rounded-lg text-center font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-2 border-gray-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email
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
