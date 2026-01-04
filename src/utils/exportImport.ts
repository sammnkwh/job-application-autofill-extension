// Export/Import utilities for profile data

import type { Profile, WorkExperience, Education } from '../types/profile'
import { CURRENT_SCHEMA_VERSION, compareVersions } from '../types/schema'

export type ExportFormat = 'json' | 'markdown'

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

/**
 * Format a date string for display
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Format work experience entry for markdown
 */
function formatWorkExperience(exp: WorkExperience): string {
  const endDate = exp.isCurrent ? 'Present' : formatDate(exp.endDate)
  const dateRange = `${formatDate(exp.startDate)} - ${endDate}`

  let md = `### ${exp.jobTitle}\n`
  md += `**${exp.company}** | ${exp.location} | ${dateRange}\n\n`

  if (exp.description) {
    md += `${exp.description}\n\n`
  }

  if (exp.responsibilities && exp.responsibilities.length > 0) {
    exp.responsibilities.forEach(resp => {
      md += `- ${resp}\n`
    })
    md += '\n'
  }

  return md
}

/**
 * Format education entry for markdown
 */
function formatEducation(edu: Education): string {
  const endDate = edu.isCurrent ? 'Present' : formatDate(edu.endDate)
  const dateRange = `${formatDate(edu.startDate)} - ${endDate}`

  let md = `### ${edu.degree} in ${edu.fieldOfStudy}\n`
  md += `**${edu.institution}** | ${dateRange}\n`

  if (edu.gpa) {
    md += `GPA: ${edu.gpa}\n`
  }

  if (edu.honors && edu.honors.length > 0) {
    md += `Honors: ${edu.honors.join(', ')}\n`
  }

  md += '\n'
  return md
}

/**
 * Convert profile to markdown format
 */
export function profileToMarkdown(profile: Profile): string {
  const { personalInfo, professionalLinks, workExperience, education, skillsAndQualifications } = profile

  let md = ''

  // Header with name
  md += `# ${personalInfo.firstName} ${personalInfo.lastName}\n\n`

  // Contact info
  const contactParts: string[] = []
  if (personalInfo.email) contactParts.push(personalInfo.email)
  if (personalInfo.phone) contactParts.push(personalInfo.phone)
  if (personalInfo.address.city && personalInfo.address.state) {
    contactParts.push(`${personalInfo.address.city}, ${personalInfo.address.state}`)
  }
  if (contactParts.length > 0) {
    md += `${contactParts.join(' | ')}\n\n`
  }

  // Professional links
  const links: string[] = []
  if (professionalLinks.linkedin) links.push(`[LinkedIn](${professionalLinks.linkedin})`)
  if (professionalLinks.github) links.push(`[GitHub](${professionalLinks.github})`)
  if (professionalLinks.portfolio) links.push(`[Portfolio](${professionalLinks.portfolio})`)
  if (links.length > 0) {
    md += `${links.join(' | ')}\n\n`
  }

  md += '---\n\n'

  // Work Experience
  if (workExperience && workExperience.length > 0) {
    md += '## Work Experience\n\n'
    workExperience.forEach(exp => {
      md += formatWorkExperience(exp)
    })
  }

  // Education
  if (education && education.length > 0) {
    md += '## Education\n\n'
    education.forEach(edu => {
      md += formatEducation(edu)
    })
  }

  // Skills
  if (skillsAndQualifications.skills && skillsAndQualifications.skills.length > 0) {
    md += '## Skills\n\n'
    md += skillsAndQualifications.skills.join(' • ') + '\n\n'
  }

  // Certifications
  if (skillsAndQualifications.certifications && skillsAndQualifications.certifications.length > 0) {
    md += '## Certifications\n\n'
    skillsAndQualifications.certifications.forEach(cert => {
      md += `- **${cert.name}** - ${cert.issuer}`
      if (cert.dateObtained) md += ` (${formatDate(cert.dateObtained)})`
      md += '\n'
    })
    md += '\n'
  }

  // Languages
  if (skillsAndQualifications.languages && skillsAndQualifications.languages.length > 0) {
    md += '## Languages\n\n'
    skillsAndQualifications.languages.forEach(lang => {
      const proficiency = lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)
      md += `- ${lang.language} (${proficiency})\n`
    })
    md += '\n'
  }

  return md.trim()
}
