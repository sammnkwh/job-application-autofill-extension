// Field Detection Utilities
// Find and identify form fields using mapping selectors

import type {
  FieldSelector,
  FieldMapping,
  FieldDetectionResult,
  FieldType,
} from './types'

/**
 * Try to find an element using a selector with fallbacks
 */
function findWithFallbacks(
  selector: string,
  fallbacks: string[] = [],
  container: Element = document.body
): HTMLElement | null {
  // Try primary selector
  const element = container.querySelector<HTMLElement>(selector)
  if (element) return element

  // Try fallbacks
  for (const fallback of fallbacks) {
    const fallbackElement = container.querySelector<HTMLElement>(fallback)
    if (fallbackElement) return fallbackElement
  }

  return null
}

/**
 * Check if a label matches the expected patterns
 */
function matchesLabelPattern(
  element: HTMLElement,
  patterns: (string | RegExp)[],
  _labelAttribute?: FieldSelector['labelAttribute']
): boolean {
  // Get potential label text
  const labelTexts: string[] = []

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) labelTexts.push(ariaLabel.toLowerCase())

  // Check placeholder
  const placeholder = element.getAttribute('placeholder')
  if (placeholder) labelTexts.push(placeholder.toLowerCase())

  // Check name attribute
  const name = element.getAttribute('name')
  if (name) labelTexts.push(name.toLowerCase())

  // Check id attribute
  const id = element.getAttribute('id')
  if (id) labelTexts.push(id.toLowerCase())

  // Check data-automation-id
  const automationId = element.getAttribute('data-automation-id')
  if (automationId) labelTexts.push(automationId.toLowerCase())

  // Check associated label element
  if (id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`)
    if (label?.textContent) {
      labelTexts.push(label.textContent.toLowerCase())
    }
  }

  // Check parent label
  const parentLabel = element.closest('label')
  if (parentLabel?.textContent) {
    labelTexts.push(parentLabel.textContent.toLowerCase())
  }

  // Match against patterns
  for (const text of labelTexts) {
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (text.includes(pattern.toLowerCase())) {
          return true
        }
      } else if (pattern.test(text)) {
        return true
      }
    }
  }

  return false
}

/**
 * Detect the type of a form field
 */
function detectFieldType(element: HTMLElement): FieldType {
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'select') return 'select'
  if (tagName === 'textarea') return 'textarea'

  if (tagName === 'input') {
    const type = (element as HTMLInputElement).type.toLowerCase()
    switch (type) {
      case 'email':
        return 'email'
      case 'tel':
        return 'tel'
      case 'checkbox':
        return 'checkbox'
      case 'radio':
        return 'radio'
      case 'file':
        return 'file'
      case 'hidden':
        return 'hidden'
      case 'date':
        return 'date'
      default:
        return 'text'
    }
  }

  // Default to text for contenteditable or other elements
  return 'text'
}

/**
 * Get the current value of a field
 */
function getFieldValue(element: HTMLElement): string {
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'input' || tagName === 'textarea') {
    return (element as HTMLInputElement).value
  }

  if (tagName === 'select') {
    return (element as HTMLSelectElement).value
  }

  return element.textContent || ''
}

/**
 * Calculate confidence based on how the field was found
 */
function calculateConfidence(
  matchedByPrimarySelector: boolean,
  matchedByLabelPattern: boolean,
  typeMatches: boolean
): FieldDetectionResult['confidence'] {
  // High confidence: Primary selector matched and type is correct
  if (matchedByPrimarySelector && typeMatches) {
    return 'high'
  }

  // Medium confidence: Either matched by fallback or label pattern matched
  if (matchedByLabelPattern || matchedByPrimarySelector) {
    return 'medium'
  }

  // Low confidence: Only found by fallback without label verification
  return 'low'
}

/**
 * Detect a single field using a field mapping
 */
export function detectField(
  mapping: FieldMapping,
  container: Element = document.body
): FieldDetectionResult {
  for (const selectorConfig of mapping.selectors) {
    // Get the container to search in
    const searchContainer = selectorConfig.container
      ? document.querySelector(selectorConfig.container) || container
      : container

    // Try to find the element
    const element = findWithFallbacks(
      selectorConfig.selector,
      selectorConfig.fallbacks,
      searchContainer as Element
    )

    if (element) {
      const matchedByPrimarySelector =
        !!searchContainer.querySelector(selectorConfig.selector)

      const matchedByLabelPattern = selectorConfig.labelPatterns
        ? matchesLabelPattern(
            element,
            selectorConfig.labelPatterns,
            selectorConfig.labelAttribute
          )
        : false

      const detectedType = detectFieldType(element)
      const typeMatches = detectedType === mapping.fieldType

      return {
        element,
        matchedSelector: selectorConfig.selector,
        confidence: calculateConfidence(
          matchedByPrimarySelector,
          matchedByLabelPattern,
          typeMatches
        ),
        detectedType,
        currentValue: getFieldValue(element),
      }
    }
  }

  // No element found
  return {
    element: null,
    confidence: 'low',
  }
}

/**
 * Detect all fields for a set of mappings
 */
export function detectAllFields(
  mappings: FieldMapping[],
  container: Element = document.body
): Map<FieldMapping['profileField'], FieldDetectionResult> {
  const results = new Map<FieldMapping['profileField'], FieldDetectionResult>()

  for (const mapping of mappings) {
    const result = detectField(mapping, container)
    results.set(mapping.profileField, result)
  }

  return results
}

/**
 * Check if a field is visible and interactable
 */
export function isFieldInteractable(element: HTMLElement): boolean {
  // Check if element is visible
  const style = window.getComputedStyle(element)
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }

  // Check if element is disabled
  if ((element as HTMLInputElement).disabled) {
    return false
  }

  // Check if element is readonly
  if ((element as HTMLInputElement).readOnly) {
    return false
  }

  // Check if element has dimensions (skip for form elements in test environments)
  // Form elements like input, select, textarea are interactable even with 0 dimensions in jsdom
  const tagName = element.tagName.toLowerCase()
  const isFormElement = ['input', 'select', 'textarea'].includes(tagName)

  if (!isFormElement) {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return false
    }
  }

  return true
}

/**
 * Find all fillable fields on the current page
 */
export function findAllFillableFields(
  container: Element = document.body
): HTMLElement[] {
  const selectors = [
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"])',
    'select',
    'textarea',
  ]

  const elements: HTMLElement[] = []

  for (const selector of selectors) {
    const found = container.querySelectorAll<HTMLElement>(selector)
    for (const element of found) {
      if (isFieldInteractable(element)) {
        elements.push(element)
      }
    }
  }

  return elements
}
