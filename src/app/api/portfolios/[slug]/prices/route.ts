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

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } })
  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const prices = await prisma.commissionPrice.findMany({ where: { portfolioId: portfolio.id }, orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] })
  return NextResponse.json({ prices })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const res = new NextResponse()
  const supabase = getSupabaseServer(req as any, res as any)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params;
  const portfolio = await prisma.portfolio.findUnique({ where: { slug } })
  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { title, description, price, imageUrl, position, active = true } = body
  if (!title || typeof price !== 'number') return NextResponse.json({ error: 'Missing title or price' }, { status: 400 })

  const created = await prisma.commissionPrice.create({
    data: { portfolioId: portfolio.id, title, description, price, imageUrl, position, active },
  })
  // If imageUrl present, attach to commissions gallery
  if (imageUrl) {
    const commissionsGallery = await prisma.gallery.findFirst({ 
      where: { 
        userId: portfolio.userId, 
        slug: 'commissions' 
      } 
    })
    if (commissionsGallery) {
      const item = await prisma.galleryItem.create({
        data: {
          galleryId: commissionsGallery.id,
          title,
          description: description || null,
          imageUrl,
          altText: title,
        },
      })
      await prisma.commissionPrice.update({ where: { id: created.id }, data: { galleryItemId: item.id } })
    }
  }
  return NextResponse.json({ price: created })
}
