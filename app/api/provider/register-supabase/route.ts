import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe (you'll need to add STRIPE_SECRET_KEY to .env)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null

const ACTIVATION_FEE = 9900 // $99.00 in cents

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const {
      businessName,
      email,
      phone,
      businessAddress,
      firstName,
      lastName,
      serviceAreas, // Array of ZIP codes
      companyId // Optional: can be passed from client or detected from headers
    } = body

    // Get company context from headers (set by middleware)
    const companyIdFromHeaders = request.headers.get('x-company-id')
    const finalCompanyId = companyId || companyIdFromHeaders || null

    // Validation
    if (!businessName || !email || !phone || !serviceAreas || serviceAreas.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If registering on a company-specific domain, verify company exists
    if (finalCompanyId) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, is_active')
        .eq('id', finalCompanyId)
        .single()

      if (companyError || !company || !company.is_active) {
        return NextResponse.json(
          { error: 'Company not found or inactive' },
          { status: 400 }
        )
      }
    }

    // Check if provider already exists with this email
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('id')
      .eq('contact_email', email)
      .single()

    if (existingProvider) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Create auth user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-12), // Temp password
      options: {
        data: {
          role: 'provider',
          name: `${firstName || ''} ${lastName || ''}`.trim(),
          phone
        }
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Create provider record
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert({
        auth_user_id: authData.user?.id,
        company_id: finalCompanyId,
        company_name: businessName,
        contact_name: `${firstName || ''} ${lastName || ''}`.trim(),
        contact_email: email,
        contact_phone: phone,
        service_address: businessAddress || null,
        is_active: !stripe, // Auto-activate if no Stripe (test mode)
        credits_balance: 10, // Give some initial credits
        monthly_lead_limit: 50,
        service_areas: serviceAreas, // Store as JSON array
        metadata: {
          source: finalCompanyId ? 'white_label' : 'direct',
          registrationDate: new Date().toISOString(),
          serviceZips: serviceAreas
        }
      })
      .select()
      .single()

    if (providerError) {
      console.error('Provider creation error:', providerError)
      // Try to clean up auth user if provider creation failed
      await supabase.auth.admin.deleteUser(authData.user?.id || '')
      return NextResponse.json(
        { error: 'Failed to create provider account' },
        { status: 500 }
      )
    }

    // TEST MODE: If Stripe is not configured, skip payment for testing
    if (!stripe) {
      console.log('⚠️  TEST MODE: Stripe not configured, skipping payment')
      console.log('✅ Provider registered (TEST MODE):', {
        email,
        businessName,
        providerId: provider.id
      })

      // Send verification email (Supabase handles this automatically)

      return NextResponse.json({
        success: true,
        providerId: provider.id,
        testMode: true,
        message: 'Account created in TEST MODE. Check your email for verification.'
      })
    }

    // PRODUCTION MODE: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Provider Activation Fee',
              description: `Activate your junk removal provider account for ${businessName}`,
            },
            unit_amount: ACTIVATION_FEE,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'http://localhost:3000'}/provider/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'http://localhost:3000'}/provider/register?canceled=true`,
      metadata: {
        providerId: provider.id,
        userId: authData.user?.id,
        email: email
      },
      customer_email: email,
    })

    console.log('✅ Provider registered:', {
      email,
      businessName,
      providerId: provider.id,
      checkoutSessionId: session.id
    })

    return NextResponse.json({
      success: true,
      providerId: provider.id,
      checkoutUrl: session.url,
      message: 'Account created. Redirecting to payment...'
    })

  } catch (error: any) {
    console.error('Provider registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register provider' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'