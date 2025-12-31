// Log sanitization utilities
// Removes PII (Personally Identifiable Information) from logs

// Patterns to detect and redact PII
const PII_PATTERNS = {
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Phone numbers (various formats)
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,

  // Social Security Numbers
  ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,

  // Credit card numbers (simplified)
  creditCard: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,

  // Street addresses (simplified detection)
  streetAddress: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|boulevard|blvd|circle|cir)\b/gi,

  // ZIP codes
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,

  // URLs with potential usernames/tokens
  sensitiveUrl: /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi,

  // Names (heuristic: capitalized words that might be names)
  // Only applied in specific contexts
  potentialName: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
}

// Replacement strings for each type
const REDACTION_STRINGS: Record<string, string> = {
  email: '[EMAIL_REDACTED]',
  phone: '[PHONE_REDACTED]',
  ssn: '[SSN_REDACTED]',
  creditCard: '[CARD_REDACTED]',
  streetAddress: '[ADDRESS_REDACTED]',
  zipCode: '[ZIP_REDACTED]',
  sensitiveUrl: '[URL_REDACTED]',
  potentialName: '[NAME_REDACTED]',
}

// Fields in profile that contain PII
const PII_FIELD_PATTERNS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'street',
  'city',
  'zipCode',
  'linkedin',
  'github',
  'portfolio',
]

/**
 * Sanitize a single string value
 */
export function sanitizeString(value: string, options: SanitizeOptions = {}): string {
  let result = value

  // Apply each pattern
  for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
    // Skip name detection unless explicitly enabled (too aggressive)
    if (key === 'potentialName' && !options.redactNames) {
      continue
    }

    const replacement = REDACTION_STRINGS[key]
    result = result.replace(pattern, replacement)
  }

  return result
}

/**
 * Options for sanitization
 */
export interface SanitizeOptions {
  redactNames?: boolean
  redactUrls?: boolean
  preserveFieldNames?: boolean
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject(
  obj: unknown,
  options: SanitizeOptions = {}
): unknown {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options)
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options))
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      // Check if this field likely contains PII
      const isPIIField = PII_FIELD_PATTERNS.some(
        (pattern) => key.toLowerCase().includes(pattern.toLowerCase())
      )

      if (isPIIField && typeof value === 'string') {
        // Redact PII fields entirely
        result[key] = `[${key.toUpperCase()}_REDACTED]`
      } else {
        // Recursively sanitize
        result[key] = sanitizeObject(value, options)
      }
    }

    return result
  }

  return obj
}

/**
 * Sanitize console logs for bug reporting
 */
export function sanitizeLogs(logs: string[]): string[] {
  return logs.map((log) => sanitizeString(log, { redactUrls: true }))
}

/**
 * Create sanitized error report
 */
export interface ErrorReport {
  timestamp: string
  userAgent: string
  extensionVersion: string
  url: string
  error: string
  stack?: string
  additionalInfo?: Record<string, unknown>
}

export function createSanitizedErrorReport(
  error: Error,
  additionalInfo?: Record<string, unknown>
): ErrorReport {
  const report: ErrorReport = {
    timestamp: new Date().toISOString(),
    userAgent: sanitizeString(navigator.userAgent),
    extensionVersion: '1.0.0', // Will be pulled from manifest
    url: sanitizeString(window.location.href, { redactUrls: false }),
    error: error.message,
    stack: error.stack ? sanitizeString(error.stack) : undefined,
  }

  if (additionalInfo) {
    report.additionalInfo = sanitizeObject(additionalInfo) as Record<string, unknown>
  }

  return report
}

/**
 * Format error report for clipboard/display
 */
export function formatErrorReport(report: ErrorReport): string {
  const lines = [
    '=== Job Autofill Error Report ===',
    '',
    `Timestamp: ${report.timestamp}`,
    `Version: ${report.extensionVersion}`,
    `URL: ${report.url}`,
    `User Agent: ${report.userAgent}`,
    '',
    '--- Error ---',
    report.error,
  ]

  if (report.stack) {
    lines.push('', '--- Stack Trace ---', report.stack)
  }

  if (report.additionalInfo && Object.keys(report.additionalInfo).length > 0) {
    lines.push('', '--- Additional Info ---', JSON.stringify(report.additionalInfo, null, 2))
  }

  lines.push('', '=== End of Report ===')

  return lines.join('\n')
}

/**
 * Copy sanitized report to clipboard
 */
export async function copyReportToClipboard(report: ErrorReport): Promise<boolean> {
  try {
    const formatted = formatErrorReport(report)
    await navigator.clipboard.writeText(formatted)
    return true
  } catch {
    return false
  }
}

/**
 * Get extension version from manifest
 */
export function getExtensionVersion(): string {
  try {
    return chrome.runtime.getManifest().version
  } catch {
    return '1.0.0'
  }
}
