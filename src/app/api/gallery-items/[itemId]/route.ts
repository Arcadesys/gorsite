import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers';

async function ensureItemOwner(userId: string, itemId: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id: itemId }, include: { gallery: true } });
  if (!item || item.gallery.userId !== userId) return null;
  return item;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  
  const { itemId } = await params;
  const existing = await ensureItemOwner(user.id, itemId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });

  const body = await req.json();
  const data: any = {};
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.description === 'string' || body.description === null) data.description = body.description;
  if (typeof body.imageUrl === 'string') data.imageUrl = body.imageUrl;
  if (typeof body.altText === 'string' || body.altText === null) data.altText = body.altText;
  if (typeof body.position === 'number' || body.position === null) data.position = body.position;
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags.map((t: any) => String(t)));
  else if (typeof body.tags === 'string' || body.tags === null) data.tags = body.tags;

  const updated = await prisma.galleryItem.update({ where: { id: existing.id }, data });
  return NextResponse.json(updated, { headers: res.headers });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  
  const { itemId } = await params;
  const existing = await ensureItemOwner(user.id, itemId);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });
  await prisma.galleryItem.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}

