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
  return NextResponse.json(g, { headers: res.headers });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  const { id } = await context.params;
  const g = await ensureOwner(user.id, id);
  if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });

  const body = await req.json();
  const data: any = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.description === 'string' || body.description === null) data.description = body.description;
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic;
  const updated = await prisma.gallery.update({ where: { id: g.id }, data });
  return NextResponse.json(updated, { headers: res.headers });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  const { id } = await context.params;
  const g = await ensureOwner(user.id, id);
  if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });
  await prisma.gallery.delete({ where: { id: g.id } });
  return NextResponse.json({ ok: true }, { headers: res.headers });
}
