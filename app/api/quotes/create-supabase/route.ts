import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VisionAIService } from '@/lib/google-vision-wrapper'
import { cloudinaryService } from '@/lib/cloudinary'
import { calculatePricing, validatePricing, getFallbackPricing } from '@/utils/pricing-engine'
import type { JobDetails } from '@/components/JobDetailsForm'

export async function POST(request: NextRequest) {
  console.log('Quote creation with white-label support')

  // Get company ID from middleware header (for white-label domains)
  const companyIdFromHeader = request.headers.get('x-company-id')
  const companyName = request.headers.get('x-company-name')

  console.log('White-label detection:', {
    companyId: companyIdFromHeader,
    companyName: companyName,
    domain: request.headers.get('host')
  })

  try {
    const supabase = await createClient()
    const formData = await request.formData()

    // Get photos
    const photos: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File) {
        photos.push(value)
      }
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No photos provided' },
        { status: 400 }
      )
    }

    // Upload photos to Cloudinary
    let uploadedPhotoUrls: string[] = []
    try {
      const photoBuffers = await Promise.all(
        photos.map(async (photo) => Buffer.from(await photo.arrayBuffer()))
      )
      const uploadResults = await cloudinaryService.uploadMultiple(photoBuffers, 'junk-removal/quotes')
      uploadedPhotoUrls = uploadResults.map(result => result.secure_url)
      console.log(`Uploaded ${uploadedPhotoUrls.length} photos`)
    } catch (err) {
      console.error('Photo upload failed:', err)
    }

    // Parse form data
    const locationRaw = formData.get('location') as string
    const customerRaw = formData.get('customer') as string || formData.get('customerInfo') as string
    const jobDetailsRaw = formData.get('jobDetails') as string

    console.log('Raw form data received:', {
      location: locationRaw,
      customer: customerRaw,
      jobDetails: jobDetailsRaw,
      photoCount: photos.length
    })

    const location = JSON.parse(locationRaw || '{}')
    const customerInfo = JSON.parse(customerRaw || '{}')
    const jobDetails: JobDetails = JSON.parse(jobDetailsRaw || '{}')

    console.log('Parsed data:', {
      location,
      customerInfo,
      jobDetails,
      hasPhotos: photos.length > 0,
      hasJobDetails: jobDetails && jobDetails.jobSize
    })

    // Get company ID from header (white-label) or form data (widget)
    const companyId = companyIdFromHeader || formData.get('companyId') as string || null

    // Calculate pricing using rules-based engine
    let priceMin = 150
    let priceMax = 350
    let items: any[] = []  // Using any[] to handle different item structures
    let pricingBreakdown = null
    let estimatedTruckLoads = 0.5
    let pricingConfidence = 50
    let pricingNotes: string[] = []

    // STEP 1: Try Vision API FIRST if photos are provided
    let visionApiSuccess = false

    if (photos.length > 0) {
      console.log(`Attempting Vision API analysis for ${photos.length} photos...`)

      try {
        const visionService = new VisionAIService()
        const photoBuffers = await Promise.all(
          photos.map(async (photo) => Buffer.from(await photo.arrayBuffer()))
        )

        const analysis = await visionService.analyzeImages(photoBuffers, {
          state: location?.state,
          zipCode: location?.zipCode
        })

        priceMin = analysis.estimatedPrice.min
        priceMax = analysis.estimatedPrice.max
        items = analysis.items.map((item: any) => ({
          type: item.name || item.type || 'Unknown Item',
          quantity: item.quantity || 1,
          category: item.category,
          requiresSpecialHandling: item.specialHandling || item.requiresSpecialHandling || false,
          confidence: item.confidence || 85  // Default confidence for AI-detected items
        }))

        // Apply job details modifiers to Vision API pricing
        if (jobDetails && jobDetails.urgency) {
          if (jobDetails.urgency === 'same_day' || jobDetails.urgency === 'within_24_hours') {
            priceMin = Math.round(priceMin * 1.15)  // 15% rush fee
            priceMax = Math.round(priceMax * 1.15)
            pricingNotes = ['AI analyzed photos', 'Rush service fee applied']
          } else {
            pricingNotes = ['AI successfully analyzed photos']
          }
        } else {
          pricingNotes = ['AI successfully analyzed photos']
        }

        if (jobDetails && jobDetails.accessDifficulty === 'stairs_or_elevator') {
          priceMin = Math.round(priceMin * 1.1)  // 10% difficulty fee
          priceMax = Math.round(priceMax * 1.1)
          pricingNotes.push('Stairs/elevator access fee')
        }

        visionApiSuccess = true

        console.log(`Vision API SUCCESS: Found ${items.length} items, applied job detail modifiers`)
      } catch (visionError) {
        console.log('Vision API failed:', visionError)
        visionApiSuccess = false
      }
    }

    // STEP 2: If Vision API didn't work or no photos, try rules-based pricing
    if (!visionApiSuccess && jobDetails && jobDetails.jobSize) {
      console.log('Using rules-based pricing with job details...')

      try {
        const pricingResult = calculatePricing(jobDetails)

        if (validatePricing(jobDetails, pricingResult)) {
          priceMin = pricingResult.priceMin
          priceMax = pricingResult.priceMax
          pricingBreakdown = pricingResult.breakdown
          estimatedTruckLoads = pricingResult.estimatedTruckLoads
          pricingConfidence = pricingResult.confidence

          // Convert job details to items
          items = jobDetails.itemTypes.map(type => ({
            type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
            quantity: 1,
            category: type,
            requiresSpecialHandling: jobDetails.specialHandling.includes(type),
            confidence: 100  // Manual selections
          }))

          if (photos.length > 0 && !visionApiSuccess) {
            pricingNotes = ['Photos uploaded but AI unavailable - using your selections']
          } else {
            pricingNotes = ['Pricing based on your selections']
          }

          console.log('Rules-based pricing SUCCESS')
        }
      } catch (rulesError) {
        console.error('Rules-based pricing failed:', rulesError)
      }
    }

    // STEP 3: Ultimate fallback if nothing worked
    if (items.length === 0) {
      console.log('Using fallback pricing...')
      const fallback = getFallbackPricing()
      priceMin = fallback.priceMin
      priceMax = fallback.priceMax

      if (photos.length > 0) {
        items = [{
          type: 'General Items (Unable to analyze)',
          quantity: photos.length,
          category: 'general',
          requiresSpecialHandling: false,
          confidence: 0
        }]
        pricingNotes = ['Using standard estimate - analysis unavailable']
      } else {
        items = [{
          type: 'Miscellaneous Items',
          quantity: 1,
          category: 'general',
          requiresSpecialHandling: false,
          confidence: 0
        }]
        pricingNotes = ['Using standard estimate']
      }
    }

    // BYPASSING DATABASE COMPLETELY - Schema is broken
    // Just return the pricing without saving
    console.log('BYPASSING DATABASE - Schema issues')

    const quote = {
      id: `demo_${Date.now()}`,
      status: 'new',
      customer_name: customerInfo.name || 'Demo User',
      customer_email: customerInfo.email || 'demo@example.com',
      priceMin,
      priceMax,
      created_at: new Date().toISOString()
    }

    console.log('Generated demo quote:', quote.id)

    // SKIP provider assignment for now
    if (false && companyId) {
      console.log('White-label quote - finding provider for company:', companyId)

      // Find provider associated with this company
      const { data: provider } = await supabase
        .from('providers')
        .select('id, company_name, contact_email')
        .or(`company_id.eq.${companyId},custom_domain.eq.${request.headers.get('host')}`)
        .single()

      if (provider) {
        console.log('Auto-assigning to provider:', provider.id)

        // Create lead distribution directly to this provider
        const { data: distribution, error: distError } = await supabase
          .from('lead_distributions')
          .insert({
            quote_id: quote.id,
            provider_id: provider.id,
            status: 'pending',
            bid_amount: 0, // No bidding for their own leads
            auto_assigned: true,
            assignment_reason: 'white_label_domain',
            metadata: {
              source: 'white_label',
              domain: request.headers.get('host'),
              companyId: companyId
            }
          })
          .select()
          .single()

        if (distError) {
          console.error('Failed to create lead distribution:', distError)
        } else {
          console.log('✅ Lead auto-assigned to provider via white-label')
        }

        // TODO: Send notification to provider
        // await sendProviderNotification(provider, quote)
      } else {
        console.warn('No provider found for company:', companyId)
      }
    } else {
      console.log('Direct quote - will go to marketplace for distribution')
      // TODO: Implement marketplace distribution for non-white-label leads
    }

    // Return response
    return NextResponse.json({
      success: true,
      id: quote.id,
      priceMin: priceMin,
      priceMax: priceMax,
      items: items,
      estimatedValue: Math.round((priceMin + priceMax) / 2),
      source: companyId ? 'white_label' : 'direct',
      breakdown: pricingBreakdown,
      truckLoads: estimatedTruckLoads,
      confidence: pricingConfidence,
      pricingNotes: pricingNotes,
      pricingMethod: jobDetails?.jobSize ? 'rules_based' : 'vision_api_fallback',
      message: 'Demo Mode: Quote calculated! (Database saving disabled)'
    })

  } catch (error: any) {
    console.error('Quote creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create quote'
      },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
export const dynamic = 'force-dynamic'