// Utilities for checking field completeness and calculating section status

import type { Profile } from '../types/profile'
import { parsePhoneWithCountryCode } from '../data/countryCodes'

// Field display names for user-friendly messages
const FIELD_DISPLAY_NAMES: Record<string, string> = {
  firstName: 'first name',
  lastName: 'last name',
  email: 'email address',
  countryCode: 'country code',
  phoneNumber: 'phone number',
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

  // Personal Information - 10 required fields
  const personalMissing: string[] = []

  // Basic info fields (3)
  const basicRequired = ['firstName', 'lastName', 'email'] as const
  for (const field of basicRequired) {
    if (isFieldEmpty(profile.personalInfo[field])) {
      personalMissing.push(field)
    }
  }

  // Phone fields (2) - country code and phone number are separate
  const { countryCode, phoneNumber } = parsePhoneWithCountryCode(profile.personalInfo.phone)
  if (isFieldEmpty(countryCode)) {
    personalMissing.push('countryCode')
  }
  if (isFieldEmpty(phoneNumber)) {
    personalMissing.push('phoneNumber')
  }

  // Address fields (5) - all required
  const addressRequired = ['street', 'city', 'state', 'zipCode', 'country'] as const
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
  countryCode: boolean
  phoneNumber: boolean
  street: boolean
  city: boolean
  state: boolean
  zipCode: boolean
  country: boolean
}

export function getPersonalInfoCompleteness(profile: Profile): PersonalInfoCompleteness {
  const { countryCode, phoneNumber } = parsePhoneWithCountryCode(profile.personalInfo.phone)

  return {
    firstName: !isFieldEmpty(profile.personalInfo.firstName),
    lastName: !isFieldEmpty(profile.personalInfo.lastName),
    email: !isFieldEmpty(profile.personalInfo.email),
    countryCode: !isFieldEmpty(countryCode),
    phoneNumber: !isFieldEmpty(phoneNumber),
    street: !isFieldEmpty(profile.personalInfo.address.street),
    city: !isFieldEmpty(profile.personalInfo.address.city),
    state: !isFieldEmpty(profile.personalInfo.address.state),
    zipCode: !isFieldEmpty(profile.personalInfo.address.zipCode),
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

/**
 * Self Identification completeness result
 */
export interface SelfIdentificationCompleteness {
  gender: boolean
  ethnicity: boolean
  veteranStatus: boolean
  disabilityStatus: boolean
  complete: boolean
  missingCount: number
}

/**
 * Check if all self identification fields are filled
 */
export function getSelfIdentificationCompleteness(profile: Profile): SelfIdentificationCompleteness {
  const selfId = profile.voluntarySelfIdentification
  const gender = !isFieldEmpty(selfId?.gender)
  const ethnicity = !isFieldEmpty(selfId?.ethnicity)
  const veteranStatus = !isFieldEmpty(selfId?.veteranStatus)
  const disabilityStatus = !isFieldEmpty(selfId?.disabilityStatus)

  const filledCount = [gender, ethnicity, veteranStatus, disabilityStatus].filter(Boolean).length
  const missingCount = 4 - filledCount

  return {
    gender,
    ethnicity,
    veteranStatus,
    disabilityStatus,
    complete: missingCount === 0,
    missingCount,
  }
}
