import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/auth/validate-reset-token - Validate password reset token
export async function POST(req: NextRequest) {
  const { token, email } = await req.json().catch(() => ({}))
  
  if (!token || !email) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Token and email are required' 
    }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    
    // Find user by email
    const { data: users, error: userError } = await admin.auth.admin.listUsers()
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid token' 
      }, { status: 400 })
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid token' 
      }, { status: 400 })
    }

    // Check if token exists and is valid
    const resetToken = user.user_metadata?.password_reset_token
    const resetExpires = user.user_metadata?.password_reset_expires

    if (!resetToken || resetToken !== token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired token' 
      }, { status: 400 })
    }

    // Check if token is expired
    if (!resetExpires || new Date() > new Date(resetExpires)) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token has expired. Please request a new password reset.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true, 
      message: 'Token is valid' 
    })
  } catch (error: any) {
    console.error('Token validation error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Invalid token' 
    }, { status: 400 })
  }
}