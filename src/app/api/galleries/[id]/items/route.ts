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
  const title: string = body?.title?.toString()?.trim();
  const imageUrl: string = body?.imageUrl?.toString()?.trim();
  const description: string | undefined = body?.description?.toString();
  const altText: string | undefined = body?.altText?.toString();
  const position: number | undefined = typeof body?.position === 'number' ? body.position : undefined;
  let tags: string | undefined;
  if (Array.isArray(body?.tags)) tags = JSON.stringify(body.tags.map((t: any) => String(t)));
  else if (typeof body?.tags === 'string') tags = body.tags; // Assume already JSON or CSV

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!imageUrl) return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });

  const created = await prisma.galleryItem.create({
    data: {
      galleryId: g.id,
      title,
      imageUrl,
      description,
      altText,
      position,
      tags,
    },
  });
  return NextResponse.json(created, { status: 201, headers: res.headers });
}
