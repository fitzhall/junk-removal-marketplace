import { NextResponse } from 'next/server'

// This API route has been deprecated
// The provider dashboard now uses Supabase client directly
export async function GET() {
  return NextResponse.json(
    {
      error: 'This API route has been deprecated',
      message: 'Please use the provider dashboard at /provider which connects directly to Supabase'
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  )
}