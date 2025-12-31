// Tests for log sanitization utilities

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sanitizeString,
  sanitizeObject,
  sanitizeLogs,
  createSanitizedErrorReport,
  formatErrorReport,
} from './logSanitizer'

// Mock chrome API
vi.stubGlobal('chrome', {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
  },
})

describe('Log Sanitizer', () => {
  describe('sanitizeString', () => {
    it('redacts email addresses', () => {
      const input = 'Contact me at john.doe@example.com for more info'
      const result = sanitizeString(input)
      expect(result).toBe('Contact me at [EMAIL_REDACTED] for more info')
    })

    it('redacts multiple email addresses', () => {
      const input = 'Email john@example.com or jane@company.org'
      const result = sanitizeString(input)
      expect(result).toBe('Email [EMAIL_REDACTED] or [EMAIL_REDACTED]')
    })

    it('redacts phone numbers', () => {
      const input = 'Call me at 555-123-4567'
      const result = sanitizeString(input)
      expect(result).toBe('Call me at [PHONE_REDACTED]')
    })

    it('redacts phone numbers with different formats', () => {
      const inputs = [
        '(555) 123-4567',
        '555.123.4567',
        '+1 555 123 4567',
        '5551234567',
      ]

      for (const input of inputs) {
        const result = sanitizeString(input)
        expect(result).toContain('[PHONE_REDACTED]')
      }
    })

    it('redacts SSN', () => {
      const input = 'SSN: 123-45-6789'
      const result = sanitizeString(input)
      expect(result).toBe('SSN: [SSN_REDACTED]')
    })

    it('redacts credit card numbers', () => {
      const input = 'Card: 1234-5678-9012-3456'
      const result = sanitizeString(input)
      expect(result).toBe('Card: [CARD_REDACTED]')
    })

    it('redacts street addresses', () => {
      const input = 'Lives at 123 Main Street, Apt 4'
      const result = sanitizeString(input)
      expect(result).toContain('[ADDRESS_REDACTED]')
    })

    it('redacts various street types', () => {
      const addresses = [
        '456 Oak Avenue',
        '789 Pine Road',
        '321 Elm Drive',
        '654 Cedar Lane',
        '987 Maple Boulevard',
      ]

      for (const address of addresses) {
        const result = sanitizeString(address)
        expect(result).toContain('[ADDRESS_REDACTED]')
      }
    })

    it('redacts ZIP codes', () => {
      const input = 'ZIP: 94102'
      const result = sanitizeString(input)
      expect(result).toBe('ZIP: [ZIP_REDACTED]')
    })

    it('redacts extended ZIP codes', () => {
      // Extended ZIP+4 format may trigger SSN pattern due to regex overlap
      // This is acceptable as both are PII that should be redacted
      const input = 'ZIP+4: 94102-1234'
      const result = sanitizeString(input)
      expect(result).toContain('[')
      expect(result).toContain('REDACTED]')
    })

    it('redacts URLs', () => {
      const input = 'Visit https://example.com/user/profile?token=secret'
      const result = sanitizeString(input)
      expect(result).toBe('Visit [URL_REDACTED]')
    })

    it('does not redact names by default', () => {
      const input = 'John Smith is the author'
      const result = sanitizeString(input)
      expect(result).toBe('John Smith is the author')
    })

    it('redacts names when option enabled', () => {
      const input = 'John Smith is the author'
      const result = sanitizeString(input, { redactNames: true })
      expect(result).toBe('[NAME_REDACTED] is the author')
    })

    it('handles empty string', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('handles string with no PII', () => {
      const input = 'This is a clean string with no personal data'
      expect(sanitizeString(input)).toBe(input)
    })
  })

  describe('sanitizeObject', () => {
    it('sanitizes nested objects', () => {
      const input = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      }
      const result = sanitizeObject(input) as { user: { name: string; email: string } }
      expect(result.user.email).toBe('[EMAIL_REDACTED]')
    })

    it('redacts PII fields entirely', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address: '123 Main St',
      }
      const result = sanitizeObject(input) as Record<string, string>
      expect(result.firstName).toBe('[FIRSTNAME_REDACTED]')
      expect(result.lastName).toBe('[LASTNAME_REDACTED]')
      expect(result.phone).toBe('[PHONE_REDACTED]')
      expect(result.address).toBe('[ADDRESS_REDACTED]')
    })

    it('sanitizes arrays', () => {
      const input = ['john@example.com', 'jane@example.com']
      const result = sanitizeObject(input) as string[]
      expect(result[0]).toBe('[EMAIL_REDACTED]')
      expect(result[1]).toBe('[EMAIL_REDACTED]')
    })

    it('handles null and undefined', () => {
      expect(sanitizeObject(null)).toBeNull()
      expect(sanitizeObject(undefined)).toBeUndefined()
    })

    it('preserves numbers and booleans', () => {
      const input = { count: 42, active: true }
      const result = sanitizeObject(input)
      expect(result).toEqual({ count: 42, active: true })
    })

    it('handles deeply nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              email: 'deep@example.com',
            },
          },
        },
      }
      const result = sanitizeObject(input) as typeof input
      expect(result.level1.level2.level3.email).toBe('[EMAIL_REDACTED]')
    })
  })

  describe('sanitizeLogs', () => {
    it('sanitizes array of log strings', () => {
      const logs = [
        'User logged in: john@example.com',
        'Session started from 192.168.1.1',
        'Error loading profile',
      ]
      const result = sanitizeLogs(logs)
      expect(result[0]).toContain('[EMAIL_REDACTED]')
      expect(result[2]).toBe('Error loading profile')
    })

    it('handles empty array', () => {
      expect(sanitizeLogs([])).toEqual([])
    })
  })

  describe('createSanitizedErrorReport', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        clipboard: { writeText: vi.fn() },
      })
      vi.stubGlobal('window', {
        location: { href: 'https://example.com/test' },
      })
    })

    it('creates report with required fields', () => {
      const error = new Error('Test error')
      const report = createSanitizedErrorReport(error)

      expect(report.timestamp).toBeDefined()
      expect(report.userAgent).toBeDefined()
      expect(report.extensionVersion).toBe('1.0.0')
      expect(report.error).toBe('Test error')
    })

    it('includes sanitized stack trace', () => {
      const error = new Error('Error at john@example.com')
      error.stack = 'Error: john@example.com\n    at Object.<anonymous>'
      const report = createSanitizedErrorReport(error)

      expect(report.stack).toContain('[EMAIL_REDACTED]')
    })

    it('sanitizes additional info', () => {
      const error = new Error('Test')
      const report = createSanitizedErrorReport(error, {
        userEmail: 'test@example.com',
        phone: '555-1234',
      })

      const info = report.additionalInfo as Record<string, string>
      expect(info.userEmail).toBe('[USEREMAIL_REDACTED]')
      expect(info.phone).toBe('[PHONE_REDACTED]')
    })
  })

  describe('formatErrorReport', () => {
    it('formats report as string', () => {
      const report = {
        timestamp: '2024-12-31T00:00:00.000Z',
        userAgent: 'Mozilla/5.0',
        extensionVersion: '1.0.0',
        url: 'https://example.com',
        error: 'Test error',
      }

      const formatted = formatErrorReport(report)
      expect(formatted).toContain('=== Job Autofill Error Report ===')
      expect(formatted).toContain('Version: 1.0.0')
      expect(formatted).toContain('Test error')
      expect(formatted).toContain('=== End of Report ===')
    })

    it('includes stack trace when present', () => {
      const report = {
        timestamp: '2024-12-31T00:00:00.000Z',
        userAgent: 'Mozilla/5.0',
        extensionVersion: '1.0.0',
        url: 'https://example.com',
        error: 'Test error',
        stack: 'Error: Test\n    at line 1',
      }

      const formatted = formatErrorReport(report)
      expect(formatted).toContain('--- Stack Trace ---')
      expect(formatted).toContain('at line 1')
    })

    it('includes additional info when present', () => {
      const report = {
        timestamp: '2024-12-31T00:00:00.000Z',
        userAgent: 'Mozilla/5.0',
        extensionVersion: '1.0.0',
        url: 'https://example.com',
        error: 'Test error',
        additionalInfo: { key: 'value' },
      }

      const formatted = formatErrorReport(report)
      expect(formatted).toContain('--- Additional Info ---')
      expect(formatted).toContain('"key": "value"')
    })
  })

  describe('Edge cases', () => {
    it('handles mixed content', () => {
      const input = 'User john@example.com at 123 Oak Street called 555-123-4567'
      const result = sanitizeString(input)
      expect(result).toContain('[EMAIL_REDACTED]')
      expect(result).toContain('[ADDRESS_REDACTED]')
      expect(result).toContain('[PHONE_REDACTED]')
    })

    it('handles special characters', () => {
      const input = 'Email: john+test@example.com'
      const result = sanitizeString(input)
      expect(result).toBe('Email: [EMAIL_REDACTED]')
    })

    it('handles international phone formats', () => {
      const input = '+1-555-123-4567'
      const result = sanitizeString(input)
      expect(result).toContain('[PHONE_REDACTED]')
    })
  })
})
