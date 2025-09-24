import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Test endpoint called')
  return NextResponse.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      hasGoogleClientEmail: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      hasGooglePrivateKey: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test POST received:', body)
    return NextResponse.json({
      success: true,
      message: 'POST is working',
      received: body
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 })
  }
}