// Autofill orchestrator
// Connects profile data, mapping engine, and UI feedback

import type { Profile } from '../types/profile'
import type { ATSPlatform } from './detector'
import type { FillOperationResult, FieldFillResult } from '../mapping/types'
import { fillAllFields, previewFill } from '../mapping/engine'

// Autofill result with additional metadata
export interface AutofillResult extends FillOperationResult {
  hasProfile: boolean
  profileComplete: boolean
  needsAttention: string[]
}

// UI element IDs
const PROGRESS_ID = 'job-autofill-progress'
const SUMMARY_ID = 'job-autofill-summary'
const HIGHLIGHT_CLASS = 'job-autofill-unfilled'

// Inject progress/summary styles
function injectStyles(): void {
  if (document.getElementById('job-autofill-styles')) return

  const style = document.createElement('style')
  style.id = 'job-autofill-styles'
  style.textContent = `
    /* Progress Indicator */
    #${PROGRESS_ID} {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #1f2937;
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    #${PROGRESS_ID} .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    #${PROGRESS_ID} .checkmark {
      color: #22c55e;
      font-size: 20px;
    }

    /* Summary Panel */
    #${SUMMARY_ID} {
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 2147483646;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 320px;
      overflow: hidden;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #${SUMMARY_ID} .summary-header {
      background: #f8f9fa;
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #${SUMMARY_ID} .summary-title {
      font-weight: 600;
      font-size: 14px;
      color: #1f2937;
    }

    #${SUMMARY_ID} .summary-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 18px;
      padding: 0;
      line-height: 1;
    }

    #${SUMMARY_ID} .summary-close:hover {
      color: #1f2937;
    }

    #${SUMMARY_ID} .summary-body {
      padding: 16px;
    }

    #${SUMMARY_ID} .summary-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    #${SUMMARY_ID} .stat {
      text-align: center;
    }

    #${SUMMARY_ID} .stat-value {
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
    }

    #${SUMMARY_ID} .stat-value.success { color: #22c55e; }
    #${SUMMARY_ID} .stat-value.warning { color: #f59e0b; }
    #${SUMMARY_ID} .stat-value.error { color: #ef4444; }

    #${SUMMARY_ID} .stat-label {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    #${SUMMARY_ID} .unfilled-list {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    #${SUMMARY_ID} .unfilled-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }

    #${SUMMARY_ID} .unfilled-item {
      font-size: 13px;
      color: #374151;
      padding: 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    #${SUMMARY_ID} .unfilled-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f59e0b;
    }

    /* Unfilled field highlighting */
    .${HIGHLIGHT_CLASS} {
      outline: 2px solid #f59e0b !important;
      outline-offset: 2px !important;
      background-color: rgba(245, 158, 11, 0.1) !important;
    }

    .${HIGHLIGHT_CLASS}:focus {
      outline: 2px solid #f59e0b !important;
    }
  `
  document.head.appendChild(style)
}

// Show progress indicator
function showProgress(message: string): HTMLElement {
  injectStyles()
  removeProgress()

  const progress = document.createElement('div')
  progress.id = PROGRESS_ID
  progress.innerHTML = `
    <div class="spinner"></div>
    <span>${message}</span>
  `
  document.body.appendChild(progress)
  return progress
}

// Update progress to success
function showProgressSuccess(message: string): void {
  const progress = document.getElementById(PROGRESS_ID)
  if (progress) {
    progress.innerHTML = `
      <span class="checkmark">✓</span>
      <span>${message}</span>
    `
    // Auto-remove after 2 seconds
    setTimeout(() => {
      progress.style.animation = 'slideOut 0.3s ease forwards'
      setTimeout(removeProgress, 300)
    }, 2000)
  }
}

// Remove progress indicator
function removeProgress(): void {
  const progress = document.getElementById(PROGRESS_ID)
  if (progress) progress.remove()
}

// Show summary panel
function showSummary(result: AutofillResult): void {
  injectStyles()
  removeSummary()

  const summary = document.createElement('div')
  summary.id = SUMMARY_ID

  const unfilledHtml = result.needsAttention.length > 0
    ? `
      <div class="unfilled-list">
        <div class="unfilled-title">Fields needing attention:</div>
        ${result.needsAttention.slice(0, 5).map(field => `
          <div class="unfilled-item">
            <span class="unfilled-dot"></span>
            <span>${formatFieldName(field)}</span>
          </div>
        `).join('')}
        ${result.needsAttention.length > 5
          ? `<div class="unfilled-item" style="color: #6b7280;">
              ...and ${result.needsAttention.length - 5} more
            </div>`
          : ''}
      </div>
    `
    : ''

  summary.innerHTML = `
    <div class="summary-header">
      <span class="summary-title">Autofill Complete</span>
      <button class="summary-close" aria-label="Close">×</button>
    </div>
    <div class="summary-body">
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-value success">${result.filledFields}</div>
          <div class="stat-label">Filled</div>
        </div>
        <div class="stat">
          <div class="stat-value warning">${result.skippedFields}</div>
          <div class="stat-label">Skipped</div>
        </div>
        <div class="stat">
          <div class="stat-value error">${result.failedFields}</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>
      ${unfilledHtml}
    </div>
  `

  const closeBtn = summary.querySelector('.summary-close')
  closeBtn?.addEventListener('click', () => {
    removeSummary()
    removeHighlights()
  })

  document.body.appendChild(summary)

  // Auto-remove after 30 seconds
  setTimeout(() => {
    removeSummary()
  }, 30000)
}

