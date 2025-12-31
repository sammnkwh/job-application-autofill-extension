// Content script injected into Workday and Greenhouse pages
// Handles platform detection and form autofill

import { detectPlatform, isSupported, getPlatformName, type DetectionResult, type ATSPlatform } from './detector'
import { createIndicator, updateIndicator, removeIndicator } from './FloatingIndicator'
import { executeAutofill, previewAutofill, cleanupAutofillUI, type AutofillResult } from './autofill'
import { loadProfile } from '../utils/storage'

console.log('Job Autofill: Content script loaded on:', window.location.href)

// Store detection result
let detectionResult: DetectionResult | null = null

// Run detection
function runDetection(): DetectionResult {
  const result = detectPlatform(window.location.href, document)
  detectionResult = result

  console.log('Job Autofill: Platform detection result:', {
    platform: result.platform,
    platformName: getPlatformName(result.platform),
    confidence: result.confidence,
    method: result.detectionMethod,
  })

  // Notify background script
  chrome.runtime.sendMessage({
    type: 'PLATFORM_DETECTED',
    platform: result.platform,
    confidence: result.confidence,
  })

  // Show/hide floating indicator
  if (isSupported(result)) {
    createIndicator(result.platform)
  } else {
    removeIndicator()
  }

  return result
}

// Initial detection after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => runDetection())
} else {
  runDetection()
}

// Re-run detection on URL changes (for SPAs)
let lastUrl = window.location.href
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href
    console.log('Job Autofill: URL changed, re-running detection')
    // Clean up previous autofill UI
    cleanupAutofillUI()
    const result = runDetection()
    updateIndicator(result.platform)
  }
})

urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
})

// Execute autofill with profile data
async function performAutofill(): Promise<AutofillResult | { success: false; error: string }> {
  // Check platform
  if (!detectionResult || !isSupported(detectionResult)) {
    return { success: false, error: 'Not on a supported platform' }
  }

  const platform = detectionResult.platform as Exclude<ATSPlatform, 'unknown'>

  // Load profile from storage
  const profileResult = await loadProfile()
  if (!profileResult.success || !profileResult.data) {
    return { success: false, error: 'No profile found. Please set up your profile first.' }
  }

  const profile = profileResult.data

  // Execute autofill
  console.log('Job Autofill: Starting autofill for platform:', platform)
  const result = await executeAutofill(platform, profile, {
    skipFilled: true,
    showProgress: true,
    showSummary: true,
    highlightUnfilled: true,
  })

  console.log('Job Autofill: Autofill complete:', {
    filled: result.filledFields,
    skipped: result.skippedFields,
    failed: result.failedFields,
    duration: `${Math.round(result.duration)}ms`,
  })

  return result
}

// Get preview of autofill
async function getAutofillPreview(): Promise<{
  canFill: number
  alreadyFilled: number
  missingInProfile: number
  total: number
} | { error: string }> {
  if (!detectionResult || !isSupported(detectionResult)) {
    return { error: 'Not on a supported platform' }
  }

  const platform = detectionResult.platform as Exclude<ATSPlatform, 'unknown'>

  const profileResult = await loadProfile()
  if (!profileResult.success || !profileResult.data) {
    return { error: 'No profile found' }
  }

  return previewAutofill(platform, profileResult.data)
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_DETECTION_RESULT') {
    sendResponse({
      result: detectionResult,
      supported: detectionResult ? isSupported(detectionResult) : false,
    })
  }

  if (message.type === 'TRIGGER_AUTOFILL') {
    console.log('Job Autofill: Autofill triggered from popup')
    performAutofill().then(result => {
      sendResponse(result)
    })
    return true // Keep channel open for async response
  }

  if (message.type === 'GET_AUTOFILL_PREVIEW') {
    getAutofillPreview().then(result => {
      sendResponse(result)
    })
    return true
  }

  if (message.type === 'CLEANUP_AUTOFILL_UI') {
    cleanupAutofillUI()
    sendResponse({ success: true })
  }

  return true
})

export {}
