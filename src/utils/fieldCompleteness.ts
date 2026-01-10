// Utilities for checking field completeness and calculating section status

import type { Profile } from '../types/profile'

// Field display names for user-friendly messages
const FIELD_DISPLAY_NAMES: Record<string, string> = {
  firstName: 'first name',
  lastName: 'last name',
  email: 'email address',
  phone: 'phone number',
  street: 'street address',
  city: 'city',
  state: 'state',
  zipCode: 'ZIP code',
  country: 'country',
  linkedin: 'LinkedIn profile',
  github: 'GitHub profile',
  portfolio: 'portfolio website',
}

/**
 * Get a user-friendly display name for a field
 */
export function getFieldDisplayName(fieldName: string): string {
  return FIELD_DISPLAY_NAMES[fieldName] || fieldName
}

/**
 * Check if a field value is considered empty
 */
export function isFieldEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'boolean') return false // booleans are never "empty"
  return false
}

/**
 * Section completeness result
 */
export interface SectionCompleteness {
  name: string
  complete: boolean
  missingCount: number
  missingFields: string[]
}

/**
 * Calculate completeness for all sections
 */
export function calculateSectionCompleteness(profile: Profile): SectionCompleteness[] {
  const sections: SectionCompleteness[] = []

  // Personal Information
  const personalRequired = ['firstName', 'lastName', 'email', 'phone'] as const
  const personalMissing: string[] = []
  for (const field of personalRequired) {
    if (isFieldEmpty(profile.personalInfo[field])) {
      personalMissing.push(field)
    }
  }

  // Address fields
  const addressRequired = ['city', 'state', 'country'] as const
  for (const field of addressRequired) {
    if (isFieldEmpty(profile.personalInfo.address[field])) {
      personalMissing.push(field)
    }
  }

  sections.push({
    name: 'Personal Information',
    complete: personalMissing.length === 0,
    missingCount: personalMissing.length,
    missingFields: personalMissing,
  })

  // Professional Links (at least one required)
  const hasLink = !isFieldEmpty(profile.professionalLinks.linkedin) ||
                  !isFieldEmpty(profile.professionalLinks.github) ||
                  !isFieldEmpty(profile.professionalLinks.portfolio)
  sections.push({
    name: 'Professional Links',
    complete: hasLink,
    missingCount: hasLink ? 0 : 1,
    missingFields: hasLink ? [] : ['at least one link'],
  })

  // Work Experience (at least one required)
  const hasWorkExp = profile.workExperience.length > 0
  sections.push({
    name: 'Work Experience',
    complete: hasWorkExp,
    missingCount: hasWorkExp ? 0 : 1,
    missingFields: hasWorkExp ? [] : ['work experience entry'],
  })

  // Education (at least one required)
  const hasEducation = profile.education.length > 0
  sections.push({
    name: 'Education',
    complete: hasEducation,
    missingCount: hasEducation ? 0 : 1,
    missingFields: hasEducation ? [] : ['education entry'],
  })

  // Skills (at least 3 required)
  const skillCount = profile.skillsAndQualifications.skills.length
  const skillsMissing = Math.max(0, 3 - skillCount)
  sections.push({
    name: 'Skills',
    complete: skillsMissing === 0,
    missingCount: skillsMissing,
    missingFields: skillsMissing > 0 ? [`${skillsMissing} more skill${skillsMissing > 1 ? 's' : ''}`] : [],
  })

  // Work Authorization
  const hasAuth = profile.workAuthorization.authorizedToWork
  sections.push({
    name: 'Work Authorization',
    complete: hasAuth,
    missingCount: hasAuth ? 0 : 1,
    missingFields: hasAuth ? [] : ['work authorization status'],
  })

  return sections
}

/**
 * Get missing sections formatted for the progress bar tooltip
 */
export function getMissingSectionsForTooltip(profile: Profile): { name: string; missing: number }[] {
  return calculateSectionCompleteness(profile)
    .filter(section => !section.complete)
    .map(section => ({
      name: section.name,
      missing: section.missingCount,
    }))
}

/**
 * Check required personal info fields for incompleteness hints
 */
export interface PersonalInfoCompleteness {
  firstName: boolean
  lastName: boolean
  email: boolean
  phone: boolean
  city: boolean
  state: boolean
  country: boolean
}

export function getPersonalInfoCompleteness(profile: Profile): PersonalInfoCompleteness {
  return {
    firstName: !isFieldEmpty(profile.personalInfo.firstName),
    lastName: !isFieldEmpty(profile.personalInfo.lastName),
    email: !isFieldEmpty(profile.personalInfo.email),
    phone: !isFieldEmpty(profile.personalInfo.phone),
    city: !isFieldEmpty(profile.personalInfo.address.city),
    state: !isFieldEmpty(profile.personalInfo.address.state),
    country: !isFieldEmpty(profile.personalInfo.address.country),
  }
}

/**
 * Check if professional links section has at least one link
 */
export function hasProfessionalLink(profile: Profile): boolean {
  return !isFieldEmpty(profile.professionalLinks.linkedin) ||
         !isFieldEmpty(profile.professionalLinks.github) ||
         !isFieldEmpty(profile.professionalLinks.portfolio)
}
