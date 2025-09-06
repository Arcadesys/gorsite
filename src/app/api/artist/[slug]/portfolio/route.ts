import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        displayName: true,
        description: true,
        primaryColor: true,
        secondaryColor: true,
        footerText: true,
        isPublic: true
      }
    }) as any;

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    if (!portfolio.isPublic) {
      return NextResponse.json({ error: 'Portfolio not public' }, { status: 403 });
    }

    return NextResponse.json({ portfolio });

  } catch (error) {
    console.error('[artist-portfolio] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}