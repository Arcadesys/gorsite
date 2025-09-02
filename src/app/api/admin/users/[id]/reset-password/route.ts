import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/base-url'

export const dynamic = 'force-dynamic'

// Generate a secure random password
function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
  let password = ''
  
  // Ensure at least one character from each category
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const numbers = '23456789'
  const special = '!@#$%&*'
  
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// POST /api/admin/users/[id]/reset-password - Generate and send new password (superadmin only)
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

    // Prevent superadmin from resetting their own password this way
    if (user.email === result.user.email) {
      return NextResponse.json({ 
        error: 'Cannot reset your own password. Use the normal password reset flow.' 
      }, { status: 400 })
    }

    // Generate a new random password
    const newPassword = generateRandomPassword(12)

    // Update user password in Supabase
    const { error: updateError } = await (admin as any).auth.admin.updateUserById(id, {
      password: newPassword,
      user_metadata: {
        ...user.user_metadata,
        force_password_change: true,
        password_reset_at: new Date().toISOString(),
        password_reset_by: result.user.email,
      }
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Mark in local database that password change is required
    await prisma.user.update({
      where: { id },
      data: {
        // We could add a field for tracking password reset requirements
        updatedAt: new Date(),
      },
    }).catch(() => {
      // User might not exist in local DB, that's OK
    })

    // In a real system, you'd send an email here
    // For now, we'll return the password in the response (only for superadmin)
    const emailContent = `
Your password has been reset by an administrator.

New temporary password: ${newPassword}

Please log in and change your password immediately.

Login URL: ${getBaseUrl()}/admin/login

For security reasons, you will be required to change this password on your next login.
    `.trim()

    // TODO: Implement actual email sending here
    // await sendEmail(user.email, 'Password Reset', emailContent)

    return NextResponse.json({ 
      ok: true, 
      message: `Password reset for ${user.email}`,
      // NOTE: In production, remove this and only send via email
      temporaryPassword: newPassword,
      emailContent: emailContent
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to reset password' 
    }, { status: 500 })
  }
}
