import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { ensureLocalUser } from '@/lib/auth-helpers';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req, res);
  
  // Auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure user exists in local database
    await ensureLocalUser(user);

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '6');

    // Get recent artworks from user's galleries
    const recentArtworks = await prisma.galleryItem.findMany({
      where: {
        gallery: {
          userId: user.id
        }
      },
      include: {
        gallery: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                portfolios: {
                  select: {
                    slug: true
                  },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Format the response to match the expected interface
    const formattedArtworks = recentArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      imageUrl: artwork.imageUrl,
      galleryName: artwork.gallery.name,
      createdAt: artwork.createdAt.toISOString(),
      artistName: artwork.artistName || artwork.gallery.user.name || 'Unknown Artist',
      artistPortfolioSlug: artwork.artistPortfolioSlug || artwork.gallery.user.portfolios[0]?.slug,
      artistExternalUrl: artwork.artistExternalUrl,
      isOriginalWork: artwork.isOriginalWork
    }));

    return NextResponse.json({ artworks: formattedArtworks });

  } catch (error) {
    console.error('[recent-artworks] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent artworks' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}