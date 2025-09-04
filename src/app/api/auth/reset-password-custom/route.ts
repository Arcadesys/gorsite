import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/auth/reset-password-custom - Reset password using custom token
export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json().catch(() => ({}))
  
  if (!token || !email || !password) {
    return NextResponse.json({ 
      error: 'Token, email, and password are required' 
    }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ 
      error: 'Password must be at least 6 characters long' 
    }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    
    // Find user by email
    const { data: users, error: userError } = await admin.auth.admin.listUsers()
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 400 })
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 400 })
    }

    // Check if token exists and is valid
    const resetToken = user.user_metadata?.password_reset_token
    const resetExpires = user.user_metadata?.password_reset_expires

    if (!resetToken || resetToken !== token) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 400 })
    }

    // Check if token is expired
    if (!resetExpires || new Date() > new Date(resetExpires)) {
      return NextResponse.json({ 
        error: 'Token has expired. Please request a new password reset.' 
      }, { status: 400 })
    }

    // Update the user's password
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: password
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update password. Please try again.' 
      }, { status: 500 })
    }

    // Clear the reset token from user metadata
    const { error: clearTokenError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        password_reset_token: null,
        password_reset_expires: null
      }
    })

    if (clearTokenError) {
      console.error('Error clearing reset token:', clearTokenError)
      // Don't fail the request if we can't clear the token, password was already updated
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Password updated successfully' 
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      error: 'Failed to update password. Please try again.' 
    }, { status: 500 })
  }
}