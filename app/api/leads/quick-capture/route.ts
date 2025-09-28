import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadService } from '@/lib/lead-service'
import { VolumeSize } from '@prisma/client'

interface QuickLeadData {
  name: string
  phone: string
  email?: string
  zipCode: string
  city?: string
  state?: string
  description?: string
  urgency?: 'high' | 'medium' | 'low'
  source?: string
  campaign?: string
  adGroup?: string
  keyword?: string
  device?: string
  gclid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: QuickLeadData = await request.json()

    // Validate required fields
    if (!data.name || !data.phone || !data.zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, zipCode' },
        { status: 400 }
      )
    }

    // Phone number validation and formatting
    const cleanPhone = data.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Create a quick quote/lead in the database
    const quote = await prisma.quote.create({
      data: {
        status: 'PENDING',
        customerName: data.name,
        customerPhone: cleanPhone,
        customerEmail: data.email || null,
        pickupZip: data.zipCode,
        pickupCity: data.city || null,
        pickupState: data.state || null,

        // Default values for quick capture
        estimatedVolume: VolumeSize.HALF,
        priceRangeMin: 150,
        priceRangeMax: 400,
        totalPrice: 275,

        // Track the source
        source: data.source || 'google-ads',
        utmParams: {
          source: data.utm_source || data.source || 'google-ads',
          medium: data.utm_medium || 'cpc',
          campaign: data.utm_campaign || data.campaign,
          content: data.utm_content || data.adGroup,
          term: data.utm_term || data.keyword,
          gclid: data.gclid,
          device: data.device,
        },

        // AI Analysis placeholder
        aiAnalysis: {
          summary: data.description || 'Quick lead from Google Ads - needs follow up for details',
          items: [
            { name: 'General Junk', quantity: 1, category: 'pending-assessment' }
          ],
          requiresFollowUp: true,
          leadType: 'quick-capture'
        },

        isUrgent: data.urgency === 'high',

        // Set expiry for 14 days for quick leads
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    })

    // Distribute to providers immediately
    try {
      await leadService.distributeLeadToProviders(quote.id)
    } catch (distError) {
      console.error('Failed to distribute lead:', distError)
      // Don't fail the request if distribution fails
    }

    // Track conversion event (you'll need to add your Google Ads conversion ID)
    const conversionData = {
      quoteId: quote.id,
      value: quote.totalPrice,
      currency: 'USD',
      gclid: data.gclid,
      conversionTime: new Date().toISOString()
    }

    // Log for Google Ads offline conversion import if needed
    console.log('Google Ads Conversion:', conversionData)

    // Return success with quote ID for tracking
    return NextResponse.json({
      success: true,
      quoteId: quote.id,
      message: 'Lead captured successfully',
      estimatedPrice: {
        min: quote.priceRangeMin,
        max: quote.priceRangeMax
      }
    })

  } catch (error) {
    console.error('Error capturing quick lead:', error)
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/leads/quick-capture',
    method: 'POST',
    requiredFields: ['name', 'phone', 'zipCode'],
    optionalFields: [
      'email', 'city', 'state', 'description', 'urgency',
      'source', 'campaign', 'adGroup', 'keyword', 'device', 'gclid',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'
    ]
  })
}