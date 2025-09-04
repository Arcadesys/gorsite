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
    const uploads = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPublic: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
              },
            },
          },
        },
        artistPortfolio: {
          select: {
            id: true,
            slug: true,
            displayName: true,
          },
        },
      },
    });

    // Transform the data to include user information at the top level for easier access
    const uploadsWithUserInfo = uploads.map(upload => ({
      ...upload,
      user: upload.gallery.user,
      galleryName: upload.gallery.name,
      gallerySlug: upload.gallery.slug,
      galleryIsPublic: upload.gallery.isPublic,
    }));

    return NextResponse.json(uploadsWithUserInfo);
  } catch (error) {
    console.error('Failed to fetch admin uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}