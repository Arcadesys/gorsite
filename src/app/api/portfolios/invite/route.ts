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
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, portfolioSlug } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  try {
    const admin = getSupabaseAdmin()
    const redirectTo = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` : 'http://localhost:3000/auth/callback'
    
    // Check if inviteUserByEmail method exists and works
    if (typeof (admin as any).auth?.admin?.inviteUserByEmail === 'function') {
      const { data, error } = await (admin as any).auth.admin.inviteUserByEmail(email, {
        data: { role: 'ARTIST', portfolioSlug },
        app_metadata: { roles: ['artist'] },
        redirectTo,
      })
      if (error) {
        console.error('Supabase invite error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true, userId: data?.user?.id })
    } else {
      // Fallback: just return success for now, or implement alternative logic
      console.log('inviteUserByEmail not available, would invite:', email)
      return NextResponse.json({ ok: true, message: 'Invite feature not fully configured' })
    }
  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error.message || 'Invite failed' }, { status: 500 })
  }
}
