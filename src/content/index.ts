// Content script injected into Workday and Greenhouse pages
// Handles platform detection and form autofill

import { detectPlatform, isSupported, getPlatformName, type DetectionResult } from './detector'

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
    runDetection()
  }
})

urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
})

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_DETECTION_RESULT') {
    sendResponse({
      result: detectionResult,
      supported: detectionResult ? isSupported(detectionResult) : false,
    })
  }

  if (message.type === 'TRIGGER_AUTOFILL') {
    // TODO: Implement autofill logic
    console.log('Job Autofill: Autofill triggered')
    sendResponse({ success: true, message: 'Autofill not yet implemented' })
  }

  return true
})

export {}
