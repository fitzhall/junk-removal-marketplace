import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import crypto from 'crypto'
import dns from 'dns/promises'

// POST /api/company/domains - Add/update custom domain
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, customDomain, action } = body

    if (!companyId || !customDomain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    // Check if domain is already taken by another company
    const existingDomain = await prisma.company.findFirst({
      where: {
        customDomain,
        NOT: { id: companyId }
      }
    })

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already in use by another company' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Update company with custom domain
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        customDomain,
        domainVerified: false,
        // Store verification token in a JSON field (you may want to add this to schema)
      }
    })

    return NextResponse.json({
      success: true,
      domain: customDomain,
      verificationToken,
      instructions: {
        step1: 'Add a TXT record to your DNS',
        txtName: '_junk-removal-verification',
        txtValue: verificationToken,
        step2: 'Add a CNAME record',
        cnameName: customDomain,
        cnameValue: process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'yourdomain.com',
        step3: 'Click "Verify Domain" after DNS propagates (may take 5-10 minutes)'
      }
    })
  } catch (error: any) {
    console.error('Error adding custom domain:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add custom domain' },
      { status: 500 }
    )
  }
}

// PUT /api/company/domains - Verify custom domain
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { companyId, customDomain, verificationToken } = body

    if (!companyId || !customDomain || !verificationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify DNS TXT record
    try {
      const txtRecords = await dns.resolveTxt(`_junk-removal-verification.${customDomain}`)
      const txtValues = txtRecords.flat()

      if (!txtValues.includes(verificationToken)) {
        return NextResponse.json(
          { error: 'Verification token not found in DNS TXT record' },
          { status: 400 }
        )
      }
    } catch (dnsError) {
      return NextResponse.json(
        {
          error: 'Could not verify DNS TXT record. Make sure it has propagated.',
          details: 'DNS lookup failed'
        },
        { status: 400 }
      )
    }

    // Verify CNAME record
    try {
      const cnameRecords = await dns.resolveCname(customDomain)
      const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'yourdomain.com'

      if (!cnameRecords.includes(platformDomain)) {
        return NextResponse.json(
          { error: `CNAME record must point to ${platformDomain}` },
          { status: 400 }
        )
      }
    } catch (dnsError) {
      return NextResponse.json(
        {
          error: 'Could not verify CNAME record. Make sure it has propagated.',
          details: 'CNAME lookup failed'
        },
        { status: 400 }
      )
    }

    // Update company domain as verified
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        domainVerified: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Domain verified successfully!',
      domain: customDomain
    })
  } catch (error: any) {
    console.error('Error verifying custom domain:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify custom domain' },
      { status: 500 }
    )
  }
}

// DELETE /api/company/domains - Remove custom domain
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Missing company ID' },
        { status: 400 }
      )
    }

    // Remove custom domain
    await prisma.company.update({
      where: { id: companyId },
      data: {
        customDomain: null,
        domainVerified: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Custom domain removed'
    })
  } catch (error: any) {
    console.error('Error removing custom domain:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove custom domain' },
      { status: 500 }
    )
  }
}
