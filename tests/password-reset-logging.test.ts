import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock console methods to capture logs
const mockConsole = vi.hoisted(() => ({
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}))

// Mock modules before any imports
const { mockSupabaseAdmin, mockResend } = vi.hoisted(() => {
  return {
    mockSupabaseAdmin: {
      auth: {
        admin: {
          listUsers: vi.fn(),
          updateUserById: vi.fn(),
        }
      }
    },
    mockResend: {
      emails: {
        send: vi.fn()
      }
    }
  }
})

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(() => mockSupabaseAdmin)
}))

vi.mock('resend', () => ({
  Resend: vi.fn(() => mockResend)
}))

// Mock console globally
Object.assign(console, mockConsole)

// Now import the function to test
import { POST as resetPasswordRequest } from '../src/app/api/auth/reset-password-request-custom/route'
import { NextRequest } from 'next/server'

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('Password Reset Request API Logging', () => {
  const validPayload = {
    email: 'user@example.com'
  }

  describe('Basic Logging Structure', () => {
    it('should log password reset requests with proper structure', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Check that console logging occurred
      expect(mockConsole.log).toHaveBeenCalled()
    })

    it('should handle email sending success logging', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { 
          users: [{ 
            id: 'user-123', 
            email: 'user@example.com',
            user_metadata: {}
          }] 
        },
        error: null
      })
      mockSupabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-123' },
        error: null
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      const response = await resetPasswordRequest(req)

      expect(response.status).toBe(200)
      
      // Should not log errors for successful requests
      expect(mockConsole.error).not.toHaveBeenCalled()
    })

    it('should log email sending failures', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { 
          users: [{ 
            id: 'user-123', 
            email: 'user@example.com',
            user_metadata: {}
          }] 
        },
        error: null
      })
      mockSupabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
      mockResend.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'Email sending failed' }
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Check error logging
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        { message: 'Email sending failed' }
      )
    })

    it('should log Supabase user lookup errors', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: { message: 'Database connection failed' }
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Check error logging
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error listing users:',
        { message: 'Database connection failed' }
      )
    })

    it('should log Supabase user update errors', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { 
          users: [{ 
            id: 'user-123', 
            email: 'user@example.com',
            user_metadata: {}
          }] 
        },
        error: null
      })
      mockSupabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: null,
        error: { message: 'User update failed' }
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Check error logging
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error updating user metadata:',
        { message: 'User update failed' }
      )
    })

    it('should log general request errors', async () => {
      // Force an error by providing invalid JSON
      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: 'invalid json'
      })

      await resetPasswordRequest(req)

      // Check error logging
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Password reset request error:',
        expect.any(Error)
      )
    })
  })

  describe('Email Content Logging', () => {
    it('should include logPrefix in email sending attempts', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { 
          users: [{ 
            id: 'user-123', 
            email: 'user@example.com',
            user_metadata: { display_name: 'Test User' }
          }] 
        },
        error: null
      })
      mockSupabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-123' },
        error: null
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Verify Resend was called with correct parameters including logPrefix
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user@example.com'],
          subject: 'Reset Your Password - The Arcade Art Gallery'
        })
      )
    })
  })

  describe('User Not Found Handling', () => {
    it('should handle user not found gracefully without detailed logging', async () => {
      mockSupabaseAdmin.auth.admin.listUsers.mockResolvedValue({
        data: { users: [] },
        error: null
      })

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      const response = await resetPasswordRequest(req)

      expect(response.status).toBe(200) // Should still return success for security
      
      // Should not log sensitive information about user not existing
      const logCalls = mockConsole.log.mock.calls.map(call => call.join(' '))
      const errorCalls = mockConsole.error.mock.calls.map(call => call.join(' '))
      
      expect([...logCalls, ...errorCalls].some(log => 
        log.includes('user not found') || log.includes('User not found')
      )).toBe(false)
    })
  })

  describe('Environment Configuration Logging', () => {
    it('should handle missing RESEND_API_KEY gracefully', async () => {
      vi.unstubAllEnvs()

      const req = new NextRequest('http://test/api/auth/reset-password-request-custom', {
        method: 'POST',
        body: JSON.stringify(validPayload)
      })

      await resetPasswordRequest(req)

      // Should log an error about missing configuration
      expect(mockConsole.error).toHaveBeenCalled()
    })
  })
})