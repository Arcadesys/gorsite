import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the portfolio by slug
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Fetch public links for this portfolio
    const links = await prisma.link.findMany({
      where: { 
        portfolioId: portfolio.id, 
        isPublic: true 
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        url: true
      }
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching artist links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}