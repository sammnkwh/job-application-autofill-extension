// Floating indicator with pulsating animation for ATS detection

import type { ATSPlatform } from './detector'

const INDICATOR_ID = 'job-autofill-indicator'

// CSS styles for the floating indicator
const styles = `
  #${INDICATOR_ID} {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #22c55e;
    color: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    user-select: none;
  }

  #${INDICATOR_ID}:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.5);
  }

  #${INDICATOR_ID}:active {
    transform: scale(0.95);
  }

  /* Pulsating rings */
  #${INDICATOR_ID}::before,
  #${INDICATOR_ID}::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #22c55e;
    opacity: 0;
    animation: pulse-ring 2s ease-out infinite;
  }

  #${INDICATOR_ID}::after {
    animation-delay: 1s;
  }

  @keyframes pulse-ring {
    0% {
      width: 100%;
      height: 100%;
      opacity: 0.6;
    }
    100% {
      width: 180%;
      height: 180%;
      opacity: 0;
    }
  }

  /* Inner content */
  #${INDICATOR_ID} .indicator-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  #${INDICATOR_ID} .indicator-icon {
    font-size: 18px;
    line-height: 1;
  }

  #${INDICATOR_ID} .indicator-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  /* Tooltip */
  #${INDICATOR_ID} .indicator-tooltip {
    position: absolute;
    bottom: calc(100% + 12px);
    right: 0;
    background: #1f2937;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  #${INDICATOR_ID} .indicator-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: #1f2937;
  }

  #${INDICATOR_ID}:hover .indicator-tooltip {
    opacity: 1;
    visibility: visible;
  }

  /* Minimized state */
  #${INDICATOR_ID}.minimized {
    width: 40px;
    height: 40px;
    opacity: 0.7;
  }

  #${INDICATOR_ID}.minimized:hover {
    opacity: 1;
  }

  #${INDICATOR_ID}.minimized .indicator-text {
    display: none;
  }

  #${INDICATOR_ID}.minimized::before,
  #${INDICATOR_ID}.minimized::after {
    animation: none;
    opacity: 0;
  }
`

// Create and inject the floating indicator
export function createIndicator(platform: ATSPlatform): HTMLElement | null {
  if (platform === 'unknown') return null

  // Remove existing indicator if any
  removeIndicator()

  // Inject styles
  const styleEl = document.createElement('style')
  styleEl.id = `${INDICATOR_ID}-styles`
  styleEl.textContent = styles
  document.head.appendChild(styleEl)

  // Create indicator element
  const indicator = document.createElement('div')
  indicator.id = INDICATOR_ID
  indicator.innerHTML = `
    <div class="indicator-content">
      <span class="indicator-icon">✨</span>
      <span class="indicator-text">${platform === 'workday' ? 'WD' : 'GH'}</span>
    </div>
    <div class="indicator-tooltip">
      Click to autofill with Job Autofill
    </div>
  `

  // Add click handler
  indicator.addEventListener('click', () => {
    // Send message to trigger autofill
    chrome.runtime.sendMessage({ type: 'TRIGGER_AUTOFILL_FROM_INDICATOR' })

    // Visual feedback
    indicator.style.transform = 'scale(0.9)'
    setTimeout(() => {
      indicator.style.transform = ''
    }, 150)
  })

  // Add double-click to minimize
  let clickCount = 0
  let clickTimer: ReturnType<typeof setTimeout> | null = null

  indicator.addEventListener('click', (e) => {
    clickCount++
    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        clickCount = 0
      }, 300)
    } else if (clickCount === 2) {
      if (clickTimer) clearTimeout(clickTimer)
      clickCount = 0
      indicator.classList.toggle('minimized')
      e.stopPropagation()
    }
  })

  document.body.appendChild(indicator)
  return indicator
}

// Remove the floating indicator
export function removeIndicator(): void {
  const indicator = document.getElementById(INDICATOR_ID)
  const styles = document.getElementById(`${INDICATOR_ID}-styles`)

  if (indicator) indicator.remove()
  if (styles) styles.remove()
}

// Update indicator platform
export function updateIndicator(platform: ATSPlatform): void {
  if (platform === 'unknown') {
    removeIndicator()
  } else {
    const existing = document.getElementById(INDICATOR_ID)
    if (existing) {
      const textEl = existing.querySelector('.indicator-text')
      if (textEl) {
        textEl.textContent = platform === 'workday' ? 'WD' : 'GH'
      }
    } else {
      createIndicator(platform)
    }
  }
}
