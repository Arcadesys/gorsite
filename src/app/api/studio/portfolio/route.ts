import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 404 })
  return NextResponse.json({ portfolio })
}

export async function PATCH(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user } = authRes
  await ensureLocalUser(user)
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) return NextResponse.json({ error: 'No portfolio' }, { status: 404 })
  
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  
  // Handle all updateable fields including slug
  for (const k of ['slug','displayName','description','about','accentColor','colorMode','logoUrl','heroImageLight','heroImageDark','heroImageMobile'] as const) {
    if (typeof (body as any)[k] === 'string' || (body as any)[k] === null) {
      if (k === 'slug') {
        // Validate slug format
        const slug = (body as any)[k]
        if (slug && slug !== portfolio.slug) {
          if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
            return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
          }
          
          // Check if slug is available (not taken by another portfolio)
          const existingPortfolio = await prisma.portfolio.findUnique({ 
            where: { slug },
            select: { id: true, userId: true }
          })
          
          if (existingPortfolio && existingPortfolio.userId !== user.id) {
            return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
          }
        }
      }
      (data as any)[k] = (body as any)[k]
    }
  }
  
  const updated = await prisma.portfolio.update({ where: { id: portfolio.id }, data })
  return NextResponse.json({ portfolio: updated })
}

