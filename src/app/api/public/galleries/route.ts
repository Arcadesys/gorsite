import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const galleries = await prisma.gallery.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    select: { 
      id: true, 
      name: true, 
      slug: true, 
      description: true, 
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          portfolios: {
            select: {
              slug: true,
              displayName: true,
              profileImageUrl: true
            },
            take: 1
          }
        }
      }
    },
  });
  return NextResponse.json(galleries);
}

