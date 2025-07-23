import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { applySecurityHeaders, rateLimitMiddleware, rateLimitConfigs, isIPBlocked, trackSuspiciousActivity } from '@/lib/security'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/projects',
  '/events',
  '/messages',
  '/directory',
  '/courses',
  '/admin',
]

const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
]

const adminRoutes = [
  '/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if IP is blocked
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown'
  
  if (await isIPBlocked(clientIP)) {
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'IP_BLOCKED',
          message: 'Access denied. Your IP address has been blocked due to suspicious activity.'
        }
      },
      { status: 403 }
    )
    return applySecurityHeaders(response)
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    let rateLimitResponse: NextResponse

    if (pathname.startsWith('/api/auth/login')) {
      // Strict rate limiting for login attempts (10 per 15 minutes)
      rateLimitResponse = await rateLimitMiddleware(request, rateLimitConfigs.strict)
      if (rateLimitResponse.status === 429) {
        await trackSuspiciousActivity(clientIP)
        return applySecurityHeaders(rateLimitResponse)
      }
    } else if (pathname.startsWith('/api/auth/')) {
      // Moderate rate limiting for other auth endpoints
      rateLimitResponse = await rateLimitMiddleware(request, rateLimitConfigs.moderate)
      if (rateLimitResponse.status === 429) {
        return applySecurityHeaders(rateLimitResponse)
      }
    } else if (pathname.startsWith('/api/admin/')) {
      // Strict rate limiting for admin endpoints
      rateLimitResponse = await rateLimitMiddleware(request, rateLimitConfigs.strict)
      if (rateLimitResponse.status === 429) {
        await trackSuspiciousActivity(clientIP)
        return applySecurityHeaders(rateLimitResponse)
      }
    } else {
      // Moderate rate limiting for general API endpoints
      rateLimitResponse = await rateLimitMiddleware(request, rateLimitConfigs.moderate)
      if (rateLimitResponse.status === 429) {
        return applySecurityHeaders(rateLimitResponse)
      }
    }
  }
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Get token from cookie
  const token = request.cookies.get('namc-auth-token')?.value

  // If accessing auth routes (login, register, etc.) and user is already authenticated
  if (isAuthRoute && token) {
    try {
      const user = await AuthService.getUserFromToken(token)
      if (user) {
        // Redirect authenticated users away from auth pages
        const redirectResponse = user.memberType === 'admin' 
          ? NextResponse.redirect(new URL('/admin/dashboard', request.url))
          : NextResponse.redirect(new URL('/dashboard', request.url))
        return applySecurityHeaders(redirectResponse)
      }
    } catch (error) {
      // Token is invalid, clear it and continue to auth page
      const response = NextResponse.next()
      response.cookies.delete('namc-auth-token')
      return applySecurityHeaders(response)
    }
  }

  // If accessing protected routes without authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    return applySecurityHeaders(redirectResponse)
  }

  // If accessing protected routes with token, verify it
  if (isProtectedRoute && token) {
    try {
      const user = await AuthService.getUserFromToken(token)
      
      if (!user) {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('namc-auth-token')
        return applySecurityHeaders(response)
      }

      // Check admin routes
      if (isAdminRoute && user.memberType !== 'admin') {
        const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
        return applySecurityHeaders(redirectResponse)
      }

      // Add user data to headers for server components
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-email', user.email)
      requestHeaders.set('x-user-type', user.memberType)

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      return applySecurityHeaders(response)
    } catch (error) {
      console.error('Middleware auth error:', error)
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('namc-auth-token')
      return applySecurityHeaders(response)
    }
  }

  // Apply security headers to all responses
  const response = NextResponse.next()
  const secureResponse = applySecurityHeaders(response)

  // Add API-specific headers for API routes
  if (pathname.startsWith('/api/')) {
    // Prevent caching of API responses
    secureResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    secureResponse.headers.set('Pragma', 'no-cache')
    secureResponse.headers.set('Expires', '0')
  }

  // Add request ID header for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  secureResponse.headers.set('X-Request-ID', requestId)

  return secureResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files - but include api routes for security)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)',
  ],
}