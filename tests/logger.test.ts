import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouteLogger } from '../src/lib/logger'

describe('Logger Module', () => {
  let consoleSpy: {
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createRouteLogger', () => {
    it('should create a logger with a unique request ID', () => {
      const logger1 = createRouteLogger('/api/test')
      const logger2 = createRouteLogger('/api/test')
      
      expect(logger1.reqId).toBeDefined()
      expect(logger2.reqId).toBeDefined()
      expect(logger1.reqId).not.toBe(logger2.reqId)
    })

    it('should include route and request ID in all log messages', () => {
      const logger = createRouteLogger('/api/signup/complete')
      
      logger.info('Test message')
      
      expect(consoleSpy.info).toHaveBeenCalledOnce()
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      
      expect(loggedData).toMatchObject({
        level: 'info',
        message: 'Test message',
        route: '/api/signup/complete',
        reqId: logger.reqId,
        ts: expect.any(String)
      })
    })

    it('should log info messages to console.info', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.info('Info message', { key: 'value' })
      
      expect(consoleSpy.info).toHaveBeenCalledOnce()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData.level).toBe('info')
      expect(loggedData.message).toBe('Info message')
      expect(loggedData.key).toBe('value')
    })

    it('should log warn messages to console.warn', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.warn('Warning message', { warning: true })
      
      expect(consoleSpy.warn).toHaveBeenCalledOnce()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.error).not.toHaveBeenCalled()
      
      const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0])
      expect(loggedData.level).toBe('warn')
      expect(loggedData.message).toBe('Warning message')
      expect(loggedData.warning).toBe(true)
    })

    it('should log error messages to console.error', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.error('Error message', { error: 'details' })
      
      expect(consoleSpy.error).toHaveBeenCalledOnce()
      expect(consoleSpy.info).not.toHaveBeenCalled()
      expect(consoleSpy.warn).not.toHaveBeenCalled()
      
      const loggedData = JSON.parse(consoleSpy.error.mock.calls[0][0])
      expect(loggedData.level).toBe('error')
      expect(loggedData.message).toBe('Error message')
      expect(loggedData.error).toBe('details')
    })

    it('should include timestamp in ISO format', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.info('Test message')
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      
      // Verify it's a valid date
      const timestamp = new Date(loggedData.ts)
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should handle messages without metadata', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.info('Simple message')
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData).toMatchObject({
        level: 'info',
        message: 'Simple message',
        route: '/api/test',
        reqId: logger.reqId,
        ts: expect.any(String)
      })
    })

    it('should merge metadata with base log data', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.info('Message with metadata', {
        userId: '123',
        action: 'signup',
        nested: { data: 'value' }
      })
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData).toMatchObject({
        level: 'info',
        message: 'Message with metadata',
        route: '/api/test',
        reqId: logger.reqId,
        ts: expect.any(String),
        userId: '123',
        action: 'signup',
        nested: { data: 'value' }
      })
    })

    it('should generate unique request IDs for concurrent loggers', () => {
      const loggers = Array.from({ length: 100 }, () => createRouteLogger('/api/test'))
      const requestIds = loggers.map(logger => logger.reqId)
      const uniqueIds = new Set(requestIds)
      
      expect(uniqueIds.size).toBe(100) // All IDs should be unique
    })

    it('should properly serialize complex metadata objects', () => {
      const logger = createRouteLogger('/api/test')
      
      const complexMeta = {
        error: new Error('Test error'),
        date: new Date('2025-01-01T00:00:00Z'),
        undefined: undefined,
        null: null,
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } }
      }
      
      logger.error('Complex metadata', complexMeta)
      
      const loggedData = JSON.parse(consoleSpy.error.mock.calls[0][0])
      
      // Error objects get converted to string representation
      expect(loggedData.error).toEqual({})
      expect(loggedData.date).toBe('2025-01-01T00:00:00.000Z')
      expect(loggedData.null).toBeNull()
      expect(loggedData.array).toEqual([1, 2, 3])
      expect(loggedData.nested).toEqual({ deep: { value: 'test' } })
      // undefined values are typically omitted in JSON.stringify
      expect('undefined' in loggedData).toBe(false)
    })
  })

  describe('Log Format Validation', () => {
    it('should produce valid JSON that can be parsed', () => {
      const logger = createRouteLogger('/api/test')
      
      logger.info('Test message', { special: 'chars "quotes" and \n newlines' })
      
      const logOutput = consoleSpy.info.mock.calls[0][0]
      expect(() => JSON.parse(logOutput)).not.toThrow()
      
      const parsed = JSON.parse(logOutput)
      expect(parsed.special).toBe('chars "quotes" and \n newlines')
    })

    it('should handle very long route names', () => {
      const longRoute = '/api/very/long/route/name/that/exceeds/normal/length/limits/and/continues/for/testing/purposes'
      const logger = createRouteLogger(longRoute)
      
      logger.info('Test message')
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData.route).toBe(longRoute)
    })

    it('should handle empty route names', () => {
      const logger = createRouteLogger('')
      
      logger.info('Test message')
      
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0])
      expect(loggedData.route).toBe('')
    })
  })
})