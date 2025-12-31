// Field Mapping Engine
// Coordinates field detection, value extraction, and form filling

import type { Profile } from '../types/profile'
import type { ATSPlatform } from '../content/detector'
import type {
  FieldMapping,
  FieldFillResult,
  FillOperationResult,
  PlatformMappingConfig,
  ProfileFieldPath,
} from './types'
import { detectField, isFieldInteractable } from './fieldDetector'
import { workdayConfig } from './workday'
import { greenhouseConfig } from './greenhouse'

// Map of platform to config
const platformConfigs: Record<
  Exclude<ATSPlatform, 'unknown'>,
  PlatformMappingConfig
> = {
  workday: workdayConfig,
  greenhouse: greenhouseConfig,
}

/**
 * Get a value from a nested object using dot notation path
 */
function getValueByPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Map profile field paths to actual Profile object paths
 * This handles any naming differences between our mappings and the Profile type
 */
function getProfileValue(profile: Profile, fieldPath: ProfileFieldPath): unknown {
  // Map the field path to actual Profile property paths
  const pathMappings: Record<ProfileFieldPath, string> = {
    'personalInfo.firstName': 'personalInfo.firstName',
    'personalInfo.lastName': 'personalInfo.lastName',
    'personalInfo.email': 'personalInfo.email',
    'personalInfo.phone': 'personalInfo.phone',
    'personalInfo.address.street': 'personalInfo.address.street',
    'personalInfo.address.city': 'personalInfo.address.city',
    'personalInfo.address.state': 'personalInfo.address.state',
    'personalInfo.address.zipCode': 'personalInfo.address.zipCode',
    'personalInfo.address.country': 'personalInfo.address.country',
    'professionalLinks.linkedin': 'professionalLinks.linkedin',
    'professionalLinks.github': 'professionalLinks.github',
    'professionalLinks.portfolio': 'professionalLinks.portfolio',
    'workAuthorization.authorized': 'workAuthorization.authorizedToWork',
    'workAuthorization.sponsorship': 'workAuthorization.requiresSponsorship',
    'workAuthorization.visaStatus': 'workAuthorization.visaStatus',
    'selfIdentification.gender': 'voluntarySelfIdentification.gender',
    'selfIdentification.ethnicity': 'voluntarySelfIdentification.ethnicity',
    'selfIdentification.veteran': 'voluntarySelfIdentification.veteranStatus',
    'selfIdentification.disability': 'voluntarySelfIdentification.disabilityStatus',
    experience: 'workExperience',
    education: 'education',
    skills: 'skillsAndQualifications.skills',
  }

  const actualPath = pathMappings[fieldPath] || fieldPath
  return getValueByPath(profile as unknown as Record<string, unknown>, actualPath)
}

/**
 * Set the value of a form field with proper event dispatching
 */
