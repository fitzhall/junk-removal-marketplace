import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    console.error('❌ Stripe not configured')
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('💳 Checkout session completed:', session.id)
        console.log('   Metadata:', session.metadata)

        if (session.metadata?.providerId) {
          // Activate the provider
          const provider = await prisma.provider.update({
            where: { id: session.metadata.providerId },
            data: {
              status: 'ACTIVE'
            }
          })

          console.log('✅ Provider activated:', {
            providerId: provider.id,
            businessName: provider.businessName,
            email: session.metadata.email
          })

          // TODO: Send welcome email with login credentials
          console.log(`📧 Send welcome email to ${session.metadata.email}`)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('⏰ Checkout session expired:', session.id)

        if (session.metadata?.providerId) {
          // Optionally delete the pending provider or mark as expired
          console.log(`   Provider ${session.metadata.providerId} payment expired`)
        }

        break
      }

      // Company subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        console.log(`📋 Subscription ${event.type}:`, subscription.id)

        const companyId = subscription.metadata?.companyId
        const plan = subscription.metadata?.plan

        if (companyId && plan) {
          await prisma.company.update({
            where: { id: companyId },
            data: {
              subscriptionId: subscription.id,
              subscriptionPlan: plan as any,
              subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : subscription.status === 'past_due' ? 'PAST_DUE' : 'TRIALING',
              activationPaidAt: subscription.status === 'active' ? new Date() : undefined,
            }
          })

          console.log(`✅ Company ${companyId} subscription updated to ${plan}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        console.log('🗑️ Subscription deleted:', subscription.id)

        const companyId = subscription.metadata?.companyId

        if (companyId) {
          await prisma.company.update({
            where: { id: companyId },
            data: {
              subscriptionStatus: 'CANCELLED',
              isActive: false,
            }
          })

          console.log(`❌ Company ${companyId} subscription cancelled`)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        console.log('💰 Payment succeeded for invoice:', invoice.id)

        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const companyId = subscription.metadata?.companyId

          if (companyId) {
            await prisma.company.update({
              where: { id: companyId },
              data: {
                subscriptionStatus: 'ACTIVE',
              }
            })

            console.log(`✅ Company ${companyId} payment succeeded`)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        console.log('❌ Payment failed for invoice:', invoice.id)

        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
          const companyId = subscription.metadata?.companyId

          if (companyId) {
            await prisma.company.update({
              where: { id: companyId },
              data: {
                subscriptionStatus: 'PAST_DUE',
              }
            })

            console.log(`⚠️ Company ${companyId} payment failed - marked as PAST_DUE`)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
