import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock console methods to capture logs
const mockConsole = vi.hoisted(() => ({
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

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

// Mock console globally
Object.assign(console, mockConsole)

// Now import the function to test
import { POST as signupComplete } from '../src/app/api/signup/complete/route'
import { NextRequest } from 'next/server'

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('Signup Complete API Logging', () => {
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

  describe('Request Logging', () => {
    it('should log request received with emoji and request ID', async () => {
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check that initial request log was made
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/🔧 \[[a-z0-9]{7}\] Signup completion request received at \d{4}-\d{2}-\d{2}T/)
      )
    })

    it('should log environment check information', async () => {
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check environment logging
      const envLogCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Environment check:')
      )
      expect(envLogCall).toBeDefined()
      expect(envLogCall[0]).toMatch(/🔧 \[[a-z0-9]{7}\] Environment check:/)
    })

    it('should log request data structure analysis', async () => {
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check request data logging
      const dataLogCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Request data structure:')
      )
      expect(dataLogCall).toBeDefined()
      expect(dataLogCall[0]).toMatch(/📋 \[[a-z0-9]{7}\] Request data structure:/)
    })
  })

  describe('Password Validation Logging', () => {
    it('should log password validation success', async () => {
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
      mockPrisma.gallery.create.mockResolvedValue({ id: 'gallery-id' })
      mockPrisma.artistInvitation.update.mockResolvedValue(mockInvitation)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check password validation logs
      const passwordValidationCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Validating password')
      )
      expect(passwordValidationCall).toBeDefined()
      expect(passwordValidationCall[0]).toMatch(/🔐 \[[a-z0-9]{7}\] Validating password \(length: 13\)/)

      const passwordSuccessCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Password validation passed')
      )
      expect(passwordSuccessCall).toBeDefined()
      expect(passwordSuccessCall[0]).toMatch(/✅ \[[a-z0-9]{7}\] Password validation passed/)
    })

    it('should log password validation failure with detailed analysis', async () => {
      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify({
          ...validPayload,
          password: 'weak'
        })
      })

      await signupComplete(req)

      // Check password validation failure logs
      const passwordFailureCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Password validation failed:')
      )
      expect(passwordFailureCall).toBeDefined()
      expect(passwordFailureCall[0]).toMatch(/❌ \[[a-z0-9]{7}\] Password validation failed:/)
    })
  })

  describe('User Creation Logging', () => {
    beforeEach(() => {
      // Setup successful flow up to user creation
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(mockInvitation)
      mockPrisma.portfolio.findUnique.mockResolvedValue(null)
      mockSupabaseAdmin.auth.admin.getUserByEmail.mockResolvedValue({
        data: { user: null },
        error: null
      })
    })

    it('should log Supabase user creation attempt and success', async () => {
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-id', email: 'artist@example.com', created_at: '2025-01-01' } },
        error: null
      })
      mockPrisma.portfolio.create.mockResolvedValue({
        id: 'new-portfolio-id',
        slug: 'test-artist'
      })
      mockPrisma.gallery.findFirst.mockResolvedValue(null)
      mockPrisma.gallery.create.mockResolvedValue({ id: 'gallery-id' })
      mockPrisma.artistInvitation.update.mockResolvedValue(mockInvitation)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check user creation attempt log
      const userCreationCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Creating Supabase user...')
      )
      expect(userCreationCall).toBeDefined()
      expect(userCreationCall[0]).toMatch(/👤 \[[a-z0-9]{7}\] Creating Supabase user\.\.\./)

      // Check user creation payload log
      const payloadCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('User creation payload:')
      )
      expect(payloadCall).toBeDefined()
      expect(payloadCall[0]).toMatch(/👤 \[[a-z0-9]{7}\] User creation payload:/)

      // Check user creation success log
      const successCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Supabase user created:')
      )
      expect(successCall).toBeDefined()
      expect(successCall[0]).toMatch(/✅ \[[a-z0-9]{7}\] Supabase user created:/)
    })

    it('should log Supabase user creation failure with detailed error info', async () => {
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { 
          message: 'User already exists', 
          status: 422, 
          code: 'user_already_exists',
          details: 'Email already registered',
          hint: 'Try using a different email'
        }
      })

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check user creation failure log
      const failureCall = mockConsole.error.mock.calls.find(call => 
        call[0].includes('Supabase user creation error:')
      )
      expect(failureCall).toBeDefined()
      expect(failureCall[0]).toMatch(/❌ \[[a-z0-9]{7}\] Supabase user creation error:/)
    })
  })

  describe('Success Flow Logging', () => {
    it('should log all major steps in successful signup completion', async () => {
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
      mockPrisma.gallery.create.mockResolvedValue({ id: 'gallery-id' })
      mockPrisma.artistInvitation.update.mockResolvedValue(mockInvitation)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Verify all major logging steps occurred
      const allLogs = mockConsole.log.mock.calls.map(call => call[0]).join('\n')

      // Check for major emoji markers mentioned in the guide
      expect(allLogs).toMatch(/🔧.*Signup completion request received/)
      expect(allLogs).toMatch(/📋.*Request data structure/)
      expect(allLogs).toMatch(/🔐.*Validating password/)
      expect(allLogs).toMatch(/✅.*Password validation passed/)
      expect(allLogs).toMatch(/🎫.*Validating invitation token/)
      expect(allLogs).toMatch(/✅.*Invitation validation passed/)
      expect(allLogs).toMatch(/👤.*Creating Supabase user/)
      expect(allLogs).toMatch(/✅.*Supabase user created/)
      expect(allLogs).toMatch(/🏠.*Creating local user record/)
      expect(allLogs).toMatch(/✅.*Local user record created/)
      expect(allLogs).toMatch(/🎨.*Creating portfolio/)
      expect(allLogs).toMatch(/✅.*Portfolio created/)
      expect(allLogs).toMatch(/📁.*Creating commissions gallery/)
      expect(allLogs).toMatch(/✅.*Commissions gallery created/)
      expect(allLogs).toMatch(/✅.*Marking invitation as accepted/)
      expect(allLogs).toMatch(/🎉.*Signup completed successfully/)
    })

    it('should include processing time in final success log', async () => {
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
        slug: 'test-artist'
      })
      mockPrisma.gallery.findFirst.mockResolvedValue(null)
      mockPrisma.gallery.create.mockResolvedValue({ id: 'gallery-id' })
      mockPrisma.artistInvitation.update.mockResolvedValue(mockInvitation)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      const response = await signupComplete(req)
      const responseData = await response.json()

      // Check final success log includes timing
      const successLogCall = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Signup completed successfully') && call[0].includes('ms!')
      )
      expect(successLogCall).toBeDefined()
      expect(successLogCall[0]).toMatch(/🎉 \[[a-z0-9]{7}\] Signup completed successfully in \d+ms!/)

      // Response should also include processing time
      expect(responseData.processingTime).toBeTypeOf('number')
      expect(responseData.processingTime).toBeGreaterThan(0)
      expect(responseData.requestId).toMatch(/^[a-z0-9]{7}$/)
    })
  })

  describe('Error Logging', () => {
    it('should log errors with request ID and timing', async () => {
      // Force an error by not mocking anything
      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await signupComplete(req)
      const responseData = await response.json()

      // Check error log
      const errorLogCall = mockConsole.error.mock.calls.find(call => 
        call[0].includes('JSON parsing failed:')
      )
      expect(errorLogCall).toBeDefined()
      expect(errorLogCall[0]).toMatch(/❌ \[[a-z0-9]{7}\] JSON parsing failed:/)

      // Response should include error code and request ID
      expect(responseData.errorCode).toBe('INVALID_JSON')
      expect(responseData.requestId).toMatch(/^[a-z0-9]{7}$/)
    })

    it('should include request ID consistently across all logs', async () => {
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Extract all request IDs from logs
      const allLogs = [
        ...mockConsole.log.mock.calls.map(call => call[0]),
        ...mockConsole.error.mock.calls.map(call => call[0])
      ]

      const requestIds = allLogs
        .map(log => {
          const match = log.match(/\[([a-z0-9]{7})\]/)
          return match ? match[1] : null
        })
        .filter(Boolean)

      // All request IDs should be the same
      expect(requestIds.length).toBeGreaterThan(1)
      const uniqueIds = [...new Set(requestIds)]
      expect(uniqueIds).toHaveLength(1)
    })
  })

  describe('Metadata Logging', () => {
    it('should log request metadata without exposing sensitive information', async () => {
      mockPrisma.artistInvitation.findUnique.mockResolvedValue(null)

      const req = new NextRequest('http://test/api/signup/complete', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await signupComplete(req)

      // Check that password length is logged but not the actual password
      const dataStructureLog = mockConsole.log.mock.calls.find(call => 
        call[0].includes('Request data structure:')
      )[0]

      expect(dataStructureLog).toMatch(/passwordLength: 13/)
      expect(dataStructureLog).not.toMatch(/StrongPass123/)
      expect(dataStructureLog).toMatch(/hasPassword: true/)
    })
  })
})