async function setFieldValue(
  element: HTMLElement,
  value: string | boolean
): Promise<boolean> {
  const tagName = element.tagName.toLowerCase()

  try {
    if (tagName === 'input') {
      const input = element as HTMLInputElement
      const inputType = input.type.toLowerCase()

      if (inputType === 'checkbox') {
        const shouldCheck = typeof value === 'boolean' ? value : value === 'true'
        if (input.checked !== shouldCheck) {
          input.click()
        }
      } else if (inputType === 'radio') {
        // For radio buttons, find the one with matching value
        const radioGroup = document.querySelectorAll<HTMLInputElement>(
          `input[type="radio"][name="${input.name}"]`
        )
        for (const radio of radioGroup) {
          const radioValue = radio.value.toLowerCase()
          const targetValue = String(value).toLowerCase()
          if (
            radioValue === targetValue ||
            radioValue.includes(targetValue) ||
            targetValue.includes(radioValue)
          ) {
            radio.click()
            return true
          }
        }
        return false
      } else {
        // Text, email, tel, etc.
        input.focus()
        input.value = String(value)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
        input.blur()
      }
    } else if (tagName === 'textarea') {
      const textarea = element as HTMLTextAreaElement
      textarea.focus()
      textarea.value = String(value)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.dispatchEvent(new Event('change', { bubbles: true }))
      textarea.blur()
    } else if (tagName === 'select') {
      const select = element as HTMLSelectElement
      const targetValue = String(value).toLowerCase()

      // Try to find a matching option
      let matched = false
      for (const option of select.options) {
        const optionValue = option.value.toLowerCase()
        const optionText = option.textContent?.toLowerCase() || ''

        if (
          optionValue === targetValue ||
          optionText === targetValue ||
          optionValue.includes(targetValue) ||
          optionText.includes(targetValue) ||
          targetValue.includes(optionValue) ||
          targetValue.includes(optionText)
        ) {
          select.value = option.value
          matched = true
          break
        }
      }

      if (matched) {
        select.dispatchEvent(new Event('change', { bubbles: true }))
      } else {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error setting field value:', error)
    return false
  }
}

/**
 * Fill a single field
 */
async function fillField(
  mapping: FieldMapping,
  profile: Profile,
  container: Element = document.body
): Promise<FieldFillResult> {
  const result: FieldFillResult = {
    profileField: mapping.profileField,
    success: false,
  }

  // Get the value from the profile
  let value = getProfileValue(profile, mapping.profileField)

  // Skip if no value
  if (value === undefined || value === null || value === '') {
    result.error = 'No value in profile'
    return result
  }

  // Apply transform if present
  if (mapping.transform) {
    value = mapping.transform(value)
  }

  // Detect the field
  const detection = detectField(mapping, container)

  if (!detection.element) {
    result.error = 'Field not found'
    return result
  }

  // Check if field is interactable
  if (!isFieldInteractable(detection.element)) {
    result.error = 'Field not interactable'
    return result
  }

  // Store previous value
  result.previousValue = detection.currentValue
  result.element = detection.element

  // Set the new value
  const success = await setFieldValue(
    detection.element,
    value as string | boolean
  )

  if (success) {
    result.success = true
    result.newValue = String(value)
  } else {
    result.error = 'Failed to set value'
  }

  // Wait if delay is specified
  if (mapping.delayAfter && success) {
    await new Promise((resolve) => setTimeout(resolve, mapping.delayAfter))
  }

  return result
}

/**
 * Fill all fields for a platform
 */
export async function fillAllFields(
  platform: Exclude<ATSPlatform, 'unknown'>,
  profile: Profile,
  options: {
    container?: Element
    skipFilled?: boolean
    requiredOnly?: boolean
  } = {}
): Promise<FillOperationResult> {
  const startTime = performance.now()
  const config = platformConfigs[platform]

  if (!config) {
    return {
      platform,
      totalFields: 0,
      filledFields: 0,
      skippedFields: 0,
      failedFields: 0,
      results: [],
      duration: 0,
    }
  }

  const container = options.container || document.body
  const results: FieldFillResult[] = []

  // Sort mappings by priority (higher first)
  const sortedMappings = [...config.mappings].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  )

  // Filter to required only if specified
  const mappingsToProcess = options.requiredOnly
    ? sortedMappings.filter((m) => m.required)
    : sortedMappings

  for (const mapping of mappingsToProcess) {
    const result = await fillField(mapping, profile, container)
    results.push(result)

    // Small delay between fields to avoid overwhelming the page
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  const duration = performance.now() - startTime

  return {
    platform,
    totalFields: mappingsToProcess.length,
    filledFields: results.filter((r) => r.success).length,
    skippedFields: results.filter((r) => r.error === 'No value in profile').length,
    failedFields: results.filter(
      (r) => !r.success && r.error !== 'No value in profile'
    ).length,
    results,
    duration,
  }
}

/**
 * Get the platform configuration
 */
export function getPlatformConfig(
  platform: Exclude<ATSPlatform, 'unknown'>
): PlatformMappingConfig | undefined {
  return platformConfigs[platform]
}

/**
 * Get supported field paths for a platform
 */
export function getSupportedFields(
  platform: Exclude<ATSPlatform, 'unknown'>
): ProfileFieldPath[] {
  const config = platformConfigs[platform]
  if (!config) return []
  return config.mappings.map((m) => m.profileField)
}

/**
 * Preview which fields would be filled (without actually filling)
 */
export function previewFill(
  platform: Exclude<ATSPlatform, 'unknown'>,
  profile: Profile,
  container: Element = document.body
): {
  profileField: ProfileFieldPath
  found: boolean
  value: unknown
  element?: HTMLElement
}[] {
  const config = platformConfigs[platform]
  if (!config) return []

  return config.mappings.map((mapping) => {
    const detection = detectField(mapping, container)
    const value = getProfileValue(profile, mapping.profileField)

    return {
      profileField: mapping.profileField,
      found: !!detection.element,
      value,
      element: detection.element || undefined,
    }
  })
}

export { platformConfigs }
