import { NextRequest, NextResponse } from 'next/server'
import { VisionAIService } from '@/lib/google-vision'
import { prisma } from '@/lib/prisma'
import { VolumeSize } from '@prisma/client'
import { cloudinaryService } from '@/lib/cloudinary'
import { leadService } from '@/lib/lead-service'

interface LocationData {
  address?: string
  zipCode?: string
  city?: string
  state?: string
}

interface CustomerInfoData {
  name?: string
  email?: string
  phone?: string
  preferredDate?: string
  preferredTime?: string
  isUrgent?: boolean
}

function mapVolumeToEnum(volume: string): VolumeSize {
  const volumeMap: Record<string, VolumeSize> = {
    'QUARTER': VolumeSize.QUARTER,
    'HALF': VolumeSize.HALF,
    'THREE_QUARTER': VolumeSize.THREE_QUARTER,
    'FULL': VolumeSize.FULL,
    'MULTIPLE': VolumeSize.MULTIPLE
  }
  return volumeMap[volume] || VolumeSize.HALF
}

function getMockResponse(location: LocationData, customerInfo: CustomerInfoData) {
  return {
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
}

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

    // Upload photos to Cloudinary
    let uploadedPhotoUrls: string[] = []
    try {
      const photoBuffers = await Promise.all(
        photos.map(async (photo) => Buffer.from(await photo.arrayBuffer()))
      )
      const uploadResults = await cloudinaryService.uploadMultiple(photoBuffers, 'junk-removal/quotes')
      uploadedPhotoUrls = uploadResults.map(result => result.secure_url)
      console.log(`Uploaded ${uploadedPhotoUrls.length} photos to Cloudinary`)
    } catch (uploadError) {
      console.error('Failed to upload photos to Cloudinary:', uploadError)
      // Continue without photo URLs if upload fails
    }

    // Parse location and customer info with better error handling
    let location: LocationData = {}
    let customerInfo: CustomerInfoData = {}

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

    // Check for either credential file or individual env vars
    const hasCredentials = process.env.GOOGLE_CLOUD_CREDENTIALS ||
                          (process.env.GOOGLE_CLOUD_PROJECT_ID &&
                           process.env.GOOGLE_CLOUD_CLIENT_EMAIL &&
                           process.env.GOOGLE_CLOUD_PRIVATE_KEY)

    if (hasCredentials) {
      try {
        console.log('Attempting to use Google Vision API...')
        console.log('Using credentials:', {
          usingFile: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
          filePath: process.env.GOOGLE_CLOUD_CREDENTIALS,
          usingEnvVars: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL?.substring(0, 20) + '...',
          hasPrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY
        })
        const visionService = new VisionAIService()

        // Analyze all photos together for better detection
        const photoBuffers = await Promise.all(
          photos.map(async (photo) => Buffer.from(await photo.arrayBuffer()))
        )
        console.log(`Analyzing ${photoBuffers.length} images with total size: ${photoBuffers.reduce((sum, buf) => sum + buf.length, 0)} bytes`)

        // Pass location for advanced pricing
        analysisResults = await visionService.analyzeImages(photoBuffers, {
          state: location?.state,
          zipCode: location?.zipCode
        })
        console.log('AI analysis results with location-based pricing:', analysisResults)

        // Save quote to database as a lead (no user association needed)
        let response: any
        try {
          const savedQuote = await prisma.quote.create({
            data: {
              status: 'PENDING',
              customerName: customerInfo?.name || null,
              customerEmail: customerInfo?.email || null,
              customerPhone: customerInfo?.phone || null,
              pickupAddress: location?.address || null,
              pickupZip: location?.zipCode || null,
              pickupCity: location?.city || null,
              pickupState: location?.state || null,
              photoUrls: uploadedPhotoUrls,
              aiAnalysis: analysisResults as any, // Cast to any for JSON field
              estimatedVolume: mapVolumeToEnum(visionService.getTruckLoad(analysisResults.totalVolume)),
              priceRangeMin: analysisResults.estimatedPrice.min,
              priceRangeMax: analysisResults.estimatedPrice.max,
              totalPrice: (analysisResults.estimatedPrice.min + analysisResults.estimatedPrice.max) / 2,
              preferredDate: customerInfo?.preferredDate ? new Date(customerInfo.preferredDate) : null,
              preferredTimeWindow: customerInfo?.preferredTime || null,
              isUrgent: customerInfo?.isUrgent || false,
              source: 'web',
              items: {
                create: analysisResults.items.map((item: any) => ({
                  itemType: item.name,
                  itemDescription: item.description || null,
                  quantity: item.quantity,
                  aiConfidence: item.confidence,
                  requiresSpecialHandling: item.requiresSpecialHandling || false,
                  estimatedWeightLbs: item.estimatedWeight || null,
                  dimensions: item.dimensions || null
                }))
              }
            },
            include: {
              items: true
            }
          })

          // Distribute lead to providers
          try {
            await leadService.distributeLeadToProviders(savedQuote.id)
            console.log('Lead distributed to providers')
          } catch (distError) {
            console.error('Failed to distribute lead:', distError)
            // Continue even if distribution fails
          }

          // Format the response with database ID
          response = {
            success: true,
            id: savedQuote.id,
            priceMin: savedQuote.priceRangeMin,
            priceMax: savedQuote.priceRangeMax,
            items: savedQuote.items.map((item: any) => ({
              type: item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1),
              quantity: item.quantity,
              confidence: item.aiConfidence ? Math.round(item.aiConfidence * 100) : null,
              requiresSpecialHandling: item.requiresSpecialHandling
            })),
            volume: savedQuote.estimatedVolume,
            totalVolume: analysisResults.totalVolume,
            requiresSpecialHandling: analysisResults.requiresSpecialHandling,
            location,
            customerInfo
          }
        } catch (dbError) {
          console.error('Failed to save to database:', dbError)
          // Continue with response even if DB save fails
          response = {
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
            volume: visionService.getTruckLoad(analysisResults.totalVolume),
            totalVolume: analysisResults.totalVolume,
            requiresSpecialHandling: analysisResults.requiresSpecialHandling,
            location,
            customerInfo,
            warning: 'Quote processed but not saved to database'
          }
        }

        console.log('Returning AI analysis response:', JSON.stringify(response, null, 2))
        return NextResponse.json(response, {
          headers: {
            'Content-Type': 'application/json',
          }
        })

      } catch (aiError: any) {
        console.error('AI analysis failed, using mock data:', aiError)
        console.error('Full error details:', {
          message: aiError.message,
          stack: aiError.stack,
          name: aiError.name,
          code: aiError.code
        })

        // Return error details in response for debugging (remove in production)
        const mockResponse = getMockResponse(location, customerInfo)
        return NextResponse.json({
          ...mockResponse,
          success: true, // Keep success true so UI still works
          error: 'Vision API failed',
          details: {
            message: aiError.message,
            name: aiError.name,
            code: aiError.code
          },
          mockData: true
        })
        // Fall back to mock data if AI fails
      }
    } else {
      console.log('Google Cloud credentials not found, using mock data')
      console.log('Credentials check:', {
        hasCredentialsFile: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
        credentialsPath: process.env.GOOGLE_CLOUD_CREDENTIALS,
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasClientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY
      })
    }

    // Mock response if Google Vision is not configured
    const mockResponse = getMockResponse(location, customerInfo)

    // Try to save mock data to database
    try {
      const savedQuote = await prisma.quote.create({
        data: {
          status: 'PENDING',
          customerName: customerInfo?.name || null,
          customerEmail: customerInfo?.email || null,
          customerPhone: customerInfo?.phone || null,
          pickupAddress: location?.address || null,
          pickupZip: location?.zipCode || null,
          pickupCity: location?.city || null,
          pickupState: location?.state || null,
          photoUrls: uploadedPhotoUrls,
          aiAnalysis: mockResponse as any,
          estimatedVolume: mapVolumeToEnum(mockResponse.volume),
          priceRangeMin: mockResponse.priceMin,
          priceRangeMax: mockResponse.priceMax,
          totalPrice: (mockResponse.priceMin + mockResponse.priceMax) / 2,
          preferredDate: customerInfo?.preferredDate ? new Date(customerInfo.preferredDate) : null,
          preferredTimeWindow: customerInfo?.preferredTime || null,
          isUrgent: customerInfo?.isUrgent || false,
          source: 'web',
          items: {
            create: mockResponse.items.map((item: any) => ({
              itemType: item.type,
              quantity: item.quantity,
              aiConfidence: item.confidence / 100,
              requiresSpecialHandling: item.category === 'hazardous' || item.category === 'heavy'
            }))
          }
        },
        include: {
          items: true
        }
      })

      mockResponse.id = savedQuote.id
      console.log('Saved mock quote to database:', savedQuote.id)

      // Distribute lead to providers
      try {
        await leadService.distributeLeadToProviders(savedQuote.id)
        console.log('Lead distributed to providers')
      } catch (distError) {
        console.error('Failed to distribute lead:', distError)
      }
    } catch (dbError) {
      console.error('Failed to save mock data to database:', dbError)
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