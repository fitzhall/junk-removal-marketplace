import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/config/pricing'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null

// POST /api/company/subscription - Create or update subscription
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, plan, billingCycle } = body // billingCycle: 'monthly' | 'annual'

    if (!companyId || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get plan details
    const planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
    const priceId =
      billingCycle === 'annual'
        ? planDetails.stripePriceIdAnnual
        : planDetails.stripePriceIdMonthly

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for this plan' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/company/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/company/billing?canceled=true`,
      metadata: {
        companyId,
        plan,
        billingCycle,
      },
      customer_email: company.contactEmail,
      subscription_data: {
        metadata: {
          companyId,
          plan,
        },
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// GET /api/company/subscription - Get current subscription info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing company ID' },
        { status: 400 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionId: true,
        monthlyFee: true,
        trialEndsAt: true,
        _count: {
          select: {
            quotes: true,
            providers: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get current month's quote count
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

    const planFeatures = SUBSCRIPTION_PLANS[company.subscriptionPlan].features

    return NextResponse.json({
      plan: company.subscriptionPlan,
      status: company.subscriptionStatus,
      monthlyFee: company.monthlyFee,
      trialEndsAt: company.trialEndsAt,
      usage: {
        quotesThisMonth,
        maxQuotesPerMonth: planFeatures.maxQuotesPerMonth,
        totalProviders: company._count.providers,
        maxProviders: planFeatures.maxProvidersPerCompany,
      },
      features: planFeatures,
    })
  } catch (error: any) {
    console.error('Error getting subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/company/subscription - Cancel subscription
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing company ID' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionId: true },
    })

    if (!company || !company.subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(company.subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update company status
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: 'CANCELLED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    })
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
