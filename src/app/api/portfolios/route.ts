import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSupabaseServer } from '@/lib/supabase';
import { isReservedSlug } from '@/lib/slug-utils';

export const dynamic = 'force-dynamic';

function isAdmin(user: any) {
  return Boolean(
    user?.app_metadata?.roles?.includes?.('admin') ||
    (typeof user?.user_metadata?.role === 'string' && user.user_metadata.role.toLowerCase() === 'admin') ||
    user?.user_metadata?.is_admin === true
  );
}

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req as any, res as any);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, displayName: true, accentColor: true, colorMode: true, userId: true },
  });
  return NextResponse.json({ portfolios });
}

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const supabase = getSupabaseServer(req as any, res as any);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { slug, displayName, ownerUserId, ownerEmail, accentColor, colorMode } = body || {};
  if (!slug || !displayName || (!ownerUserId && !ownerEmail)) {
    return NextResponse.json({ error: 'slug, displayName, and ownerUserId or ownerEmail are required' }, { status: 400 });
  }
  if (isReservedSlug(slug)) {
    return NextResponse.json({ error: 'Slug is reserved' }, { status: 400 });
  }

  // Ensure owner exists
  const owner = ownerUserId
    ? await prisma.user.findUnique({ where: { id: ownerUserId } })
    : await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!owner) return NextResponse.json({ error: 'Owner user not found' }, { status: 404 });

  try {
    const created = await prisma.portfolio.create({
      data: {
        slug,
        displayName,
        userId: owner.id,
        accentColor: accentColor || 'green',
        colorMode: colorMode || 'dark',
      },
      select: { id: true, slug: true, displayName: true },
    });
    // Auto-create a hidden commissions gallery for the owner if not exists
    const baseSlug = 'commissions'
    const existing = await prisma.gallery.findFirst({ 
      where: { 
        userId: owner.id, 
        slug: baseSlug 
      } 
    })
    if (!existing) {
      await prisma.gallery.create({
        data: {
          userId: owner.id,
          name: 'Commissions',
          description: 'Commission examples and price points',
          isPublic: false,
          slug: baseSlug,
        },
      })
    }
    return NextResponse.json({ portfolio: created });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
