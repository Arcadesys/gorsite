import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/auth/reset-password-request - Request password reset email
export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    
    // Use Supabase's built-in password reset functionality
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      console.error('Password reset request error:', error)
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        ok: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  } catch (error: any) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ 
      ok: true, 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  }
}