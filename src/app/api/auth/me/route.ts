import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from httpOnly cookie or Authorization header
    const tokenFromCookie = request.cookies.get('namc-auth-token')?.value
    const authHeader = request.headers.get('authorization')
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    
    const token = tokenFromCookie || tokenFromHeader

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const user = await AuthService.getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error: any) {
    console.error('Auth check error:', error)
    
    return NextResponse.json(
      { success: false, message: 'Authentication check failed' },
      { status: 500 }
    )
  }
}