import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/auth/change-password - Change user's password
export async function POST(req: NextRequest) {
  const result = await requireUser(req)
  if (result instanceof NextResponse) {
    return result
  }

  const { currentPassword, newPassword } = await req.json().catch(() => ({}))
  
  if (!newPassword) {
    return NextResponse.json({ error: 'New password is required' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()
    const userId = result.user.id

    // If user has force_password_change flag, we can update without current password
    const forceChange = Boolean(result.user.user_metadata?.force_password_change)

    if (!forceChange && !currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }

    // For force password change, we skip current password verification
    if (!forceChange) {
      // Verify current password by attempting to sign in
      const { getSupabaseBrowser } = await import('@/lib/supabase')
      const supabase = getSupabaseBrowser()
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: result.user.email!,
        password: currentPassword
      })
      
      if (verifyError) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    // Update password using admin client
    const { error: updateError } = await (admin as any).auth.admin.updateUserById(userId, {
      password: newPassword,
      user_metadata: {
        ...result.user.user_metadata,
        force_password_change: false, // Clear the flag
        password_changed_at: new Date().toISOString(),
      }
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Password changed successfully' 
    })
  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to change password' 
    }, { status: 500 })
  }
}