import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/signup', '/api/auth', '/api/quotes']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Provider-only routes
  if (path.startsWith('/provider') && token.role !== 'PROVIDER') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin-only routes
  if (path.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}


export const config = {
  matcher: [
    '/dashboard/:path*',
    '/provider/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
}