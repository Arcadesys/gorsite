import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ prices: [] }, { headers: res.headers })
  const prices = await prisma.commissionPrice.findMany({ where: { portfolioId: portfolio.id }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] })
  return NextResponse.json({ prices }, { headers: res.headers })
}

export async function POST(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 400, headers: res.headers })
  const body = await req.json().catch(() => ({}))
  const { title, description, price, imageUrl, position, active = true } = body
  if (!title || typeof price !== 'number') return NextResponse.json({ error: 'Missing title or price' }, { status: 400 })
  const created = await prisma.commissionPrice.create({ data: { portfolioId: portfolio.id, title, description, price, imageUrl, position, active } })
  // commissions gallery linkage
  if (imageUrl) {
    const commissionsGallery = await prisma.gallery.findUnique({ where: { userId_slug: { userId: user.id, slug: 'commissions' } } })
    if (commissionsGallery) {
      const item = await prisma.galleryItem.create({ data: { galleryId: commissionsGallery.id, title, description: description || null, imageUrl, altText: title } })
      await prisma.commissionPrice.update({ where: { id: created.id }, data: { galleryItemId: item.id } })
    }
  }
  return NextResponse.json({ price: created }, { headers: res.headers })
}

