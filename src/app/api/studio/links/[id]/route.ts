import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 400, headers: res.headers })

  const { id } = await params
  const existing = await prisma.link.findUnique({ where: { id } })
  if (!existing || existing.portfolioId !== portfolio.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers })
  }

  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.url === 'string') data.url = body.url
  if (typeof body.imageUrl === 'string' || body.imageUrl === null) data.imageUrl = body.imageUrl
  if (typeof body.position === 'number' || body.position === null) data.position = body.position
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic

  const updated = await prisma.link.update({ where: { id }, data })
  return NextResponse.json({ link: updated }, { headers: res.headers })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 400, headers: res.headers })

  const { id } = await params
  const existing = await prisma.link.findUnique({ where: { id } })
  if (!existing || existing.portfolioId !== portfolio.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers })
  }

  await prisma.link.delete({ where: { id } })
  return NextResponse.json({ ok: true }, { headers: res.headers })
}

