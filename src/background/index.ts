// Background service worker for the extension
// Handles messages from content scripts and manages extension state

console.log('Background service worker loaded')

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message, 'from:', sender)

  if (message.type === 'PLATFORM_DETECTED') {
    // Update icon based on platform detection
    const iconPath = message.platform
      ? 'icons/icon-48-active.png'
      : 'icons/icon-48.png'

    if (sender.tab?.id) {
      chrome.action.setIcon({
        path: iconPath,
        tabId: sender.tab.id
      })
    }

    sendResponse({ success: true })
  }

  return true // Keep message channel open for async response
})

export {}
