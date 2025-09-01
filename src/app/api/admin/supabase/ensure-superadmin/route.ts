import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, findUserIdByEmail } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  const superEmail = email || process.env.SUPERADMIN_EMAIL
  const token = req.headers.get('x-setup-token')
  const expected = process.env.SETUP_TOKEN

  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!superEmail) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Find or invite
  let userId = await findUserIdByEmail(admin, superEmail)
  if (!userId) {
    const redirectTo = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login` : undefined
    const { data, error } = await (admin as any).auth.admin.inviteUserByEmail(superEmail, {
      data: { is_admin: true, role: 'ADMIN' },
      app_metadata: { roles: ['admin'] },
      redirectTo,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    userId = data?.user?.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'Failed to create or find user' }, { status: 500 })
  }

  // Ensure metadata flags are set
  const { error: updErr } = await (admin as any).auth.admin.updateUserById(userId, {
    user_metadata: { is_admin: true, role: 'ADMIN' },
    app_metadata: { roles: ['admin'] },
  })
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId })
}
