// Error logging utility for capturing and storing errors

const ERROR_LOG_KEY = 'errorLog'
const MAX_ERRORS = 20

export interface LoggedError {
  timestamp: string
  message: string
  context?: string
  stack?: string
}

/**
 * Log an error to storage
 */
export async function logError(
  error: Error | string,
  context?: string
): Promise<void> {
  try {
    const errorEntry: LoggedError = {
      timestamp: new Date().toISOString(),
      message: typeof error === 'string' ? error : error.message,
      context,
      stack: typeof error === 'string' ? undefined : error.stack,
    }

    // Get existing errors
    const existing = await getRecentErrors()

    // Add new error at the beginning
    existing.unshift(errorEntry)

    // Keep only the last MAX_ERRORS
    const trimmed = existing.slice(0, MAX_ERRORS)

    // Save back to storage
    await chrome.storage.local.set({ [ERROR_LOG_KEY]: trimmed })
  } catch {
    // Silently fail - we don't want error logging to cause more errors
    console.error('Failed to log error:', error)
  }
}

/**
 * Get recent errors from storage
 */
export async function getRecentErrors(): Promise<LoggedError[]> {
  try {
    const result = await chrome.storage.local.get(ERROR_LOG_KEY)
    return (result[ERROR_LOG_KEY] as LoggedError[]) || []
  } catch {
    return []
  }
}

/**
 * Clear all logged errors
 */
export async function clearErrorLog(): Promise<void> {
  try {
    await chrome.storage.local.remove(ERROR_LOG_KEY)
  } catch {
    console.error('Failed to clear error log')
  }
}

/**
 * Format errors for display in debug info
 */
export function formatErrorLog(errors: LoggedError[]): string {
  if (errors.length === 0) {
    return 'No recent errors'
  }

  return errors
    .map((err) => {
      const time = new Date(err.timestamp).toLocaleString()
      const context = err.context ? ` [${err.context}]` : ''
      return `[${time}]${context} ${err.message}`
    })
    .join('\n')
}

/**
 * Global error handler - attach to window.onerror
 */
export function setupGlobalErrorHandler(): void {
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, 'Uncaught Error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason)
    logError(message, 'Unhandled Promise Rejection')
  })
}
