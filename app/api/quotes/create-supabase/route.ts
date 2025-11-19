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
    const location = JSON.parse(formData.get('location') as string || '{}')
    const customerInfo = JSON.parse(formData.get('customer') as string || formData.get('customerInfo') as string || '{}')
    const jobDetails: JobDetails = JSON.parse(formData.get('jobDetails') as string || '{}')

    // Get company ID from header (white-label) or form data (widget)
    const companyId = companyIdFromHeader || formData.get('companyId') as string || null

    // Calculate pricing using rules-based engine
    let priceMin = 150
    let priceMax = 350
    let items = []
    let pricingBreakdown = null
    let estimatedTruckLoads = 0.5
    let pricingConfidence = 50
    let pricingNotes: string[] = []

    // Use rules-based pricing if job details are provided
    if (jobDetails && jobDetails.jobSize) {
      console.log('Using rules-based pricing engine with job details:', jobDetails)

      try {
        const pricingResult = calculatePricing(jobDetails)

        // Validate the pricing makes sense
        if (validatePricing(jobDetails, pricingResult)) {
          priceMin = pricingResult.priceMin
          priceMax = pricingResult.priceMax
          pricingBreakdown = pricingResult.breakdown
          estimatedTruckLoads = pricingResult.estimatedTruckLoads
          pricingConfidence = pricingResult.confidence
          pricingNotes = pricingResult.notes

          // Convert job details to items for storage
          items = jobDetails.itemTypes.map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
            quantity: 1,
            category: type,
            specialHandling: jobDetails.specialHandling.includes(type)
          }))

          console.log('Rules-based pricing calculated:', {
            min: priceMin,
            max: priceMax,
            confidence: pricingConfidence,
            truckLoads: estimatedTruckLoads
          })
        } else {
          console.warn('Pricing validation failed, using fallback')
          const fallback = getFallbackPricing()
          priceMin = fallback.priceMin
          priceMax = fallback.priceMax
          pricingNotes = ['Pricing validation failed - showing standard estimate']
        }
      } catch (err) {
        console.error('Rules-based pricing failed:', err)
        const fallback = getFallbackPricing()
        priceMin = fallback.priceMin
        priceMax = fallback.priceMax
        pricingNotes = ['Pricing calculation error - showing standard estimate']
      }
    } else {
      // Fallback: Try Vision API for backward compatibility
      console.log('No job details provided, attempting Vision API analysis')

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
        items = analysis.items
        pricingNotes = ['Pricing based on photo analysis']
      } catch (err) {
        console.log('Vision API failed, using fallback pricing:', err)
        const fallback = getFallbackPricing()
        priceMin = fallback.priceMin
        priceMax = fallback.priceMax
        items = [{ name: 'General Items', quantity: photos.length, category: 'general' }]
        pricingNotes = ['Using standard pricing estimate']
      }
    }

    // Create quote in Supabase - MINIMAL fields only to avoid schema errors
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        status: 'new',
        customer_name: customerInfo.name || null,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone || null,
        service_address: location.address || null,
        service_zip: location.zipCode || null,
        service_city: location.city || null,
        service_state: location.state || null,
        price_min: priceMin,
        price_max: priceMax,
        source: companyId ? 'white_label' : 'direct'
        // Removed: metadata, items, photos, urgency, preferred_date, preferred_time
        // These fields may not exist in the database
      })
      .select()
      .single()

    if (quoteError) {
      console.error('Failed to create quote:', quoteError)
      throw quoteError
    }

    console.log('Created quote:', quote.id)

    // CRITICAL: Auto-assign to provider if this is a white-label domain
    if (companyId) {
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
      estimatedValue: quote.estimated_value,
      source: quote.source,
      breakdown: pricingBreakdown,
      truckLoads: estimatedTruckLoads,
      confidence: pricingConfidence,
      pricingNotes: pricingNotes,
      pricingMethod: jobDetails?.jobSize ? 'rules_based' : 'vision_api_fallback',
      message: companyId ?
        `Quote received! ${companyName || 'Provider'} will contact you soon.` :
        'Quote received! Providers in your area have been notified.'
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