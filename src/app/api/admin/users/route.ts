import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireSuperAdmin, isAdmin, isSuperAdmin, ensureLocalUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendEmail, generateInvitationEmailHTML, generateSuperuserCopyEmailHTML } from '@/lib/email'

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

    // Send a copy to superuser for record keeping
    const superuserEmail = process.env.SUPERADMIN_EMAIL || 'austen@thearcades.me'
    await sendSuperuserCopyEmail({
      originalRecipient: email,
      inviteLink,
      customMessage: `You have been invited as ${role === 'admin' ? 'an administrator' : 'an artist'}.`,
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
    subject: `[COPY] User Invitation Sent to ${originalRecipient}`,
    html
  })
}

