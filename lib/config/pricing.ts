export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 99,
    annualPrice: 950, // ~20% discount
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    features: {
      maxQuotesPerMonth: 100,
      maxProvidersPerCompany: 5,
      hasBookingFeature: false,
      hasAnalytics: false,
      hasCustomDomain: false,
      hasAPIAccess: false,
      hasPrioritySupport: false,
    },
    description: 'Perfect for small operations getting started',
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 297,
    annualPrice: 2850, // ~20% discount
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    features: {
      maxQuotesPerMonth: 500,
      maxProvidersPerCompany: 20,
      hasBookingFeature: true,
      hasAnalytics: true,
      hasCustomDomain: true,
      hasAPIAccess: false,
      hasPrioritySupport: true,
    },
    description: 'For growing businesses with multiple providers',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 999,
    annualPrice: 9590, // ~20% discount
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
    features: {
      maxQuotesPerMonth: -1, // Unlimited
      maxProvidersPerCompany: -1, // Unlimited
      hasBookingFeature: true,
      hasAnalytics: true,
      hasCustomDomain: true,
      hasAPIAccess: true,
      hasPrioritySupport: true,
    },
    description: 'For large operations with custom needs',
  },
} as const

export type PlanName = keyof typeof SUBSCRIPTION_PLANS
export type PlanFeatures = typeof SUBSCRIPTION_PLANS[PlanName]['features']

export function getPlanFeatures(plan: PlanName): PlanFeatures {
  return SUBSCRIPTION_PLANS[plan].features
}

export function canCompanyPerformAction(
  plan: PlanName,
  currentQuotesThisMonth: number,
  currentProviders: number
): {
  canAddQuote: boolean
  canAddProvider: boolean
  quotesRemaining: number
} {
  const features = getPlanFeatures(plan)

  const canAddQuote =
    features.maxQuotesPerMonth === -1 ||
    currentQuotesThisMonth < features.maxQuotesPerMonth

  const canAddProvider =
    features.maxProvidersPerCompany === -1 ||
    currentProviders < features.maxProvidersPerCompany

  const quotesRemaining =
    features.maxQuotesPerMonth === -1
      ? -1
      : Math.max(0, features.maxQuotesPerMonth - currentQuotesThisMonth)

  return {
    canAddQuote,
    canAddProvider,
    quotesRemaining,
  }
}
