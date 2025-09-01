import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH as patchItem, DELETE as deleteItem } from '../src/app/api/gallery-items/[itemId]/route'
import { NextResponse } from 'next/server'

vi.mock('../src/lib/auth-helpers', () => {
  return {
    ensureLocalUser: vi.fn(async () => {}),
    requireUser: vi.fn(async (_req: any) => ({ user: { id: 'user-1', email: 'u@example.com' }, res: new NextResponse() }))
  }
})

const prismaMock = {
  galleryItem: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}

vi.mock('../src/lib/prisma', () => ({ prisma: prismaMock as any }))

describe('gallery-items api', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('edits item fields', async () => {
    prismaMock.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'user-1' } })
    prismaMock.galleryItem.update.mockResolvedValueOnce({ id: 'i1', title: 'New', altText: 'Alt' })
    const req = new Request('http://test', { method: 'PATCH', body: JSON.stringify({ title: 'New', altText: 'Alt' }) })
    const res: Response = await patchItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('New')
    expect(prismaMock.galleryItem.update).toHaveBeenCalled()
  })

  it('deletes item', async () => {
    prismaMock.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'user-1' } })
    prismaMock.galleryItem.delete.mockResolvedValueOnce({})
    const req = new Request('http://test', { method: 'DELETE' })
    const res: Response = await deleteItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(200)
  })

  it('404s when not owner', async () => {
    prismaMock.galleryItem.findUnique.mockResolvedValueOnce({ id: 'i1', gallery: { userId: 'other' } })
    const req = new Request('http://test', { method: 'PATCH', body: JSON.stringify({ title: 'x' }) })
    const res: Response = await patchItem(req as any, { params: { itemId: 'i1' } } as any)
    expect(res.status).toBe(404)
  })
})
