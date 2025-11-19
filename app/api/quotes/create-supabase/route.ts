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
    let items: any[] = []  // Using any[] to handle different item structures
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
            type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '), // Changed from 'name' to 'type'
            quantity: 1,
            category: type,
            requiresSpecialHandling: jobDetails.specialHandling.includes(type) // Changed to match ItemEditor
          }))

          // Add photo-based item if photos were provided
          if (photos.length > 0) {
            items.push({
              type: `Photos (${photos.length} uploaded)`,
              quantity: photos.length,
              category: 'photos',
              requiresSpecialHandling: false,
              confidence: 100
            })
          }

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
        // Ensure items have 'type' field, not 'name'
        items = analysis.items.map((item: any) => ({
          type: item.name || item.type || 'Unknown Item',
          quantity: item.quantity || 1,
          category: item.category,
          requiresSpecialHandling: item.specialHandling || item.requiresSpecialHandling || false,
          confidence: item.confidence
        }))
        pricingNotes = ['Pricing based on photo analysis']
      } catch (err) {
        console.log('Vision API failed, using fallback pricing:', err)
        const fallback = getFallbackPricing()
        priceMin = fallback.priceMin
        priceMax = fallback.priceMax
        items = [{ type: 'General Items', quantity: photos.length, category: 'general', requiresSpecialHandling: false }]
        pricingNotes = ['Using standard pricing estimate']
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