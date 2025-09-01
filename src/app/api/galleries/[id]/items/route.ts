import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers';

async function ensureOwner(userId: string, galleryId: string) {
  const g = await prisma.gallery.findUnique({ where: { id: galleryId } });
  if (!g || g.userId !== userId) return null;
  return g;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  const { id } = await context.params;
  const g = await ensureOwner(user.id, id);
  if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });

  const items = await prisma.galleryItem.findMany({
    where: { galleryId: g.id },
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' },
    ],
  });
  return NextResponse.json(items, { headers: res.headers });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  const { id } = await context.params;
  const g = await ensureOwner(user.id, id);
  if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });

  const body = await req.json();
  
  // Validate and format input data carefully
  const title: string = body?.title?.toString()?.trim();
  const imageUrl: string = body?.imageUrl?.toString()?.trim();
  const description: string | undefined = body?.description?.toString()?.trim() || undefined;
  const altText: string | undefined = body?.altText?.toString()?.trim() || undefined;
  
  // Artist attribution fields
  const artistName: string | undefined = body?.artistName?.toString()?.trim() || undefined;
  const artistPortfolioSlug: string | undefined = body?.artistPortfolioSlug?.toString()?.trim() || undefined;
  const artistExternalUrl: string | undefined = body?.artistExternalUrl?.toString()?.trim() || undefined;
  const isOriginalWork: boolean = body?.isOriginalWork !== undefined ? Boolean(body.isOriginalWork) : true;
  
  // Ensure position is a proper integer or null
  let position: number | undefined;
  if (typeof body?.position === 'number' && !isNaN(body.position)) {
    position = Math.floor(body.position);
  }
  
  // Handle tags properly - ensure it's either a valid JSON string or undefined
  let tags: string | undefined;
  if (Array.isArray(body?.tags)) {
    tags = JSON.stringify(body.tags.map((t: any) => String(t).trim()).filter(Boolean));
  } else if (typeof body?.tags === 'string' && body.tags.trim()) {
    // Validate it's valid JSON if it's a string
    try {
      JSON.parse(body.tags);
      tags = body.tags.trim();
    } catch {
      // If not valid JSON, treat as comma-separated and convert
      tags = JSON.stringify(body.tags.split(',').map((t: string) => t.trim()).filter(Boolean));
    }
  }

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!imageUrl) return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });

  // Validate artist portfolio slug if provided
  if (artistPortfolioSlug) {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { slug: artistPortfolioSlug },
        select: { id: true, displayName: true }
      });
      if (!portfolio) {
        return NextResponse.json({ error: 'Artist portfolio not found' }, { status: 400 });
      }
    } catch (portfolioError) {
      console.warn('[gallery-items] Portfolio validation error:', portfolioError);
      // Continue without validation if there's an error
    }
  }

  try {
    const created = await prisma.galleryItem.create({
      data: {
        galleryId: g.id,
        title,
        imageUrl,
        description,
        altText,
        position,
        tags,
        // Note: Artist attribution fields will be added after database migration
        // artistName,
        // artistPortfolioSlug,
        // artistExternalUrl,
        // isOriginalWork,
      },
    });
    return NextResponse.json(created, { status: 201, headers: res.headers });
  } catch (error) {
    console.error('[gallery-items] Database error creating item:', {
      error,
      data: { galleryId: g.id, title, imageUrl, description, altText, position, tags, artistName, artistPortfolioSlug, artistExternalUrl, isOriginalWork }
    });
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500, headers: res.headers });
  }
}
