import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase'

function isAdmin(user: any) {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  )
}

async function ensureOwner(userId: string, slug: string) {
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } })
  if (!portfolio) return null
  const ownerId = portfolio.userId
  return ownerId === userId ? portfolio : null
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  const res = NextResponse.next()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: params.slug } })
  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin(user) && user.id !== portfolio.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.description === 'string' || body.description === null) data.description = body.description
  if (typeof body.price === 'number') data.price = body.price
  if (typeof body.imageUrl === 'string' || body.imageUrl === null) data.imageUrl = body.imageUrl
  if (typeof body.position === 'number' || body.position === null) data.position = body.position
  if (typeof body.active === 'boolean') data.active = body.active

  const updated = await prisma.commissionPrice.update({ where: { id: params.id }, data })
  return NextResponse.json({ price: updated }, { headers: res.headers })
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string, id: string } }) {
  const res = NextResponse.next()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const portfolio = await prisma.portfolio.findUnique({ where: { slug: params.slug } })
  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!isAdmin(user) && user.id !== portfolio.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.commissionPrice.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true }, { headers: res.headers })
}

