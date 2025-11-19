'use client'

import { useState } from 'react'
import QuoteForm from './QuoteForm'

interface Company {
  id: string
  slug: string
  businessName: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  contactPhone: string | null
}

interface WhiteLabelQuoteWidgetProps {
  company: Company
}

export default function WhiteLabelQuoteWidget({ company }: WhiteLabelQuoteWidgetProps) {
  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(to bottom right, ${company.primaryColor}10, ${company.secondaryColor}10)`
    }}>
      {/* Company Branding Header - Mobile Responsive */}
      <div className="bg-white shadow-sm py-3 sm:py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-3">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.businessName}
              className="h-8 sm:h-12 object-contain flex-shrink-0"
            />
          ) : (
            <h1
              className="text-lg sm:text-2xl font-bold truncate"
              style={{ color: company.primaryColor }}
            >
              {company.businessName}
            </h1>
          )}
          {company.contactPhone && (
            <a
              href={`tel:${company.contactPhone}`}
              className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: company.primaryColor,
                color: 'white'
              }}
            >
              <span className="hidden sm:inline">Call </span>📞
              <span className="hidden sm:inline ml-1">{company.contactPhone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Quote Form - Unified form for all users */}
      <div className="container mx-auto px-4 py-8">
        <QuoteForm
          companyId={company.id}
          companySlug={company.slug}
        />
      </div>
    </div>
  )
}
