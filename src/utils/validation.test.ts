import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidLinkedInUrl,
  isValidGitHubUrl,
} from './validation'

describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('should return true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  it('should return false for email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('should return false for email without domain', () => {
    expect(isValidEmail('test@')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('should return true for 10-digit phone number', () => {
    expect(isValidPhone('5551234567')).toBe(true)
  })

  it('should return true for phone with dashes', () => {
    expect(isValidPhone('555-123-4567')).toBe(true)
  })

  it('should return true for phone with parentheses', () => {
    expect(isValidPhone('(555) 123-4567')).toBe(true)
  })

  it('should return true for phone with +1 prefix', () => {
    expect(isValidPhone('+15551234567')).toBe(true)
  })

  it('should return false for too short phone number', () => {
    expect(isValidPhone('555123')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })
})

describe('isValidUrl', () => {
  it('should return true for valid https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('should return true for valid http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('should return true for URL with path', () => {
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true)
  })

  it('should return false for invalid URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })
})

describe('isValidLinkedInUrl', () => {
  it('should return true for valid LinkedIn profile URL', () => {
    expect(isValidLinkedInUrl('https://linkedin.com/in/johndoe')).toBe(true)
  })

  it('should return true for LinkedIn URL with www', () => {
    expect(isValidLinkedInUrl('https://www.linkedin.com/in/johndoe')).toBe(true)
  })

  it('should return false for non-LinkedIn URL', () => {
    expect(isValidLinkedInUrl('https://example.com/in/johndoe')).toBe(false)
  })

  it('should return false for LinkedIn company page', () => {
    expect(isValidLinkedInUrl('https://linkedin.com/company/acme')).toBe(false)
  })
})

describe('isValidGitHubUrl', () => {
  it('should return true for valid GitHub profile URL', () => {
    expect(isValidGitHubUrl('https://github.com/johndoe')).toBe(true)
  })

  it('should return true for GitHub repo URL', () => {
    expect(isValidGitHubUrl('https://github.com/johndoe/repo')).toBe(true)
  })

  it('should return false for non-GitHub URL', () => {
    expect(isValidGitHubUrl('https://gitlab.com/johndoe')).toBe(false)
  })
})
