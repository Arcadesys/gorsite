import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Note: Gallery doesn't have a unique slug field globally, so we need to find by userId_slug composite key
  // For now, let's search all galleries with this slug and return the first public one
  const gallery = await prisma.gallery.findFirst({ 
    where: { slug, isPublic: true },
    include: { user: { select: { id: true } } }
  });
  if (!gallery || !gallery.isPublic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const items = await prisma.galleryItem.findMany({
    where: { galleryId: gallery.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, description: true, imageUrl: true, altText: true, tags: true, createdAt: true },
  });
  return NextResponse.json({ gallery: { id: gallery.id, name: gallery.name, slug: gallery.slug, description: gallery.description }, items });
}