// Remove summary panel
function removeSummary(): void {
  const summary = document.getElementById(SUMMARY_ID)
  if (summary) summary.remove()
}

// Highlight unfilled fields
function highlightUnfilledFields(results: FieldFillResult[]): void {
  removeHighlights()

  for (const result of results) {
    if (!result.success && result.element && result.error !== 'No value in profile') {
      result.element.classList.add(HIGHLIGHT_CLASS)
    }
  }
}

// Remove all highlights
function removeHighlights(): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach(el => {
    el.classList.remove(HIGHLIGHT_CLASS)
  })
}

// Format field name for display
function formatFieldName(fieldPath: string): string {
  const mapping: Record<string, string> = {
    'personalInfo.firstName': 'First Name',
    'personalInfo.lastName': 'Last Name',
    'personalInfo.email': 'Email',
    'personalInfo.phone': 'Phone',
    'personalInfo.address.street': 'Street Address',
    'personalInfo.address.city': 'City',
    'personalInfo.address.state': 'State',
    'personalInfo.address.zipCode': 'ZIP Code',
    'personalInfo.address.country': 'Country',
    'professionalLinks.linkedin': 'LinkedIn',
    'professionalLinks.github': 'GitHub',
    'professionalLinks.portfolio': 'Portfolio',
    'workAuthorization.authorized': 'Work Authorization',
    'workAuthorization.sponsorship': 'Sponsorship Required',
    'selfIdentification.gender': 'Gender',
    'selfIdentification.ethnicity': 'Ethnicity',
    'selfIdentification.veteran': 'Veteran Status',
    'selfIdentification.disability': 'Disability Status',
  }
  return mapping[fieldPath] || fieldPath.split('.').pop() || fieldPath
}

// Check if field has existing value
function fieldHasValue(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'input') {
    const input = element as HTMLInputElement
    if (input.type === 'checkbox' || input.type === 'radio') {
      return input.checked
    }
    return input.value.trim().length > 0
  }

  if (tagName === 'select') {
    const select = element as HTMLSelectElement
    // Check if a non-default option is selected
    return select.selectedIndex > 0 || (select.value !== '' && select.value !== select.options[0]?.value)
  }

  if (tagName === 'textarea') {
    return (element as HTMLTextAreaElement).value.trim().length > 0
  }

  return false
}

// Main autofill function
export async function executeAutofill(
  platform: Exclude<ATSPlatform, 'unknown'>,
  profile: Profile,
  options: {
    skipFilled?: boolean
    showProgress?: boolean
    showSummary?: boolean
    highlightUnfilled?: boolean
  } = {}
): Promise<AutofillResult> {
  const {
    skipFilled = true,
    showProgress: showProgressIndicator = true,
    showSummary: showSummaryPanel = true,
    highlightUnfilled = true,
  } = options

  // Show progress
  if (showProgressIndicator) {
    showProgress('Filling form fields...')
  }

  // Check profile completeness
  const profileComplete = checkProfileCompleteness(profile)

  // Execute fill
  const fillResult = await fillAllFields(platform, profile, {
    skipFilled,
  })

  // Determine which fields need attention
  const needsAttention: string[] = []
  for (const result of fillResult.results) {
    if (!result.success && result.error !== 'No value in profile') {
      needsAttention.push(result.profileField)
    }
  }

  // Also add fields that weren't in profile
  for (const result of fillResult.results) {
    if (result.error === 'No value in profile') {
      needsAttention.push(result.profileField)
    }
  }

  const autofillResult: AutofillResult = {
    ...fillResult,
    hasProfile: true,
    profileComplete,
    needsAttention,
  }

  // Update UI
  if (showProgressIndicator) {
    showProgressSuccess(`Filled ${fillResult.filledFields} of ${fillResult.totalFields} fields`)
  }

  if (showSummaryPanel) {
    showSummary(autofillResult)
  }

  if (highlightUnfilled) {
    highlightUnfilledFields(fillResult.results)
  }

  return autofillResult
}

// Check profile completeness
function checkProfileCompleteness(profile: Profile): boolean {
  const requiredFields = [
    profile.personalInfo?.firstName,
    profile.personalInfo?.lastName,
    profile.personalInfo?.email,
  ]
  return requiredFields.every(field => field && field.trim().length > 0)
}

// Preview autofill without executing
export function previewAutofill(
  platform: Exclude<ATSPlatform, 'unknown'>,
  profile: Profile
): {
  canFill: number
  alreadyFilled: number
  missingInProfile: number
  total: number
} {
  const preview = previewFill(platform, profile)

  let canFill = 0
  let alreadyFilled = 0
  let missingInProfile = 0

  for (const field of preview) {
    if (!field.found) continue

    if (field.element && fieldHasValue(field.element)) {
      alreadyFilled++
    } else if (field.value === undefined || field.value === null || field.value === '') {
      missingInProfile++
    } else {
      canFill++
    }
  }

  return {
    canFill,
    alreadyFilled,
    missingInProfile,
    total: preview.length,
  }
}

// Clean up all autofill UI elements
export function cleanupAutofillUI(): void {
  removeProgress()
  removeSummary()
  removeHighlights()
}
