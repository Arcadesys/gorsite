import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

import { POST as uploadToGallery } from '../src/app/api/galleries/upload/route'

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => {
  return {
    ensureLocalUser: vi.fn(async () => {}),
    requireUser: vi.fn(async (_req: any) => ({ user: { id: 'user-1', email: 'u@example.com' }, res: new NextResponse() })),
  }
})

// In-memory pseudo DB
const db: any = {
  galleries: new Map<string, any>(), // key: userId:slug
  items: [] as any[],
}

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      gallery: {
        findUnique: vi.fn(async ({ where }: any) => {
          const k = `${where.userId_slug.userId}:${where.userId_slug.slug}`
          return db.galleries.get(k) || null
        }),
        create: vi.fn(async ({ data }: any) => {
          const g = { id: `g_${db.galleries.size + 1}`, ...data }
          db.galleries.set(`${data.userId}:${data.slug}`, g)
          return g
        }),
      },
      galleryItem: {
        create: vi.fn(async ({ data }: any) => {
          const item = { id: `i_${db.items.length + 1}`, ...data }
          db.items.push(item)
          return item
        }),
      },
    },
  }
})

// Mock Supabase server client for storage
vi.mock('@/lib/supabase', () => {
  const storage = {
    from: vi.fn(() => ({
      upload: vi.fn(async (_key: string, _file: File) => {
        return { data: { path: 'users/user-1/test.png' }, error: null }
      }),
      getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn.example/${path}` } })),
    })),
  }
  return {
    getSupabaseServer: vi.fn(() => ({ storage })),
  }
})

describe('galleries/upload api', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    db.galleries.clear()
    db.items = []
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_BUCKET', 'artworks')
  })

  it('creates gallery if not exists and uploads item', async () => {
    const fd = new FormData()
    const blob = new Blob([new Uint8Array([137,80,78,71])], { type: 'image/png' })
    const file = new File([blob], 'cat.png', { type: 'image/png' })
    fd.append('file', file)
    fd.append('galleryName', 'My New Gallery')
    fd.append('title', 'Cool Cat')

    const req = new Request('http://test/api/galleries/upload', { method: 'POST', body: fd })
    const res: Response = await uploadToGallery(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.gallery.slug).toBe('my-new-gallery')
    expect(json.item.title).toBe('Cool Cat')
    expect(json.item.imageUrl).toContain('https://cdn.example/users/user-1/')
  })

  it('reuses existing gallery by slug and uploads item', async () => {
    // Pre-create gallery in mock DB
    const { prisma } = await import('@/lib/prisma')
    const userId = 'user-1'
    await (prisma.gallery.create as any)({ data: { userId, name: 'Existing', slug: 'my-gallery', isPublic: true, description: null } })

    const fd = new FormData()
    const blob = new Blob([new Uint8Array([255,216,255])], { type: 'image/jpeg' })
    const file = new File([blob], 'dog.jpg', { type: 'image/jpeg' })
    fd.append('file', file)
    fd.append('gallerySlug', 'my-gallery')

    const req = new Request('http://test/api/galleries/upload', { method: 'POST', body: fd })
    const res: Response = await uploadToGallery(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.gallery.slug).toBe('my-gallery')
    expect(json.item.title).toBe('dog') // defaults to filename without extension
  })

  it('rejects non-image', async () => {
    const fd = new FormData()
    const blob = new Blob([new Uint8Array([1,2,3])], { type: 'application/pdf' })
    const file = new File([blob], 'doc.pdf', { type: 'application/pdf' })
    fd.append('file', file)
    fd.append('galleryName', 'Docs')
    const req = new Request('http://test/api/galleries/upload', { method: 'POST', body: fd })
    const res: Response = await uploadToGallery(req as any)
    expect(res.status).toBe(400)
  })
})

