// Field Mapping Types for ATS platforms

import type { ATSPlatform } from '../content/detector'

// Profile field paths (dot notation for nested fields)
export type ProfileFieldPath =
  // Personal Info
  | 'personalInfo.firstName'
  | 'personalInfo.lastName'
  | 'personalInfo.email'
  | 'personalInfo.phone'
  | 'personalInfo.address.street'
  | 'personalInfo.address.city'
  | 'personalInfo.address.state'
  | 'personalInfo.address.zipCode'
  | 'personalInfo.address.country'
  // Professional Links
  | 'professionalLinks.linkedin'
  | 'professionalLinks.github'
  | 'professionalLinks.portfolio'
  // Work Authorization
  | 'workAuthorization.authorized'
  | 'workAuthorization.sponsorship'
  | 'workAuthorization.visaStatus'
  // Self Identification
  | 'selfIdentification.gender'
  | 'selfIdentification.ethnicity'
  | 'selfIdentification.veteran'
  | 'selfIdentification.disability'
  // Experience (arrays handled specially)
  | 'experience'
  | 'education'
  | 'skills'

// Types of form fields we can fill
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'hidden'

// Selector strategy for finding fields
export interface FieldSelector {
  // CSS selector
  selector: string
  // Alternative selectors (fallbacks)
  fallbacks?: string[]
  // Attribute to check for label matching
  labelAttribute?: 'aria-label' | 'placeholder' | 'name' | 'id' | 'data-automation-id'
  // Label patterns to match (regex or string)
  labelPatterns?: (string | RegExp)[]
  // Parent container selector (for scoped searches)
  container?: string
}

// Mapping from profile field to form field
export interface FieldMapping {
  // Profile field path
  profileField: ProfileFieldPath
  // Type of form field expected
  fieldType: FieldType
  // How to find this field
  selectors: FieldSelector[]
  // Transform function for the value (optional)
  transform?: (value: unknown) => string | boolean
  // Priority (higher = fill first)
  priority?: number
  // Whether this field is required
  required?: boolean
  // Delay after filling (ms) - some fields need time to validate
  delayAfter?: number
}

// Platform-specific mapping configuration
export interface PlatformMappingConfig {
  platform: ATSPlatform
  // Version of the mapping (for updates)
  version: string
  // Field mappings
  mappings: FieldMapping[]
  // Global selectors for the platform
  globalSelectors?: {
    // Form container
    formContainer?: string
    // Submit button
    submitButton?: string
    // Next/Continue button
    nextButton?: string
    // Error message container
    errorContainer?: string
  }
}

// Result of attempting to find a field
export interface FieldDetectionResult {
  // The element found (if any)
  element: HTMLElement | null
  // Which selector matched
  matchedSelector?: string
  // Confidence level
  confidence: 'high' | 'medium' | 'low'
  // Field type detected
  detectedType?: FieldType
  // Current value (if any)
  currentValue?: string
}

// Result of filling a field
export interface FieldFillResult {
  profileField: ProfileFieldPath
  success: boolean
  element?: HTMLElement
  previousValue?: string
  newValue?: string
  error?: string
}

// Overall fill operation result
export interface FillOperationResult {
  platform: ATSPlatform
  totalFields: number
  filledFields: number
  skippedFields: number
  failedFields: number
  results: FieldFillResult[]
  duration: number
}
