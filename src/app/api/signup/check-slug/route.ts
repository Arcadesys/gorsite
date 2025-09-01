import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/signup/check-slug - Check if portfolio slug is available
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
    return NextResponse.json({ 
      available: false, 
      error: 'Slug must be at least 3 characters and contain only lowercase letters, numbers, and hyphens' 
    }, { status: 400 })
  }

  try {
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { slug }
    })

    return NextResponse.json({
      available: !existingPortfolio,
      slug
    })
  } catch (error: any) {
    console.error('Slug check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check slug availability' 
    }, { status: 500 })
  }
}