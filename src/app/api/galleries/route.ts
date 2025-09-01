import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, ensureLocalUser } from '@/lib/auth-helpers';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(req: NextRequest) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user } = authRes;
  await ensureLocalUser(user);

  const galleries = await prisma.gallery.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(galleries);
}

export async function POST(req: NextRequest) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user } = authRes;
  await ensureLocalUser(user);

  const body = await req.json();
  const name: string = body?.name?.toString()?.trim();
  const description: string | undefined = body?.description?.toString();
  const isPublic: boolean = body?.isPublic !== false; // default true
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  let base = slugify(name);
  if (!base) base = 'gallery';

  // Ensure unique slug per user
  let slug = base;
  let i = 1;
  while (
    await prisma.gallery.findUnique({ where: { userId_slug: { userId: user.id, slug } } })
  ) {
    slug = `${base}-${i++}`;
  }

  const created = await prisma.gallery.create({
    data: {
      userId: user.id,
      name,
      description,
      isPublic,
      slug,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
