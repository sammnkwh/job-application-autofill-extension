// Export/Import utilities for profile data

import type { Profile } from '../types/profile'
import { CURRENT_SCHEMA_VERSION, compareVersions } from '../types/schema'

// Export data wrapper
export interface ExportData {
  exportedAt: string
  version: string
  profile: Profile
}

// Validation result
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  data?: ExportData
}

// Required profile fields for validation
const REQUIRED_PERSONAL_INFO_FIELDS = [
  'firstName',
  'lastName',
  'email',
] as const

/**
 * Generate export filename with current date
 */
export function generateExportFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `job-profile-${date}.json`
}

/**
 * Create export data structure from profile
 */
export function createExportData(profile: Profile): ExportData {
  return {
    exportedAt: new Date().toISOString(),
    version: CURRENT_SCHEMA_VERSION,
    profile,
  }
}

/**
 * Trigger file download for export data
 */
export function downloadExportFile(data: ExportData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = generateExportFilename()
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Validate import data
 */
export function validateImportData(jsonString: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Try to parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch (e) {
    return {
      valid: false,
      errors: ['Invalid JSON format. Please check the file contents.'],
      warnings: [],
    }
  }

  // Check if it's an object
  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errors: ['Import data must be a JSON object.'],
      warnings: [],
    }
  }

  const data = parsed as Record<string, unknown>

  // Check for required top-level fields
  if (!data.profile) {
    errors.push('Missing "profile" field in import data.')
  }

  // Validate profile structure
  if (data.profile && typeof data.profile === 'object') {
    const profile = data.profile as Record<string, unknown>

    // Check schema version
    if (!profile.schemaVersion) {
      errors.push('Missing "schemaVersion" in profile.')
    } else if (typeof profile.schemaVersion !== 'string') {
      errors.push('"schemaVersion" must be a string.')
    } else {
      // Check version compatibility
      const comparison = compareVersions(profile.schemaVersion as string, CURRENT_SCHEMA_VERSION)
      if (comparison > 0) {
        errors.push(
          `Profile version (${profile.schemaVersion}) is newer than supported version (${CURRENT_SCHEMA_VERSION}). ` +
          'Please update your extension.'
        )
      } else if (comparison < 0) {
        warnings.push(
          `Profile version (${profile.schemaVersion}) is older than current version (${CURRENT_SCHEMA_VERSION}). ` +
          'Data will be migrated automatically.'
        )
      }
    }

    // Check personal info
    if (!profile.personalInfo) {
      errors.push('Missing "personalInfo" section in profile.')
    } else if (typeof profile.personalInfo === 'object') {
      const personalInfo = profile.personalInfo as Record<string, unknown>

      for (const field of REQUIRED_PERSONAL_INFO_FIELDS) {
        if (!personalInfo[field]) {
          warnings.push(`Missing required field: personalInfo.${field}`)
        }
      }
    }

    // Validate arrays
    if (profile.workExperience !== undefined && !Array.isArray(profile.workExperience)) {
      errors.push('"workExperience" must be an array.')
    }

    if (profile.education !== undefined && !Array.isArray(profile.education)) {
      errors.push('"education" must be an array.')
    }

    // Validate email format if present
    if (profile.personalInfo && typeof profile.personalInfo === 'object') {
      const personalInfo = profile.personalInfo as Record<string, unknown>
      if (personalInfo.email && typeof personalInfo.email === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(personalInfo.email)) {
          warnings.push('Email format appears invalid.')
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  return {
    valid: true,
    errors: [],
    warnings,
    data: data as unknown as ExportData,
  }
}

/**
 * Extract profile from validated import data
 */
export function extractProfile(data: ExportData): Profile {
  return {
    ...data.profile,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Open file picker and read file contents
 */
export function openFilePicker(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          resolve(text)
        } catch {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }

    input.oncancel = () => resolve(null)
    input.click()
  })
}

/**
 * Check file size before import
 */
export function checkFileSize(file: File): { valid: boolean; message?: string } {
  const MAX_SIZE = 1024 * 1024 // 1MB max

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: `File too large (${(file.size / 1024).toFixed(1)}KB). Maximum size is 1MB.`,
    }
  }

  return { valid: true }
}
