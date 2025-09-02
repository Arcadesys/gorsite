import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { getBaseUrl } from '@/lib/base-url'

export const dynamic = 'force-dynamic'

// POST /api/admin/generate-invite-link - Generate generic invite link
export async function POST(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  try {
    // Ensure inviter exists in local DB for FK integrity
    await ensureLocalUser(result.user as any)

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store the invitation in the database (without specific email)
    const invitation = await prisma.artistInvitation.create({
      data: {
        email: '', // Empty email for generic invitations
        token: inviteToken,
        expiresAt,
        invitedBy: result.user.id,
        customMessage: null,
        status: 'PENDING'
      }
    })

    // Create the invitation link
    const baseUrl = getBaseUrl()
    const inviteLink = `${baseUrl}/signup?token=${inviteToken}`

    return NextResponse.json({
      success: true,
      inviteLink,
      invitationId: invitation.id,
      expiresAt: expiresAt.toISOString(),
      message: 'Generic invite link generated successfully'
    })

  } catch (error: any) {
    console.error('Generate invite link error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate invite link' 
    }, { status: 500 })
  }
}
