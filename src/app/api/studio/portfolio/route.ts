import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'
import { baseFromEmail, isReservedSlug, sanitizeSlug } from '@/lib/slug-utils'

export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user } = authRes
  await ensureLocalUser(user)
  let portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } })
  if (!portfolio) {
    // Auto-create a portfolio for the user if missing
    let base = baseFromEmail(user.email)

    // Ensure global uniqueness for slug
    let slug = base
    let i = 1
    while (isReservedSlug(slug) || await prisma.portfolio.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`
    }

    const displayName =
      (user.user_metadata as any)?.display_name ||
      (user.user_metadata as any)?.full_name ||
      base ||
      'Artist'

    portfolio = await prisma.portfolio.create({
      data: {
        slug,
        displayName,
        description: `Welcome to ${displayName}'s art gallery!`,
        userId: user.id,
        accentColor: 'green',
        colorMode: 'dark',
      },
    })

    // Ensure hidden commissions gallery exists for user
    const baseSlug = 'commissions'
    const existing = await prisma.gallery.findFirst({ where: { userId: user.id, slug: baseSlug } })
    if (!existing) {
      await prisma.gallery.create({
        data: {
          userId: user.id,
          name: 'Commissions',
          description: 'Commission examples and price points',
          isPublic: false,
          slug: baseSlug,
        },
      })
    }
  }
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
  for (const k of ['slug','displayName','description','about','accentColor','colorMode','logoUrl','heroImageLight','heroImageDark','heroImageMobile','bio','location','website','profileImageUrl','bannerImageUrl','isPublic'] as const) {
    if (typeof (body as any)[k] === 'string' || (body as any)[k] === null || typeof (body as any)[k] === 'boolean') {
      if (k === 'slug') {
        // Validate slug format
        const slug = (body as any)[k]
        if (slug && slug !== portfolio.slug) {
          if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
            return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
          }
          if (isReservedSlug(slug)) {
            return NextResponse.json({ error: 'Slug is reserved' }, { status: 400 })
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
  
  // Handle socialLinks JSON field
  if (Object.prototype.hasOwnProperty.call(body, 'socialLinks')) {
    const socialLinks = (body as any).socialLinks
    if (socialLinks === null || (typeof socialLinks === 'object' && socialLinks)) {
      data.socialLinks = socialLinks
    }
  }
  
  // Handle featured item assignment for the artist's main gallery image
  if (Object.prototype.hasOwnProperty.call(body, 'featuredItemId')) {
    const featuredItemId = (body as any).featuredItemId as string | null
    if (featuredItemId === null) {
      data.featuredItemId = null
    } else if (typeof featuredItemId === 'string' && featuredItemId.trim()) {
      // Ensure the item belongs to one of the user's galleries
      const item = await prisma.galleryItem.findUnique({ where: { id: featuredItemId } })
      if (!item) {
        return NextResponse.json({ error: 'Featured item not found' }, { status: 400 })
      }
      const gallery = await prisma.gallery.findUnique({ where: { id: item.galleryId }, select: { userId: true } })
      if (!gallery || gallery.userId !== user.id) {
        return NextResponse.json({ error: 'Not allowed to feature this item' }, { status: 403 })
      }
      data.featuredItemId = featuredItemId
    }
  }
  
  const updated = await prisma.portfolio.update({ where: { id: portfolio.id }, data })
  return NextResponse.json({ portfolio: updated })
}
