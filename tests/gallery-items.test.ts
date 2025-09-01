import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH as patchItem, DELETE as deleteItem } from '../src/app/api/gallery-items/[itemId]/route'
import { NextResponse } from 'next/server'

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => {
  return {
    ensureLocalUser: vi.fn(async () => {}),
    requireUser: vi.fn(async (_req: any) => ({ user: { id: 'user-1', email: 'u@example.com' }, res: new NextResponse() }))
  }
})

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      galleryItem: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }
    }
  }
})

describe('gallery-items api', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('edits item fields', async () => {
    const { prisma } = await import('@/lib/prisma')
    const mockPrisma = vi.mocked(prisma, true)
    
    mockPrisma.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'user-1' } } as any)
    mockPrisma.galleryItem.update.mockResolvedValueOnce({ id: 'i1', title: 'New', altText: 'Alt' } as any)
    const req = new Request('http://test', { method: 'PATCH', body: JSON.stringify({ title: 'New', altText: 'Alt' }) })
    const res: Response = await patchItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('New')
    expect(mockPrisma.galleryItem.update).toHaveBeenCalled()
  })

  it('deletes item', async () => {
    const { prisma } = await import('@/lib/prisma')
    const mockPrisma = vi.mocked(prisma, true)
    
    mockPrisma.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'user-1' } } as any)
    mockPrisma.galleryItem.delete.mockResolvedValueOnce({} as any)
    const req = new Request('http://test', { method: 'DELETE' })
    const res: Response = await deleteItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(200)
  })

  it('404s when not owner', async () => {
    const { prisma } = await import('@/lib/prisma')
    const mockPrisma = vi.mocked(prisma, true)
    
    mockPrisma.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'other' } } as any)
    const req = new Request('http://test', { method: 'PATCH', body: JSON.stringify({ title: 'x' }) })
    const res: Response = await patchItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(404)
  })
})
