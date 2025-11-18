import { prisma } from './prisma'
import { SUBSCRIPTION_PLANS, getPlanFeatures } from './config/pricing'
import type { SubscriptionPlan } from '@prisma/client'

/**
 * Check if a company can create a new quote based on their plan
 */
export async function canCompanyCreateQuote(companyId: string): Promise<{
  allowed: boolean
  reason?: string
  quotesUsed?: number
  quotesLimit?: number
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      isActive: true,
    },
  })

  if (!company) {
    return { allowed: false, reason: 'Company not found' }
  }

  if (!company.isActive) {
    return { allowed: false, reason: 'Company is inactive' }
  }

  if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIALING') {
    return {
      allowed: false,
      reason: `Subscription is ${company.subscriptionStatus.toLowerCase()}. Please update payment.`,
    }
  }

  const features = getPlanFeatures(company.subscriptionPlan)

  // Unlimited quotes
  if (features.maxQuotesPerMonth === -1) {
    return { allowed: true }
  }

  // Check monthly usage
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const quotesThisMonth = await prisma.quote.count({
    where: {
      companyId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  })

  if (quotesThisMonth >= features.maxQuotesPerMonth) {
    return {
      allowed: false,
      reason: `Monthly quote limit reached (${features.maxQuotesPerMonth}). Upgrade your plan for more.`,
      quotesUsed: quotesThisMonth,
      quotesLimit: features.maxQuotesPerMonth,
    }
  }

  return {
    allowed: true,
    quotesUsed: quotesThisMonth,
    quotesLimit: features.maxQuotesPerMonth,
  }
}

/**
 * Check if a company can add a new provider based on their plan
 */
export async function canCompanyAddProvider(companyId: string): Promise<{
  allowed: boolean
  reason?: string
  providersUsed?: number
  providersLimit?: number
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      isActive: true,
      _count: {
        select: {
          providers: true,
        },
      },
    },
  })

  if (!company) {
    return { allowed: false, reason: 'Company not found' }
  }

  if (!company.isActive) {
    return { allowed: false, reason: 'Company is inactive' }
  }

  if (company.subscriptionStatus !== 'ACTIVE' && company.subscriptionStatus !== 'TRIALING') {
    return {
      allowed: false,
      reason: `Subscription is ${company.subscriptionStatus.toLowerCase()}. Please update payment.`,
    }
  }

  const features = getPlanFeatures(company.subscriptionPlan)

  // Unlimited providers
  if (features.maxProvidersPerCompany === -1) {
    return { allowed: true }
  }

  if (company._count.providers >= features.maxProvidersPerCompany) {
    return {
      allowed: false,
      reason: `Provider limit reached (${features.maxProvidersPerCompany}). Upgrade your plan for more.`,
      providersUsed: company._count.providers,
      providersLimit: features.maxProvidersPerCompany,
    }
  }

  return {
    allowed: true,
    providersUsed: company._count.providers,
    providersLimit: features.maxProvidersPerCompany,
  }
}

/**
 * Check if a company has access to a specific feature
 */
export async function companyHasFeature(
  companyId: string,
  feature: keyof typeof SUBSCRIPTION_PLANS['STARTER']['features']
): Promise<boolean> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      subscriptionPlan: true,
      isActive: true,
    },
  })

  if (!company || !company.isActive) {
    return false
  }

  const features = getPlanFeatures(company.subscriptionPlan)
  return !!features[feature]
}
