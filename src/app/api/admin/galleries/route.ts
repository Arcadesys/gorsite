import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Require superadmin privileges
  const result = await requireSuperAdmin(req);
  if (result instanceof NextResponse) {
    return result;
  }

  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          take: 4, // Get first 4 items for preview
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            title: true,
            imageUrl: true,
            artistName: true,
            artistPortfolioSlug: true,
            artistExternalUrl: true,
            isOriginalWork: true,
          },
        },
      },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error('Failed to fetch admin galleries:', error);
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}