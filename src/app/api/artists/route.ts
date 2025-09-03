import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Fetch all portfolios with their display names and slugs
    const portfolios = await prisma.portfolio.findMany({
      select: {
        slug: true,
        displayName: true,
        user: {
          select: {
            status: true
          }
        }
      },
      // Only include portfolios from active users
      where: {
        user: {
          status: 'ACTIVE'
        }
      },
      orderBy: {
        displayName: 'asc'
      }
    })

    const artists = portfolios.map(portfolio => ({
      slug: portfolio.slug,
      displayName: portfolio.displayName
    }))

    return NextResponse.json({ artists })
  } catch (error: any) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}