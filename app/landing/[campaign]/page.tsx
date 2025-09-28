import QuickLeadForm from '@/components/QuickLeadForm'
import { Metadata } from 'next'

interface PageProps {
  params: {
    campaign: string
  }
  searchParams: {
    variant?: 'A' | 'B'
    headline?: string
    subheadline?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaignTitle = params.campaign
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${campaignTitle} - Free Junk Removal Quote | Get 20% Off Today`,
    description: 'Same-day junk removal service. Get your free quote in 30 seconds. Licensed, insured, and eco-friendly. Call now for 20% off your first service!',
    openGraph: {
      title: `${campaignTitle} - Free Junk Removal Quote`,
      description: 'Same-day junk removal service. Get your free quote now!',
      type: 'website',
    },
  }
}

export default function CampaignLandingPage({ params, searchParams }: PageProps) {
  const variant = searchParams.variant || 'A'

  // Campaign-specific customizations
  const campaignConfig: Record<string, any> = {
    'residential': {
      headline: 'Clear Your Home Today - Free Quote!',
      subheadline: 'Professional home junk removal. Same-day service available.',
      urgencyMessage: '🏠 Homeowners save 20% this week only!'
    },
    'commercial': {
      headline: 'Commercial Junk Removal - Get Quote',
      subheadline: 'Fast, reliable service for businesses. Licensed & insured.',
      urgencyMessage: '💼 Business accounts get priority scheduling'
    },
    'estate-cleanout': {
      headline: 'Estate Cleanout Services - Free Estimate',
      subheadline: 'Compassionate, thorough estate clearing services.',
      urgencyMessage: '❤️ Special rates for estate cleanouts'
    },
    'construction': {
      headline: 'Construction Debris Removal - Fast Quote',
      subheadline: 'Professional construction waste removal. Any size job.',
      urgencyMessage: '🏗️ Contractor discounts available'
    },
    'emergency': {
      headline: 'Emergency Junk Removal - Available Now',
      subheadline: '24/7 emergency service. We\'re ready when you need us.',
      urgencyMessage: '🚨 Emergency crews standing by - Call now!'
    },
    'default': {
      headline: searchParams.headline || 'Get Your Free Junk Removal Quote',
      subheadline: searchParams.subheadline || 'Fast, Reliable, Same-Day Service Available',
      urgencyMessage: '⚡ Limited time: 20% off your first service'
    }
  }

  const config = campaignConfig[params.campaign] || campaignConfig['default']

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          {/* Trust Bar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-8 text-sm text-gray-600">
              <span className="flex items-center">
                ⭐⭐⭐⭐⭐ 4.9/5 (2,847 reviews)
              </span>
              <span>✓ Licensed & Insured</span>
              <span>✓ Same Day Service</span>
              <span>✓ Eco-Friendly</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Benefits */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {config.headline}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {config.subheadline}
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Free, No-Obligation Quote</h3>
                    <p className="text-gray-600">Get your price in 30 seconds, no strings attached</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Same-Day Service Available</h3>
                    <p className="text-gray-600">Need it gone today? We\'ve got you covered</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">All-Inclusive Pricing</h3>
                    <p className="text-gray-600">No hidden fees - labor, disposal, everything included</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Eco-Friendly Disposal</h3>
                    <p className="text-gray-600">We recycle and donate whenever possible</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">+2,843 happy customers this month</span>
                </div>
                <p className="text-gray-700 italic">
                  "Fantastic service! They arrived on time, worked efficiently, and the price was exactly as quoted. Highly recommend!"
                </p>
                <p className="text-sm text-gray-500 mt-2">- Sarah M., verified customer</p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:pl-8">
              <QuickLeadForm
                headline={config.headline}
                subheadline={config.subheadline}
                buttonText="Get My Free Quote →"
                urgencyMessage={config.urgencyMessage}
                trustBadges={true}
                campaignId={params.campaign}
                variant={variant}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold mb-1">Licensed & Insured</h3>
              <p className="text-sm text-gray-600">Fully licensed and insured for your protection</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Fast Service</h3>
              <p className="text-sm text-gray-600">Same-day and next-day appointments available</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Fair Pricing</h3>
              <p className="text-sm text-gray-600">Upfront pricing with no hidden fees</p>
            </div>
            <div>
              <div className="text-3xl mb-2">♻️</div>
              <h3 className="font-semibold mb-1">Eco-Friendly</h3>
              <p className="text-sm text-gray-600">We recycle and donate up to 60% of items</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Common Questions</h2>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How quickly can you come?</h3>
              <p className="text-gray-600">We offer same-day service for urgent needs and typically schedule within 24-48 hours.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">What items do you take?</h3>
              <p className="text-gray-600">We remove furniture, appliances, electronics, yard waste, construction debris, and most household items. We cannot take hazardous materials.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">How is pricing determined?</h3>
              <p className="text-gray-600">Pricing is based on the volume of items and the labor required. You\'ll get an exact quote before we start any work.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do I need to be present?</h3>
              <p className="text-gray-600">Not necessarily. We can arrange for pickup if items are accessible and you provide clear instructions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 Junk Removal Service. All rights reserved. | Licensed & Insured</p>
          <p className="text-xs text-gray-400 mt-2">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a> |
            <a href="/terms" className="hover:text-white ml-2">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  )
}