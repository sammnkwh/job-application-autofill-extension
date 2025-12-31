// ATS Platform Detection Module

export type ATSPlatform = 'workday' | 'greenhouse' | 'unknown'

export interface DetectionResult {
  platform: ATSPlatform
  confidence: 'high' | 'medium' | 'low'
  url: string
  detectionMethod: 'url' | 'dom' | 'both'
}

// URL Patterns for ATS platforms
const URL_PATTERNS = {
  workday: [
    /\.myworkdayjobs\.com/i,
    /\.workday\.com\/.*\/d\/jobs/i,
    /\.workday\.com\/.*\/job/i,
    /\.wd\d+\.myworkdaysite\.com/i,
  ],
  greenhouse: [
    /boards\.greenhouse\.io/i,
    /\.greenhouse\.io\/.*\/jobs/i,
    /job-boards\.greenhouse\.io/i,
  ],
}

// DOM Detection selectors
const DOM_SELECTORS = {
  workday: [
    '[data-automation-id]',
    '[data-uxi-widget-type]',
    '[class*="WDNC"]', // Workday component class
    '[class*="WD-"]',
    '#wd-Navigation',
  ],
  greenhouse: [
    '#greenhouse-jobboard',
    '.greenhouse-job-board',
    '[data-greenhouse]',
    '#grnhse_app',
    '.grnhse',
    '#app_submit', // Greenhouse submit button
  ],
}

/**
 * Detect ATS platform from URL
 */
export function detectFromUrl(url: string): { platform: ATSPlatform; matched: boolean } {
  // Check Workday patterns
  for (const pattern of URL_PATTERNS.workday) {
    if (pattern.test(url)) {
      return { platform: 'workday', matched: true }
    }
  }

  // Check Greenhouse patterns
  for (const pattern of URL_PATTERNS.greenhouse) {
    if (pattern.test(url)) {
      return { platform: 'greenhouse', matched: true }
    }
  }

  return { platform: 'unknown', matched: false }
}

/**
 * Detect ATS platform from DOM
 */
export function detectFromDom(document: Document): { platform: ATSPlatform; matched: boolean } {
  // Check Workday selectors
  for (const selector of DOM_SELECTORS.workday) {
    if (document.querySelector(selector)) {
      return { platform: 'workday', matched: true }
    }
  }

  // Check Greenhouse selectors
  for (const selector of DOM_SELECTORS.greenhouse) {
    if (document.querySelector(selector)) {
      return { platform: 'greenhouse', matched: true }
    }
  }

  return { platform: 'unknown', matched: false }
}

/**
 * Full detection combining URL and DOM
 */
export function detectPlatform(url: string, doc?: Document): DetectionResult {
  const urlResult = detectFromUrl(url)
  const domResult = doc ? detectFromDom(doc) : { platform: 'unknown' as ATSPlatform, matched: false }

  // Both URL and DOM match same platform - high confidence
  if (urlResult.matched && domResult.matched && urlResult.platform === domResult.platform) {
    return {
      platform: urlResult.platform,
      confidence: 'high',
      url,
      detectionMethod: 'both',
    }
  }

  // URL matches - medium confidence
  if (urlResult.matched) {
    return {
      platform: urlResult.platform,
      confidence: 'medium',
      url,
      detectionMethod: 'url',
    }
  }

  // DOM matches only - medium confidence (could be embedded)
  if (domResult.matched) {
    return {
      platform: domResult.platform,
      confidence: 'medium',
      url,
      detectionMethod: 'dom',
    }
  }

  // No match
  return {
    platform: 'unknown',
    confidence: 'low',
    url,
    detectionMethod: 'url',
  }
}

/**
 * Check if current page is a supported ATS platform
 */
export function isSupported(result: DetectionResult): boolean {
  return result.platform !== 'unknown'
}

/**
 * Get human-readable platform name
 */
export function getPlatformName(platform: ATSPlatform): string {
  switch (platform) {
    case 'workday':
      return 'Workday'
    case 'greenhouse':
      return 'Greenhouse'
    default:
      return 'Unknown'
  }
}
