// Background service worker for the extension
// Handles messages from content scripts and manages extension state

import { detectFromUrl, getPlatformName, type ATSPlatform } from '../content/detector'
import { logError } from '../utils/errorLogger'

console.log('Background service worker loaded')

// Icon paths
const ICONS = {
  default: {
    16: 'icons/icon-16.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  active: {
    16: 'icons/icon-16-active.png',
    48: 'icons/icon-48-active.png',
    128: 'icons/icon-128-active.png',
  },
}

// Update icon and badge for a tab
function updateTabIcon(tabId: number, platform: ATSPlatform) {
  const isSupported = platform !== 'unknown'

  chrome.action.setIcon({
    path: isSupported ? ICONS.active : ICONS.default,
    tabId,
  })

  if (isSupported) {
    chrome.action.setBadgeText({
      text: platform === 'workday' ? 'WD' : 'GH',
      tabId,
    })
    chrome.action.setBadgeBackgroundColor({
      color: '#22c55e',
      tabId,
    })
  } else {
    chrome.action.setBadgeText({ text: '', tabId })
  }
}

// Check URL when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const { platform } = detectFromUrl(tab.url)
    updateTabIcon(tabId, platform)
  }
})

// Check URL when tab is activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    if (tab.url) {
      const { platform } = detectFromUrl(tab.url)
      updateTabIcon(activeInfo.tabId, platform)
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'Background: onActivated')
    console.error('Error getting tab:', error)
  }
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message, 'from:', sender)

  if (message.type === 'PLATFORM_DETECTED') {
    const platform = message.platform as ATSPlatform

    if (sender.tab?.id) {
      updateTabIcon(sender.tab.id, platform)
    }

    sendResponse({ success: true, platformName: getPlatformName(platform) })
  }

  if (message.type === 'GET_PLATFORM') {
    if (sender.tab?.url) {
      const { platform } = detectFromUrl(sender.tab.url)
      sendResponse({ platform, platformName: getPlatformName(platform) })
    } else {
      sendResponse({ platform: 'unknown', platformName: 'Unknown' })
    }
  }

  // Forward autofill trigger from floating indicator back to content script
  if (message.type === 'TRIGGER_AUTOFILL_FROM_INDICATOR') {
    if (sender.tab?.id) {
      // Send message to the same tab to trigger autofill
      chrome.tabs.sendMessage(sender.tab.id, { type: 'TRIGGER_AUTOFILL' })
        .then(response => {
          console.log('Autofill response:', response)
        })
        .catch(error => {
          logError(error instanceof Error ? error : new Error(String(error)), 'Background: triggerAutofill')
          console.error('Error triggering autofill:', error)
        })
    }
    sendResponse({ success: true })
  }

  return true // Keep message channel open for async response
})

export {}
