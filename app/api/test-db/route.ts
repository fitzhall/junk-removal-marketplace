import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const response: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database_url_exists: !!process.env.DATABASE_URL,
    direct_url_exists: !!process.env.DIRECT_URL,
    database_url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'Not set',
    direct_url_preview: process.env.DIRECT_URL ? process.env.DIRECT_URL.substring(0, 50) + '...' : 'Not set',
  }

  try {
    // Test basic database connection
    await prisma.$connect()
    response.database_connection = 'SUCCESS ✅'

    // Try to count quotes
    const quoteCount = await prisma.quote.count()
    response.quote_count = quoteCount

    // Try to count users
    const userCount = await prisma.user.count()
    response.user_count = userCount

    // Get database version
    const result = await prisma.$queryRaw`SELECT version()`
    response.postgres_version = (result as any)[0]?.version || 'Unknown'

    await prisma.$disconnect()

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful!',
      details: response
    }, { status: 200 })

  } catch (error: any) {
    console.error('Database connection error:', error)

    // Parse the error for helpful info
    const errorInfo = {
      ...response,
      database_connection: 'FAILED ❌',
      error_type: error.constructor.name,
      error_message: error.message,
    }

    // Check for common issues
    if (error.message.includes('invalid domain character')) {
      errorInfo.likely_issue = 'Special characters in DATABASE_URL need URL encoding (e.g., * should be %2A)'
    } else if (error.message.includes('password authentication failed')) {
      errorInfo.likely_issue = 'Incorrect password or username'
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      errorInfo.likely_issue = 'Cannot reach database host - check the URL'
    } else if (error.message.includes('P1001')) {
      errorInfo.likely_issue = 'Cannot connect to database - check if database is running and accessible'
    }

    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      details: errorInfo
    }, { status: 500 })
  }
}