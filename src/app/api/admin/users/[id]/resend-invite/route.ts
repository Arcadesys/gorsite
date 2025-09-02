import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

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

    // Ensure inviter exists in local DB for FK integrity
    await ensureLocalUser(result.user as any)

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store the invitation in the database
    const invitation = await prisma.artistInvitation.create({
      data: {
        email: user.email.toLowerCase(),
        token: inviteToken,
        expiresAt,
        invitedBy: result.user.id,
        customMessage: 'This is a resent invitation to join our gallery.',
        status: 'PENDING'
      }
    })

    // Create the invitation link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/signup?token=${inviteToken}`

    // Send the custom branded email instead of using Supabase's default
    await sendArtistInvitationEmail({
      to: user.email,
      inviteLink,
      customMessage: 'This is a resent invitation to join our gallery.',
      galleryName: "The Arcade Art Gallery"
    })

    // Send a copy to superuser for record keeping
    const superuserEmail = process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me'
    await sendSuperuserCopyEmail({
      originalRecipient: user.email,
      inviteLink,
      customMessage: 'This is a resent invitation to join our gallery.',
      galleryName: "The Arcade Art Gallery",
      superuserEmail
    })

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
  // For now, we'll log the email content
  // In production, you'd integrate with your email service (SendGrid, Mailgun, etc.)
  
  const emailContent = `
From: ${galleryName} <noreply@artpop.vercel.app>
To: ${to}
Subject: You're Invited to Join ${galleryName}

Hello!

You've been invited to create your artist profile on ${galleryName}!

${customMessage ? `\nPersonal message:\n${customMessage}\n` : ''}

Getting started is easy:
1. Click the link below to accept your invitation
2. Choose your unique artist URL (your "slug")
3. Create a secure password
4. Set up your first gallery page

Ready to showcase your art? Click here:
${inviteLink}

This invitation will expire in 7 days.

Welcome to ${galleryName}!

---
${galleryName}
Creating spaces for digital artists to thrive
  `.trim()

  console.log('EMAIL TO SEND:')
  console.log(emailContent)
  console.log('---')

  // TODO: Replace with actual email service integration
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  await sgMail.send({
    to,
    from: { email: 'noreply@artpop.vercel.app', name: galleryName },
    subject: `You're Invited to Join ${galleryName}`,
    html: generateHTMLEmailTemplate({ inviteLink, customMessage, galleryName })
  })
  */
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
  const emailContent = `
From: ${galleryName} <noreply@artpop.vercel.app>
To: ${superuserEmail}
Subject: [COPY] Artist Invitation Resent to ${originalRecipient}

Hi there,

This is a copy of the artist invitation that was just RESENT to ${originalRecipient} for your records.

ORIGINAL INVITATION DETAILS:
Recipient: ${originalRecipient}
Gallery: ${galleryName}
${customMessage ? `Personal message: ${customMessage}` : 'No personal message included'}

INVITATION LINK:
${inviteLink}

This invitation will expire in 7 days.

---
${galleryName}
Admin Notification System
  `.trim()

  console.log('SUPERUSER COPY EMAIL (RESEND):')
  console.log(emailContent)
  console.log('---')

  // TODO: Replace with actual email service integration when ready
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  await sgMail.send({
    to: superuserEmail,
    from: { email: 'noreply@artpop.vercel.app', name: galleryName },
    subject: `[COPY] Artist Invitation Resent to ${originalRecipient}`,
    html: generateSuperuserCopyHTMLTemplate({ originalRecipient, inviteLink, customMessage, galleryName })
  })
  */
}