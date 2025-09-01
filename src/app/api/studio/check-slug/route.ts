import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isReservedSlug } from '@/lib/slug-utils'
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// GET /api/studio/check-slug - Check if portfolio slug is available for current user
export async function GET(req: NextRequest) {
  const authRes = await requireUser(req)
  if (authRes instanceof NextResponse) return authRes
  const { user, res } = authRes
  await ensureLocalUser(user)

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400, headers: res.headers })
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
    return NextResponse.json({ 
      available: false, 
      error: 'Slug must be at least 3 characters and contain only lowercase letters, numbers, and hyphens' 
    }, { status: 400, headers: res.headers })
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json({
      available: false,
      error: 'This slug is reserved'
    }, { status: 400, headers: res.headers })
  }

  try {
    // Get current user's portfolio
    const currentPortfolio = await prisma.portfolio.findFirst({ 
      where: { userId: user.id },
      select: { slug: true }
    })

    // If it's their current slug, it's available to them
    if (currentPortfolio?.slug === slug) {
      return NextResponse.json({
        available: true,
        slug,
        isCurrent: true
      }, { headers: res.headers })
    }

    // Check if any other portfolio uses this slug
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { slug },
      select: { id: true, userId: true }
    })

    return NextResponse.json({
      available: !existingPortfolio,
      slug,
      isCurrent: false
    }, { headers: res.headers })
  } catch (error: any) {
    console.error('Slug check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check slug availability' 
    }, { status: 500, headers: res.headers })
  }
}
