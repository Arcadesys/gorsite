import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const gallery = await prisma.gallery.findUnique({ where: { slug: params.slug } });
  if (!gallery || !gallery.isPublic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const items = await prisma.galleryItem.findMany({
    where: { galleryId: gallery.id },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, title: true, description: true, imageUrl: true, altText: true, tags: true, createdAt: true },
  });
  return NextResponse.json({ gallery: { id: gallery.id, name: gallery.name, slug: gallery.slug, description: gallery.description }, items });
}

