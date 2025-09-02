import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validatePassword, getPasswordRequirements, checkPasswordStrength } from '../src/lib/password-validation'

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should pass valid strong passwords', () => {
      const validPasswords = [
        'StrongPass123',
        'MyPassword1',
        'SecureTest99',
        'ValidPass2024',
        'GoodPassword1!'
      ]

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBeNull()
      })
    })

    it('should reject passwords that are too short', () => {
      const shortPasswords = [
        'Pass1',
        'Ab1',
        'Short9',
        '1234567' // 7 characters
      ]

      shortPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result).toContain('at least 8 characters')
      })
    })

    it('should reject passwords without lowercase letters', () => {
      const noLowercasePasswords = [
        'PASSWORD123',
        'ALLUPPERCASE1',
        'NOLOWER999'
      ]

      noLowercasePasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result).toContain('lowercase letter')
      })
    })

    it('should reject passwords without uppercase letters', () => {
      const noUppercasePasswords = [
        'password123',
        'allowercase1',
        'noupper999'
      ]

      noUppercasePasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result).toContain('uppercase letter')
      })
    })

    it('should reject passwords without numbers', () => {
      const noNumberPasswords = [
        'PasswordOnly',
        'NoNumbersHere',
        'JustLetters'
      ]

      noNumberPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result).toContain('number')
      })
    })

    it('should reject passwords with multiple issues', () => {
      expect(validatePassword('weak')).toContain('8 characters')
      expect(validatePassword('toolongbutnouppernorumber')).toContain('uppercase')
      expect(validatePassword('TOOLONGBUTNOLOWEST')).toContain('lowercase')
      expect(validatePassword('NoNumbersButLongEnough')).toContain('number')
    })
  })

  describe('getPasswordRequirements', () => {
    it('should return an array of requirements', () => {
      const requirements = getPasswordRequirements()
      expect(Array.isArray(requirements)).toBe(true)
      expect(requirements.length).toBeGreaterThan(0)
      expect(requirements).toContain('At least 8 characters long')
      expect(requirements).toContain('At least one lowercase letter (a-z)')
      expect(requirements).toContain('At least one uppercase letter (A-Z)')
      expect(requirements).toContain('At least one number (0-9)')
    })
  })

  describe('checkPasswordStrength', () => {
    it('should return valid=true for strong passwords', () => {
      const result = checkPasswordStrength('StrongPass123')
      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(100)
      expect(result.feedback).toHaveLength(0)
    })

    it('should return valid=false for weak passwords', () => {
      const result = checkPasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(100)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should give bonus points for special characters', () => {
      const withSpecial = checkPasswordStrength('StrongPass123!')
      const withoutSpecial = checkPasswordStrength('StrongPass123')
      
      // Both should be valid, but the one with special chars should have higher score
      expect(withSpecial.isValid).toBe(true)
      expect(withoutSpecial.isValid).toBe(true)
      expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score)
    })

    it('should provide helpful feedback for missing requirements', () => {
      const result = checkPasswordStrength('weak')
      expect(result.feedback).toContain('Add more characters (minimum 8)')
      expect(result.feedback).toContain('Add an uppercase letter')
      expect(result.feedback).toContain('Add a number')
    })
  })
})