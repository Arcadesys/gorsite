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

export async function POST(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, portfolioSlug } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const admin = getSupabaseAdmin()
  const redirectTo = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/login` : undefined
  const { data, error } = await (admin as any).auth.admin.inviteUserByEmail(email, {
    data: { role: 'ARTIST', portfolioSlug },
    app_metadata: { roles: ['artist'] },
    redirectTo,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, userId: data?.user?.id }, { headers: res.headers })
}
