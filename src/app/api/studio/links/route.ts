import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

// GET: List all links for the authenticated artist's portfolio
export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 400, headers: res.headers })

  const links = await prisma.link.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
  })

  return NextResponse.json({ links }, { headers: res.headers })
}

// POST: Create a new link
export async function POST(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 400, headers: res.headers })

  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : undefined
  const position = typeof body.position === 'number' ? body.position : undefined
  const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : true

  if (!title || !url) {
    return NextResponse.json({ error: 'Title and URL are required' }, { status: 400, headers: res.headers })
  }

  const created = await prisma.link.create({
    data: {
      portfolioId: portfolio.id,
      title,
      url,
      imageUrl,
      position,
      isPublic,
    }
  })

  return NextResponse.json({ link: created }, { headers: res.headers })
}

