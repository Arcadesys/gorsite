import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

import { GET as getAdminGalleries } from '../src/app/api/admin/galleries/route';

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => {
  return {
    requireSuperAdmin: vi.fn(async (req: any) => {
      const url = new URL(req.url);
      if (url.searchParams.get('unauthorized') === 'true') {
        return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
      }
      return { user: { id: 'super-admin-1', email: 'admin@example.com' }, res: new NextResponse() };
    }),
  };
});

// In-memory pseudo DB
const db: any = {
  galleries: [
    {
      id: 'gallery-1',
      name: 'Artist Gallery',
      slug: 'artist-gallery',
      description: 'A test gallery',
      isPublic: true,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      user: {
        id: 'user-1',
        name: 'Test Artist',
        email: 'artist@example.com',
        role: 'USER',
        status: 'ACTIVE',
      },
      _count: { items: 3 },
      items: [
        {
          id: 'item-1',
          title: 'Artwork 1',
          imageUrl: 'https://example.com/image1.jpg',
          artistName: 'Test Artist',
          isOriginalWork: true,
        },
      ],
    },
    {
      id: 'gallery-2',
      name: 'Private Gallery',
      slug: 'private-gallery',
      description: null,
      isPublic: false,
      createdAt: new Date('2024-01-02T10:00:00Z'),
      user: {
        id: 'user-2',
        name: 'Another Artist',
        email: 'artist2@example.com',
        role: 'USER',
        status: 'ACTIVE',
      },
      _count: { items: 0 },
      items: [],
    },
  ],
};

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      gallery: {
        findMany: vi.fn(async () => {
          return db.galleries;
        }),
      },
    },
  };
});

describe('Admin Galleries API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return all galleries for superadmin', async () => {
    const req = new Request('http://test/api/admin/galleries', { method: 'GET' });
    const res: Response = await getAdminGalleries(req as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].name).toBe('Artist Gallery');
    expect(json[0].user.email).toBe('artist@example.com');
    expect(json[1].name).toBe('Private Gallery');
    expect(json[1].user.email).toBe('artist2@example.com');
  });

  it('should reject unauthorized requests', async () => {
    const req = new Request('http://test/api/admin/galleries?unauthorized=true', { method: 'GET' });
    const res: Response = await getAdminGalleries(req as any);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Superadmin privileges required');
  });

  it('should handle database errors gracefully', async () => {
    // Mock prisma to throw an error
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.gallery.findMany).mockRejectedValueOnce(new Error('Database error'));

    const req = new Request('http://test/api/admin/galleries', { method: 'GET' });
    const res: Response = await getAdminGalleries(req as any);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to fetch galleries');
  });
});