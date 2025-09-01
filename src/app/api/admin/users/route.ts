import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

function isAdmin(user: any) {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  )
}

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

  const users = (data?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    roles: u.app_metadata?.roles || [],
    role: u.user_metadata?.role,
    is_admin: Boolean(u.user_metadata?.is_admin),
  }))
  return NextResponse.json({ users, count: data?.users?.length || 0 })
}

export async function POST(req: NextRequest) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, role } = await req.json().catch(() => ({}))
  if (!email || !role) return NextResponse.json({ error: 'Missing email or role' }, { status: 400 })
  const admin = getSupabaseAdmin()
  const redirectTo = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` : 'http://localhost:3000/auth/callback'

  const roles = role.toLowerCase() === 'admin' ? ['admin'] : ['artist']
  const userMeta: any = role.toLowerCase() === 'admin'
    ? { is_admin: true, role: 'ADMIN' }
    : { role: 'ARTIST' }

  const { data, error } = await (admin as any).auth.admin.inviteUserByEmail(email, {
    data: userMeta,
    app_metadata: { roles },
    redirectTo,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, userId: data?.user?.id })
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

