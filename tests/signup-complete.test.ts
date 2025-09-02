import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock modules before any imports using vi.hoisted
const { mockPrisma, mockSupabaseAdmin, mockEnsureLocalUser, mockIsReservedSlug } = vi.hoisted(() => {
  return {
    mockPrisma: {
      artistInvitation: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      portfolio: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      gallery: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      user: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
    },
    mockSupabaseAdmin: {
      auth: {
        admin: {
          getUserByEmail: vi.fn(),
          createUser: vi.fn(),
        }
      }
    },
    mockEnsureLocalUser: vi.fn(),
    mockIsReservedSlug: vi.fn(() => false)
  }
})

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(() => mockSupabaseAdmin)
}))

vi.mock('@/lib/slug-utils', () => ({
  isReservedSlug: mockIsReservedSlug
}))

vi.mock('@/lib/auth-helpers', () => ({
  ensureLocalUser: mockEnsureLocalUser
}))

// Now import the function to test
import { POST as signupComplete } from '../src/app/api/signup/complete/route'
import { NextRequest } from 'next/server'

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('Signup Complete API', () => {
  const validPayload = {
    token: 'valid-token-123',
    email: 'artist@example.com',
    slug: 'test-artist',
    displayName: 'Test Artist',
    password: 'StrongPass123'
  }

  const mockInvitation = {
    id: 'inv-123',
    token: 'valid-token-123',
    email: '',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    invitedBy: 'admin-id'
  }

  it('should reject requests with missing fields', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }) // Missing other fields
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should reject weak passwords', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        password: 'weak' // Too short, no uppercase, no numbers
      })
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Password must be at least 8 characters')
  })

  it('should reject passwords without uppercase letters', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        password: 'lowercase123'
      })
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('uppercase letter')
  })

  it('should reject passwords without lowercase letters', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        password: 'UPPERCASE123'
      })
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('lowercase letter')
  })

  it('should reject passwords without numbers', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        password: 'NoNumbersHere'
      })
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('number')
  })

  it('should reject invalid invitation tokens', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid invitation token')
  })

  it('should reject already used invitations', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue({
      ...mockInvitation,
      status: 'ACCEPTED'
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invitation already used or invalid')
  })

  it('should reject expired invitations', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue({
      ...mockInvitation,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invitation has expired')
  })

  it('should reject taken slugs', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue(mockInvitation)
    mockPrisma.portfolio.findUnique.mockResolvedValue({
      id: 'existing-portfolio',
      slug: 'test-artist'
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Artist URL is no longer available')
  })

  it('should reject existing email addresses', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue(mockInvitation)
    mockPrisma.portfolio.findUnique.mockResolvedValue(null)
    mockSupabaseAdmin.auth.admin.getUserByEmail.mockResolvedValue({
      data: { user: { id: 'existing-user', email: 'artist@example.com' } },
      error: null
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('An account with this email already exists')
  })

  it('should handle Supabase user creation errors', async () => {
    mockPrisma.artistInvitation.findUnique.mockResolvedValue(mockInvitation)
    mockPrisma.portfolio.findUnique.mockResolvedValue(null)
    mockSupabaseAdmin.auth.admin.getUserByEmail.mockResolvedValue({
      data: { user: null },
      error: null
    })
    mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: null,
      error: { message: 'Supabase error' }
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Failed to create user account')
  })

  it('should successfully complete signup with valid data', async () => {
    // Mock successful flow
    mockPrisma.artistInvitation.findUnique.mockResolvedValue(mockInvitation)
    mockPrisma.portfolio.findUnique.mockResolvedValue(null)
    mockSupabaseAdmin.auth.admin.getUserByEmail.mockResolvedValue({
      data: { user: null },
      error: null
    })
    mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'new-user-id', email: 'artist@example.com' } },
      error: null
    })
    mockPrisma.portfolio.create.mockResolvedValue({
      id: 'new-portfolio-id',
      slug: 'test-artist',
      displayName: 'Test Artist'
    })
    mockPrisma.gallery.findFirst.mockResolvedValue(null)
    mockPrisma.gallery.create.mockResolvedValue({
      id: 'new-gallery-id',
      name: 'Commissions'
    })
    mockPrisma.artistInvitation.update.mockResolvedValue({
      ...mockInvitation,
      status: 'ACCEPTED'
    })

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.portfolioId).toBe('new-portfolio-id')
    expect(data.slug).toBe('test-artist')
    expect(data.userId).toBe('new-user-id')
    expect(data.message).toBe('Account created successfully!')

    // Verify the invitation was marked as accepted
    expect(mockPrisma.artistInvitation.update).toHaveBeenCalledWith({
      where: { id: 'inv-123' },
      data: {
        email: 'artist@example.com',
        status: 'ACCEPTED',
        acceptedAt: expect.any(Date)
      }
    })
  })

  it('should handle missing environment variables', async () => {
    vi.unstubAllEnvs()

    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: JSON.stringify(validPayload)
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Missing Supabase credentials')
  })

  it('should handle malformed JSON requests', async () => {
    const req = new NextRequest('http://test/api/signup/complete', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await signupComplete(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request format')
  })
})