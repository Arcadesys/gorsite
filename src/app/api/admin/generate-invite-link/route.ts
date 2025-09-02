import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { getBaseUrl } from '@/lib/base-url'

export const dynamic = 'force-dynamic'

// POST /api/admin/generate-invite-link - Generate invite link without sending email
export async function POST(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  try {
    const { email, customMessage } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

      // Check if invitation already exists
  const existingInvitation = await prisma.artistInvitation.findFirst({
    where: {
      email,
      status: { not: 'ACCEPTED' }, // Check for non-accepted invitations (PENDING, EXPIRED, REVOKED)
      expiresAt: { gt: new Date() } // Only check non-expired invitations
    },
    include: {
      inviter: {
        select: { email: true }
      }
    }
  })

    if (existingInvitation) {
      // Return the existing invitation instead of creating a new one
      const baseUrl = getBaseUrl()
      const inviteLink = `${baseUrl}/signup?token=${existingInvitation.token}`
      
      return NextResponse.json({
        success: true,
        inviteLink,
        email: existingInvitation.email,
        expiresAt: existingInvitation.expiresAt.toISOString(),
        message: 'Found existing invitation',
        isExisting: true,
        createdAt: existingInvitation.createdAt.toISOString(),
        invitedBy: existingInvitation.inviter?.email || 'Unknown',
        customMessage: existingInvitation.customMessage
      })
    }

    // Ensure inviter exists in local DB for FK integrity
    await ensureLocalUser(result.user as any)

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store the invitation in the database
    await prisma.artistInvitation.create({
      data: {
        email: email.toLowerCase(),
        token: inviteToken,
        expiresAt,
        invitedBy: result.user.id,
        customMessage: customMessage || null,
        status: 'PENDING'
      }
    })

    // Create the invitation link
    const baseUrl = getBaseUrl()
    const inviteLink = `${baseUrl}/signup?token=${inviteToken}`

    return NextResponse.json({
      success: true,
      inviteLink,
      email,
      expiresAt: expiresAt.toISOString(),
      message: 'Invite link generated successfully'
    })

  } catch (error: any) {
    console.error('Generate invite link error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate invite link' 
    }, { status: 500 })
  }
}
