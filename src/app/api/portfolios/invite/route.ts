import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

function isAdmin(user: any) {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  )
}

export async function POST(req: NextRequest) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, portfolioSlug } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  try {
    // Ensure inviter exists in local DB for FK integrity
    await ensureLocalUser(user as any)

    // Generate a secure invitation token
    const inviteToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store the invitation in the database
    const invitation = await prisma.artistInvitation.create({
      data: {
        email: email.toLowerCase(),
        token: inviteToken,
        expiresAt,
        invitedBy: user.id,
        customMessage: portfolioSlug ? `Portfolio slug: ${portfolioSlug}` : null,
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
      customMessage: portfolioSlug ? `Your suggested portfolio slug: ${portfolioSlug}` : '',
      galleryName: "The Arcade Art Gallery"
    })

    // Send a copy to superuser for record keeping
    const superuserEmail = process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me'
    await sendSuperuserCopyEmail({
      originalRecipient: email,
      inviteLink,
      customMessage: portfolioSlug ? `Your suggested portfolio slug: ${portfolioSlug}` : '',
      galleryName: "The Arcade Art Gallery",
      superuserEmail
    })

    return NextResponse.json({ 
      ok: true, 
      userId: invitation.id,
      message: `Custom invitation sent to ${email}` 
    })
  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error.message || 'Invite failed' }, { status: 500 })
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
Subject: [COPY] Artist Invitation Sent to ${originalRecipient}

Hi there,

This is a copy of the artist invitation that was just sent to ${originalRecipient} for your records.

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

  console.log('SUPERUSER COPY EMAIL:')
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
    subject: `[COPY] Artist Invitation Sent to ${originalRecipient}`,
    html: generateSuperuserCopyHTMLTemplate({ originalRecipient, inviteLink, customMessage, galleryName })
  })
  */
}
