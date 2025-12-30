/**
 * Validation utilities for form fields
 */

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

/**
 * Validates a phone number format (US format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  // Remove common separators and check for 10 digits
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  return /^\+?1?\d{10}$/.test(cleaned)
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates a LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  return url.includes('linkedin.com/in/')
}

/**
 * Validates a GitHub profile URL
 */
export function isValidGitHubUrl(url: string): boolean {
  if (!isValidUrl(url)) return false
  return url.includes('github.com/')
}
