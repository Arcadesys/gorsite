import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

function isAdminUser(u: any) {
  return Boolean(
    u?.app_metadata?.roles?.includes?.('admin') ||
    (typeof u?.user_metadata?.role === 'string' && u.user_metadata.role.toLowerCase() === 'admin') ||
    u?.user_metadata?.is_admin === true
  )
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}))
  const superEmail = (process.env.SUPERADMIN_EMAIL || 'austen@artpop.vercel.app').toLowerCase()
  if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  if (email.toLowerCase() !== superEmail) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = getSupabaseAdmin()

  // If any admin already exists (other than this email), abort to avoid abuse
  let page = 1
  const perPage = 200
  for (let i = 0; i < 10; i++) {
    const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data?.users) break
    const someoneElseIsAdmin = data.users.some((u: any) => isAdminUser(u) && (u.email || '').toLowerCase() !== superEmail)
    if (someoneElseIsAdmin) {
      return NextResponse.json({ error: 'Admin already provisioned' }, { status: 409 })
    }
    if (data.users.length < perPage) break
    page++
  }

  // Try to find existing user by listing; create or update accordingly
  page = 1
  let existing: any | null = null
  for (let i = 0; i < 10 && !existing; i++) {
    const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    existing = data?.users?.find((u: any) => (u.email || '').toLowerCase() === superEmail) || null
    if (data?.users?.length < perPage) break
    page++
  }

  if (!existing) {
    const { data, error } = await (admin as any).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_admin: true, role: 'ADMIN' },
      app_metadata: { roles: ['admin'] },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, created: true, userId: data.user?.id })
  }

  const { error: updErr } = await (admin as any).auth.admin.updateUserById(existing.id, {
    password,
    user_metadata: { ...(existing.user_metadata || {}), is_admin: true, role: 'ADMIN' },
    app_metadata: { ...(existing.app_metadata || {}), roles: ['admin'] },
  })
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  return NextResponse.json({ ok: true, created: false, userId: existing.id })
}

