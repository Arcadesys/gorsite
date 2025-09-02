import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail, generateInvitationEmailHTML, generateSuperuserCopyEmailHTML } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/admin/invite-artist - Send custom invitation email to artist
export async function POST(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }
  
  const { email, inviteMessage } = await req.json().catch(() => ({}))
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    // Ensure inviter exists in local DB for FK integrity - do this first
    await ensureLocalUser(result.user as any)

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store the invitation in the database
    const invitation = await prisma.artistInvitation.create({
      data: {
        email: email.toLowerCase(),
        token: inviteToken,
        expiresAt,
        invitedBy: result.user.id,
        customMessage: inviteMessage || null,
        status: 'PENDING'
      }
    })

    // Create the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/signup?token=${inviteToken}`

    // Send the custom branded email
    await sendArtistInvitationEmail({
      to: email,
      inviteLink,
      customMessage: inviteMessage || '',
      galleryName: "The Arcade Art Gallery"
    })

    // Send a copy to superuser for record keeping
    const superuserEmail = process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me'
    await sendSuperuserCopyEmail({
      originalRecipient: email,
      inviteLink,
      customMessage: inviteMessage || '',
      galleryName: "The Arcade Art Gallery",
      superuserEmail
    })

    return NextResponse.json({ 
      ok: true, 
      invitationId: invitation.id,
      message: `Custom invitation sent to ${email}` 
    })
  } catch (error: any) {
    console.error('Artist invitation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to send invitation' 
    }, { status: 500 })
  }
}

// Helper function to send custom branded email
async function sendArtistInvitationEmail({
  to,
  inviteLink,
  customMessage,
  galleryName
}: {
  to: string
  inviteLink: string
  customMessage: string
  galleryName: string
}) {
  const html = generateInvitationEmailHTML({
    inviteLink,
    customMessage,
    galleryName
  })

  console.log(`INVITE_LINK: ${inviteLink}`) // For test compatibility

  return await sendEmail({
    to,
    subject: `You're Invited to Join ${galleryName}`,
    html
  })
}

// Helper function to send a copy of the invitation to superuser for record keeping
async function sendSuperuserCopyEmail({
  originalRecipient,
  inviteLink,
  customMessage,
  galleryName,
  superuserEmail
}: {
  originalRecipient: string
  inviteLink: string
  customMessage: string
  galleryName: string
  superuserEmail: string
}) {
  const html = generateSuperuserCopyEmailHTML({
    originalRecipient,
    inviteLink,
    customMessage,
    galleryName
  })

  return await sendEmail({
    to: superuserEmail,
    subject: `[COPY] Artist Invitation Sent to ${originalRecipient}`,
    html,
    logPrefix: 'SUPERUSER COPY EMAIL:'
  })
}
