import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers';

async function ensureOwner(userId: string, galleryId: string) {
  const g = await prisma.gallery.findUnique({ where: { id: galleryId } });
  if (!g || g.userId !== userId) return null;
  return g;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;
  await ensureLocalUser(user);
  const { id } = await context.params;
  const g = await ensureOwner(user.id, id);
  if (!g) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: res.headers });

  const body = await req.json().catch(() => ({}));
  const order: string[] = Array.isArray(body.order) ? body.order.map((s: any) => String(s)) : [];
  if (!order.length) return NextResponse.json({ error: 'order is required' }, { status: 400, headers: res.headers });

  // Ensure items belong to this gallery
  const items = await prisma.galleryItem.findMany({ where: { galleryId: g.id, id: { in: order } }, select: { id: true } });
  const validIds = new Set(items.map(i => i.id));
  let pos = 1;
  await prisma.$transaction(
    order
      .filter(id => validIds.has(id))
      .map(id => prisma.galleryItem.update({ where: { id }, data: { position: pos++ } }))
  );

  return NextResponse.json({ ok: true }, { headers: res.headers });
}
