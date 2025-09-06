import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/portfolio/customization - Get current user's portfolio customization settings
export async function GET(req: NextRequest) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;

  try {
    // Find user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: user.id },
      select: {
        slug: true,
        isPublic: true,
        primaryColor: true,
        secondaryColor: true,
        footerText: true,
      },
    }) as any;

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404, headers: res.headers }
      );
    }

    return NextResponse.json(
      {
        slug: portfolio.slug,
        isPublic: portfolio.isPublic,
        primaryColor: portfolio.primaryColor || '#10b981',
        secondaryColor: portfolio.secondaryColor || '#059669',
        footerText: portfolio.footerText || '',
      },
      { headers: res.headers }
    );
  } catch (error: any) {
    console.error('Get customization error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization settings' },
      { status: 500, headers: res.headers }
    );
  }
}

// PATCH /api/portfolio/customization - Update current user's portfolio customization settings
export async function PATCH(req: NextRequest) {
  const authRes = await requireUser(req);
  if (authRes instanceof NextResponse) return authRes;
  const { user, res } = authRes;

  try {
    const body = await req.json();
    const { primaryColor, secondaryColor, footerText } = body;

    // Validate color format (basic hex validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json(
        { error: 'Invalid primary color format' },
        { status: 400, headers: res.headers }
      );
    }

    if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
      return NextResponse.json(
        { error: 'Invalid secondary color format' },
        { status: 400, headers: res.headers }
      );
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.updateMany({
      where: { userId: user.id },
      data: {
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(footerText !== undefined && { footerText }),
      },
    });

    if (updatedPortfolio.count === 0) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404, headers: res.headers }
      );
    }

    return NextResponse.json(
      { 
        message: 'Customization updated successfully',
        primaryColor,
        secondaryColor,
        footerText,
      },
      { headers: res.headers }
    );
  } catch (error: any) {
    console.error('Update customization error:', error);
    return NextResponse.json(
      { error: 'Failed to update customization settings' },
      { status: 500, headers: res.headers }
    );
  }
}