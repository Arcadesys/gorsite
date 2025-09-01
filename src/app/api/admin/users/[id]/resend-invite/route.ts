import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

// POST /api/admin/users/[id]/resend-invite - Resend invitation email (superadmin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const admin = getSupabaseAdmin()

    // Get user details first
    const { data: user, error: getUserError } = await (admin as any).auth.admin.getUserById(id)
    if (getUserError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already confirmed their email
    if (user.email_confirmed_at) {
      return NextResponse.json({ 
        error: 'User has already confirmed their email. Use password reset instead.' 
      }, { status: 400 })
    }

    const redirectTo = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` 
      : 'http://localhost:3000/auth/callback'

    // Resend the invitation email
    const { error: inviteError } = await (admin as any).auth.admin.inviteUserByEmail(user.email, {
      data: user.user_metadata || {},
      app_metadata: user.app_metadata || {},
      redirectTo,
    })

    if (inviteError) {
      console.error('Resend invite error:', inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Invitation email resent to ${user.email}` 
    })
  } catch (error: any) {
    console.error('Resend invite error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to resend invitation' 
    }, { status: 500 })
  }
}