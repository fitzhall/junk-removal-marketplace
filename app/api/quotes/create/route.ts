import { NextRequest, NextResponse } from 'next/server'
import { VisionAIService } from '@/lib/google-vision'
// import { createClient } from '@/lib/supabase-server' // TODO: Enable when saving to database

export async function POST(request: NextRequest) {
  console.log('API Route: Quote create started')
  console.log('Request headers:', {
    contentType: request.headers.get('content-type'),
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin')
  })
  console.log('Environment check:', {
    hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    hasClientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    hasCredentialsPath: !!process.env.GOOGLE_CLOUD_CREDENTIALS
  })

  try {
    const formData = await request.formData()

    // Get uploaded photos
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

    // Parse location and customer info with better error handling
    let location = {}
    let customerInfo = {}

    try {
      const locationStr = formData.get('location') as string
      if (locationStr) {
        console.log('Parsing location:', locationStr)
        location = JSON.parse(locationStr)
      }
    } catch (parseError) {
      console.error('Failed to parse location:', parseError)
      // Continue with empty location rather than failing
    }

    try {
      const customerInfoStr = formData.get('customerInfo') as string
      if (customerInfoStr) {
        console.log('Parsing customerInfo:', customerInfoStr)
        customerInfo = JSON.parse(customerInfoStr)
      }
    } catch (parseError) {
      console.error('Failed to parse customerInfo:', parseError)
      // Continue with empty customerInfo rather than failing
    }

    // Initialize Vision AI service if credentials are available
    let analysisResults = null

    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        console.log('Attempting to use Google Vision API...')
        const visionService = new VisionAIService()

        // Analyze the first photo (you could analyze multiple and combine results)
        const firstPhoto = photos[0]
        const buffer = Buffer.from(await firstPhoto.arrayBuffer())
        console.log('Image buffer size:', buffer.length)

        analysisResults = await visionService.analyzeImage(buffer)
        console.log('AI analysis results:', analysisResults)

        // Format the response with real AI analysis
        const response = {
          success: true,
          id: Math.random().toString(36).substring(7),
          priceMin: analysisResults.estimatedPrice.min,
          priceMax: analysisResults.estimatedPrice.max,
          items: analysisResults.items.map((item: any) => ({
            type: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            quantity: item.quantity,
            confidence: Math.round(item.confidence * 100),
            category: item.category,
            requiresSpecialHandling: item.requiresSpecialHandling
          })),
          volume: visionService.getTruckLoad(analysisResults.totalVolume), // Use existing instance
          totalVolume: analysisResults.totalVolume,
          requiresSpecialHandling: analysisResults.requiresSpecialHandling,
          location,
          customerInfo
        }

        // TODO: Save to Supabase database here
        // const supabase = createClient()
        // await supabase.from('quotes').insert({...})

        console.log('Returning AI analysis response:', JSON.stringify(response, null, 2))
        return NextResponse.json(response, {
          headers: {
            'Content-Type': 'application/json',
          }
        })

      } catch (aiError: any) {
        console.error('AI analysis failed, using mock data:', aiError)
        console.error('Error details:', {
          message: aiError.message,
          stack: aiError.stack?.substring(0, 500)
        })
        // Fall back to mock data if AI fails
      }
    } else {
      console.log('Google Cloud credentials not found, using mock data')
    }

    // Mock response if Google Vision is not configured
    const mockResponse = {
      success: true,
      id: Math.random().toString(36).substring(7),
      priceMin: 150,
      priceMax: 250,
      items: [
        { type: 'Couch', quantity: 1, category: 'furniture', confidence: 95 },
        { type: 'Mattress', quantity: 1, category: 'furniture', confidence: 88 },
        { type: 'Boxes', quantity: 3, category: 'general', confidence: 92 }
      ],
      volume: 'HALF',
      estimatedTime: '2-3 hours',
      requiresSpecialHandling: false,
      location,
      customerInfo
    }

    console.log('Returning mock response:', JSON.stringify(mockResponse, null, 2))
    return NextResponse.json(mockResponse, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error: any) {
    console.error('Error creating quote:', error)
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      name: error.name
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create quote',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Configure max body size for file uploads using Next.js 14 route segment config
export const maxDuration = 30 // Maximum function execution time in seconds
export const dynamic = 'force-dynamic' // Ensure this route is always dynamically rendered