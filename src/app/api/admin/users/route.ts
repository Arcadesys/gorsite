import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireSuperAdmin, isAdmin, isSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || '1')
  const perPage = Math.min(Number(searchParams.get('perPage') || '50'), 200)
  const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const currentUserIsSuperAdmin = isSuperAdmin(user)

  const users = (data?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    email_confirmed_at: u.email_confirmed_at,
    roles: u.app_metadata?.roles || [],
    role: u.user_metadata?.role,
    is_admin: Boolean(u.user_metadata?.is_admin),
    is_superadmin: currentUserIsSuperAdmin && isSuperAdmin(u),
    is_deactivated: Boolean(u.user_metadata?.deactivated),
    banned_until: u.banned_until,
    can_manage: currentUserIsSuperAdmin && u.email !== user.email, // Can't manage yourself
  }))
  return NextResponse.json({ users, count: data?.users?.length || 0 })
}

export async function POST(req: NextRequest) {
  const result = await requireSuperAdmin(req)
  if (result instanceof NextResponse) {
    return result
  }

  const { email, role } = await req.json().catch(() => ({}))
  if (!email || !role) return NextResponse.json({ error: 'Missing email or role' }, { status: 400 })

  try {
    // Ensure inviter exists in local DB for FK integrity
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
        customMessage: `You have been invited as ${role === 'admin' ? 'an administrator' : 'an artist'}.`,
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
      customMessage: `You have been invited as ${role === 'admin' ? 'an administrator' : 'an artist'}.`,
      galleryName: "The Arcade Art Gallery"
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

export async function PATCH(req: NextRequest) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, role } = await req.json().catch(() => ({}))
  if (!id || !role) return NextResponse.json({ error: 'Missing id or role' }, { status: 400 })
  const admin = getSupabaseAdmin()
  const roles = role.toLowerCase() === 'admin' ? ['admin'] : ['artist']
  const userMeta: any = role.toLowerCase() === 'admin'
    ? { is_admin: true, role: 'ADMIN' }
    : { is_admin: false, role: 'ARTIST' }

  const { error } = await (admin as any).auth.admin.updateUserById(id, {
    user_metadata: userMeta,
    app_metadata: { roles },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
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

You've been invited to create your account on ${galleryName}!

${customMessage ? `\nPersonal message:\n${customMessage}\n` : ''}

Getting started is easy:
1. Click the link below to accept your invitation
2. Choose your unique artist URL (your "slug")
3. Create a secure password
4. Set up your profile

Ready to get started? Click here:
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

