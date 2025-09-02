import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as inviteArtist } from '../src/app/api/admin/invite-artist/route'
import { NextResponse } from 'next/server'

// Deterministic token
vi.mock('crypto', () => ({
  randomBytes: (n: number) => Buffer.alloc(n, 1) // '01' repeated
}))

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => {
  return {
    requireSuperAdmin: vi.fn(async (_req: any) => ({ user: { id: 'admin-1', email: 'admin@example.com' } })),
    ensureLocalUser: vi.fn(async () => {})
  }
})

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      artistInvitation: {
        create: vi.fn(async ({ data }: any) => ({ id: 'inv-1', ...data }))
      }
    }
  }
})

describe('admin invite-artist api', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'http://example.test')
    vi.stubEnv('SUPERADMIN_EMAIL', 'super@example.com')
  })

  it('returns 400 when email missing', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({}) })
    const res: Response = await inviteArtist(req as any)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/email/i)
  })

  it('creates invitation, logs emails, and returns ok', async () => {
    // Spy on console.log to capture email logs
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ email: 'Artist@Email.com', inviteMessage: 'Welcome aboard' }) })
    const res: Response = await inviteArtist(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.invitationId).toBe('inv-1')

    // Verify prisma was called with normalized email and inviter id
    const { prisma } = await import('@/lib/prisma')
    const mockPrisma = vi.mocked(prisma, true)
    expect(mockPrisma.artistInvitation.create).toHaveBeenCalled()
    const args = mockPrisma.artistInvitation.create.mock.calls[0][0]
    expect(args.data.email).toBe('artist@email.com')
    expect(args.data.invitedBy).toBe('admin-1')

    // Verify logs for both recipient and superuser copy were emitted
    const allLogs = logSpy.mock.calls.map(c => String(c[0]))
    expect(allLogs.some(s => s.includes('EMAIL TO SEND:'))).toBe(true)
    expect(allLogs.some(s => s.includes('SUPERUSER COPY EMAIL:'))).toBe(true)
    // Token should be deterministic from our mock: `01` repeated 64
    const token = '01'.repeat(64)
    const expectedLink = `http://example.test/signup?token=${token}`
    expect(allLogs.join('\n')).toContain(expectedLink)

    logSpy.mockRestore()
  })

  it('propagates unauthorized response from guard', async () => {
    const { requireSuperAdmin } = await import('@/lib/auth-helpers')
    ;(requireSuperAdmin as any).mockImplementationOnce(async () => new NextResponse(null, { status: 401 }))
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ email: 'x@y.com' }) })
    const res: Response = await inviteArtist(req as any)
    expect(res.status).toBe(401)
  })
})

