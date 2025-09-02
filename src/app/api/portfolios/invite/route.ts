import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail, generateInvitationEmailHTML, generateSuperuserCopyEmailHTML } from '@/lib/email'
import { getBaseUrl } from '@/lib/base-url'

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
    const baseUrl = getBaseUrl()
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
  const html = generateInvitationEmailHTML({
    inviteLink,
    customMessage,
    galleryName
  })

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
    html
  })
}
