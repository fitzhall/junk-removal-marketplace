import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import bcrypt from 'bcryptjs'

// Initialize Stripe (you'll need to add STRIPE_SECRET_KEY to .env)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null

const ACTIVATION_FEE = 9900 // $99.00 in cents

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      businessName,
      email,
      phone,
      businessAddress,
      firstName,
      lastName,
      serviceAreas // Array of ZIP codes
    } = body

    // Validation
    if (!businessName || !email || !phone || !serviceAreas || serviceAreas.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Generate a temporary password (user can change it later)
    const tempPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create User and Provider in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          hashedPassword,
          phone,
          name: `${firstName} ${lastName}`,
          role: 'PROVIDER'
        }
      })

      // Create provider with PENDING status
      const provider = await tx.provider.create({
        data: {
          userId: user.id,
          businessName,
          businessPhone: phone,
          businessAddress: businessAddress || null,
          status: 'PENDING', // Will be activated after payment
          maxJobsPerDay: 5,
          serviceAreas: {
            create: serviceAreas.map((zipCode: string, index: number) => ({
              zipCode,
              city: 'TBD', // Can update later
              state: 'TBD', // Can update later
              isPrimary: index === 0 // First ZIP is primary
            }))
          }
        }
      })

      return { user, provider }
    })

    // TEST MODE: If Stripe is not configured, skip payment for testing
    if (!stripe) {
      console.log('⚠️  TEST MODE: Stripe not configured, skipping payment')
      console.log('✅ Provider registered (TEST MODE):', {
        email,
        businessName,
        providerId: result.provider.id,
        tempPassword // Only log in test mode
      })

      return NextResponse.json({
        success: true,
        providerId: result.provider.id,
        testMode: true,
        tempPassword, // Return password in test mode
        message: 'Account created in TEST MODE (no payment required)'
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
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/provider/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/provider/register?canceled=true`,
      metadata: {
        providerId: result.provider.id,
        userId: result.user.id,
        email: email
      },
      customer_email: email,
    })

    console.log('✅ Provider registered:', {
      email,
      businessName,
      providerId: result.provider.id,
      checkoutSessionId: session.id
    })

    // TODO: Send email with temporary password
    console.log(`📧 Temporary password for ${email}: ${tempPassword}`)
    console.log('   (In production, send this via email)')

    return NextResponse.json({
      success: true,
      providerId: result.provider.id,
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
