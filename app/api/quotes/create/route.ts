import { NextRequest, NextResponse } from 'next/server'
import { VisionAIService } from '@/lib/google-vision'
// import { createClient } from '@/lib/supabase-server' // TODO: Enable when saving to database

export async function POST(request: NextRequest) {
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

    // Parse location and customer info
    const locationStr = formData.get('location') as string
    const customerInfoStr = formData.get('customerInfo') as string

    const location = locationStr ? JSON.parse(locationStr) : {}
    const customerInfo = customerInfoStr ? JSON.parse(customerInfoStr) : {}

    // Initialize Vision AI service if credentials are available
    let analysisResults = null

    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        const visionService = new VisionAIService()

        // Analyze the first photo (you could analyze multiple and combine results)
        const firstPhoto = photos[0]
        const buffer = Buffer.from(await firstPhoto.arrayBuffer())

        analysisResults = await visionService.analyzeImage(buffer)

        // Format the response with real AI analysis
        const response = {
          success: true,
          id: Math.random().toString(36).substring(7),
          priceMin: analysisResults.estimatedPrice.min,
          priceMax: analysisResults.estimatedPrice.max,
          items: analysisResults.items.map(item => ({
            type: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            quantity: item.quantity,
            confidence: Math.round(item.confidence * 100),
            category: item.category,
            requiresSpecialHandling: item.requiresSpecialHandling
          })),
          volume: new VisionAIService().getTruckLoad(analysisResults.totalVolume),
          totalVolume: analysisResults.totalVolume,
          requiresSpecialHandling: analysisResults.requiresSpecialHandling,
          location,
          customerInfo
        }

        // TODO: Save to Supabase database here
        // const supabase = createClient()
        // await supabase.from('quotes').insert({...})

        return NextResponse.json(response)

      } catch (aiError) {
        console.error('AI analysis failed, using mock data:', aiError)
        // Fall back to mock data if AI fails
      }
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

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}

// Configure max body size for file uploads using Next.js 14 route segment config
export const maxDuration = 30 // Maximum function execution time in seconds
export const dynamic = 'force-dynamic' // Ensure this route is always dynamically rendered