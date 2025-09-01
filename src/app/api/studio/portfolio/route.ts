import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 404, headers: res.headers })
  return NextResponse.json({ portfolio }, { headers: res.headers })
}

export async function PATCH(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 404, headers: res.headers })
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  for (const k of ['displayName','description','about','accentColor','colorMode','logoUrl','heroImageLight','heroImageDark','heroImageMobile'] as const) {
    if (typeof (body as any)[k] === 'string' || (body as any)[k] === null) (data as any)[k] = (body as any)[k]
  }
  const updated = await prisma.portfolio.update({ where: { id: portfolio.id }, data })
  return NextResponse.json({ portfolio: updated }, { headers: res.headers })
}

