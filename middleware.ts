import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Disabled NextAuth for Supabase migration
// import { getToken } from 'next-auth/jwt'

// Platform domain (you'll set this in env)
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3002'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  const path = url.pathname

  // TEMPORARILY DISABLED - Using Supabase Auth instead
  // Check for provider authentication
  // if (path.startsWith('/provider') && !path.includes('/login') && !path.includes('/register')) {
  //   const token = await getToken({ req: request })

  //   if (!token) {
  //     const loginUrl = new URL('/provider/login', request.url)
  //     loginUrl.searchParams.set('callbackUrl', path)
  //     return NextResponse.redirect(loginUrl)
  //   }

  //   // Check if user has PROVIDER role
  //   if (token.role !== 'PROVIDER') {
  //     return NextResponse.redirect(new URL('/unauthorized', request.url))
  //   }
  // }

  // // Check for provider API authentication
  // if (path.startsWith('/api/provider') && !path.includes('/auth')) {
  //   const token = await getToken({ req: request })

  //   if (!token || token.role !== 'PROVIDER') {
  //     return NextResponse.json(
  //       { error: 'Unauthorized. Provider authentication required.' },
  //       { status: 401 }
  //     )
  //   }
  // }

  // Remove port for comparison
  const domain = hostname.replace(/:\d+$/, '')
  const platformDomain = PLATFORM_DOMAIN.replace(/:\d+$/, '')

  // Check if this is a custom domain or subdomain
  let companySubdomain: string | null = null
  let companyCustomDomain: string | null = null

  if (domain !== platformDomain && domain !== 'localhost') {
    // Check if it's a subdomain of the platform
    if (domain.endsWith(`.${platformDomain}`)) {
      // Extract subdomain (e.g., "acme" from "acme.platform.com")
      companySubdomain = domain.replace(`.${platformDomain}`, '')
    } else {
      // It's a custom domain
      companyCustomDomain = domain
    }
  }

  // If we detected a company domain, fetch company data
  if (companySubdomain || companyCustomDomain) {
    try {
      // Call API to get company info
      const protocol = url.protocol
      const apiUrl = new URL('/api/company/resolve', `${protocol}//${hostname}`)

      if (companySubdomain) {
        apiUrl.searchParams.set('subdomain', companySubdomain)
      } else if (companyCustomDomain) {
        apiUrl.searchParams.set('customDomain', companyCustomDomain)
      }

      const response = await fetch(apiUrl.toString(), {
        headers: {
          'x-middleware-request': 'true'
        }
      })

      if (response.ok) {
        const company = await response.json()

        // Check if company is active
        if (!company.isActive) {
          return NextResponse.redirect(new URL('/inactive', request.url))
        }

        // Add company info to request headers for downstream use
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-company-id', company.id)
        requestHeaders.set('x-company-slug', company.slug)
        requestHeaders.set('x-company-subdomain', company.subdomain || '')
        requestHeaders.set('x-company-custom-domain', company.customDomain || '')
        requestHeaders.set('x-company-name', company.businessName || '')
        requestHeaders.set('x-company-logo', company.logoUrl || '')
        requestHeaders.set('x-company-primary-color', company.primaryColor || '#3B82F6')

        // Rewrite to company-specific route if needed
        // For now, just pass through with headers
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // Continue without company context on error
    }
  }

  // Default: no company detected, continue normally
  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/provider/:path*',
    '/api/provider/:path*',
  ],
}