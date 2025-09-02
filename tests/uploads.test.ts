import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as uploadHandler } from '../src/app/api/uploads/route'

// Mock Supabase server client
vi.mock('@/lib/supabase', () => {
  const auth = {
    getUser: vi.fn(async () => ({ data: { user: { id: 'user-1', email: 'u@example.com' } }, error: null }))
  }
  const store: any = { uploaded: [] }
  const storage = {
    from: vi.fn(() => ({
      upload: vi.fn(async (_key: string, _file: File) => {
        const path = 'users/user-1/test.png'
        store.uploaded.push(path)
        return { data: { path }, error: null }
      }),
      getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn.example/${path}` } }))
    }))
  }
  const getSupabaseServer = vi.fn(() => ({ auth, storage }))
  return { getSupabaseServer }
})

describe('uploads api', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_BUCKET', 'artworks')
  })

  function pngFile(name = 'test.png') {
    // 1x1 transparent PNG
    const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/akW0S0AAAAASUVORK5CYII='
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'image/png' })
    return new File([blob], name, { type: 'image/png' })
  }

  it('rejects unauthenticated', async () => {
    // Override auth to return no user
    const supa = await import('@/lib/supabase')
    ;(supa.getSupabaseServer as any).mockReturnValueOnce({
      auth: { getUser: async () => ({ data: { user: null }, error: new Error('no') }) },
      storage: {}
    })

    // Create a proper FormData request even though auth will fail
    const fd = new FormData()
    fd.append('file', pngFile())
    const req = new Request('http://test/api/uploads', { method: 'POST', body: fd })
    
    const res: Response = await uploadHandler(req as any)
    expect(res.status).toBe(401)
  })

  it('uploads an image and returns public url', async () => {
    const fd = new FormData()
    fd.append('file', pngFile())
    const req = new Request('http://test/api/uploads', { method: 'POST', body: fd })

    const res: Response = await uploadHandler(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.publicUrl).toContain('https://')
    expect(json.path).toMatch(/^users\/user-1\/.+\.png$/)
  })

  it('rejects non-image files', async () => {
    const fd = new FormData()
    const blob = new Blob([new Uint8Array([1,2,3])], { type: 'application/pdf' })
    const file = new File([blob], 'doc.pdf', { type: 'application/pdf' })
    fd.append('file', file)
    const req = new Request('http://test/api/uploads', { method: 'POST', body: fd })
    const res: Response = await uploadHandler(req as any)
    expect(res.status).toBe(400)
  })
})
