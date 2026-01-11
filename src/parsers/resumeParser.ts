// Main resume parser orchestrator

import { parseTextFile } from './textParser'
import {
  extractName,
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractGitHub,
  extractWebsiteUrl,
  extractLocation,
  extractWorkExperience,
  extractEducation,
  extractSkills,
  extractCertifications,
  extractLanguages,
  type ConfidenceLevel,
  type WorkExperienceEntry,
  type EducationEntry,
  type Certification,
  type LanguageSkill,
} from './extractors'
import type { Profile } from '../types/profile'
import { createEmptyProfile } from '../types/profile'

export type FileType = 'pdf' | 'docx' | 'txt' | 'unknown'

// Helper to check file types
function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}

function isDocxFile(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  )
}

export interface ParsedResume {
  rawText: string
  fileType: FileType
  extractedData: ExtractedResumeData
  overallConfidence: ConfidenceLevel
  parseErrors: string[]
}

export interface ExtractedResumeData {
  firstName?: { value: string; confidence: ConfidenceLevel }
  lastName?: { value: string; confidence: ConfidenceLevel }
  email?: { value: string; confidence: ConfidenceLevel }
  phone?: { value: string; confidence: ConfidenceLevel }
  location?: { value: string; confidence: ConfidenceLevel }
  linkedin?: { value: string; confidence: ConfidenceLevel }
  github?: { value: string; confidence: ConfidenceLevel }
  portfolio?: { value: string; confidence: ConfidenceLevel }
  workExperience?: { value: WorkExperienceEntry[]; confidence: ConfidenceLevel }
  education?: { value: EducationEntry[]; confidence: ConfidenceLevel }
  skills?: { value: string[]; confidence: ConfidenceLevel }
  certifications?: { value: Certification[]; confidence: ConfidenceLevel }
  languages?: { value: LanguageSkill[]; confidence: ConfidenceLevel }
}

// Detect file type
export function detectFileType(file: File): FileType {
  if (isPdfFile(file)) return 'pdf'
  if (isDocxFile(file)) return 'docx'
  if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) return 'txt'
  return 'unknown'
}

// Parse a resume file and extract all data
export async function parseResume(file: File): Promise<ParsedResume> {
  const fileType = detectFileType(file)
  const parseErrors: string[] = []
  let rawText = ''

  // Extract raw text based on file type
  try {
    switch (fileType) {
      case 'pdf': {
        // Dynamic import to avoid Node.js issues in tests
        const { parsePdfFile } = await import('./pdfParser')
        const pdfResult = await parsePdfFile(file)
        rawText = pdfResult.text
        break
      }
      case 'docx': {
        // Dynamic import to avoid Node.js issues in tests
        const { parseDocxFile } = await import('./docxParser')
        const docxResult = await parseDocxFile(file)
        rawText = docxResult.text
        if (docxResult.messages.length > 0) {
          parseErrors.push(...docxResult.messages)
        }
        break
      }
      case 'txt': {
        const txtResult = await parseTextFile(file)
        rawText = txtResult.text
        break
      }
      default:
        throw new Error(`Unsupported file type: ${file.type || file.name}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    parseErrors.push(errorMessage)
    return {
      rawText: '',
      fileType,
      extractedData: {},
      overallConfidence: 'low',
      parseErrors,
    }
  }

  // Extract data from text
  const extractedData = extractAllData(rawText)

  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(extractedData)

  return {
    rawText,
    fileType,
    extractedData,
    overallConfidence,
    parseErrors,
  }
}

// Parse resume from raw text (useful for testing)
export function parseResumeText(text: string): ParsedResume {
  const extractedData = extractAllData(text)
  const overallConfidence = calculateOverallConfidence(extractedData)

  return {
    rawText: text,
    fileType: 'txt',
    extractedData,
    overallConfidence,
    parseErrors: [],
  }
}

// Extract all data from text
function extractAllData(text: string): ExtractedResumeData {
  const data: ExtractedResumeData = {}

  // Personal info
  const name = extractName(text)
  if (name) {
    data.firstName = { value: name.value.firstName, confidence: name.confidence }
    data.lastName = { value: name.value.lastName, confidence: name.confidence }
  }

  const email = extractEmail(text)
  if (email) {
    data.email = { value: email.value, confidence: email.confidence }
  }

  const phone = extractPhone(text)
  if (phone) {
    data.phone = { value: phone.value, confidence: phone.confidence }
  }

  const location = extractLocation(text)
  if (location) {
    data.location = { value: location.value, confidence: location.confidence }
  }

  // Professional links
  const linkedin = extractLinkedIn(text)
  if (linkedin) {
    data.linkedin = { value: linkedin.value, confidence: linkedin.confidence }
  }

  const github = extractGitHub(text)
  if (github) {
    data.github = { value: github.value, confidence: github.confidence }
  }

  const portfolio = extractWebsiteUrl(text)
  if (portfolio) {
    data.portfolio = { value: portfolio.value, confidence: portfolio.confidence }
  }

  // Experience & Education
  const workExp = extractWorkExperience(text)
  if (workExp) {
    data.workExperience = { value: workExp.value, confidence: workExp.confidence }
  }

  const education = extractEducation(text)
  if (education) {
    data.education = { value: education.value, confidence: education.confidence }
  }

  // Skills & Qualifications
  const skills = extractSkills(text)
  if (skills) {
    data.skills = { value: skills.value, confidence: skills.confidence }
  }

  const certs = extractCertifications(text)
  if (certs) {
    data.certifications = { value: certs.value, confidence: certs.confidence }
  }

  const languages = extractLanguages(text)
  if (languages) {
    data.languages = { value: languages.value, confidence: languages.confidence }
  }

  return data
}

// Calculate overall confidence based on extracted data
function calculateOverallConfidence(data: ExtractedResumeData): ConfidenceLevel {
  const fields = [
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.workExperience,
    data.education,
    data.skills,
  ]

  const extractedCount = fields.filter((f) => f !== undefined).length
  const highConfidenceCount = fields.filter((f) => f?.confidence === 'high').length

  if (extractedCount >= 5 && highConfidenceCount >= 2) {
    return 'high'
  } else if (extractedCount >= 3) {
    return 'medium'
  }
  return 'low'
}

// Convert extracted data to Profile format
export function extractedDataToProfile(data: ExtractedResumeData): Partial<Profile> {
  const profile = createEmptyProfile()

  // Personal Info
  if (data.firstName) {
    profile.personalInfo.firstName = data.firstName.value
  }
  if (data.lastName) {
    profile.personalInfo.lastName = data.lastName.value
  }
  if (data.email) {
    profile.personalInfo.email = data.email.value
  }
  if (data.phone) {
    profile.personalInfo.phone = data.phone.value
  }
  if (data.location) {
    // Try to parse location into address components
    const parts = data.location.value.split(',').map((p) => p.trim())
    if (parts.length >= 2) {
      profile.personalInfo.address.city = parts[0]
      const stateZip = parts[1].split(/\s+/)
      if (stateZip.length >= 1) {
        profile.personalInfo.address.state = stateZip[0]
      }
      if (stateZip.length >= 2) {
        profile.personalInfo.address.zipCode = stateZip[1]
      }
    }
  }

  // Professional Links
  if (data.linkedin) {
    profile.professionalLinks.linkedin = data.linkedin.value
  }
  if (data.github) {
    profile.professionalLinks.github = data.github.value
  }
  if (data.portfolio) {
    profile.professionalLinks.portfolio = data.portfolio.value
  }

  // Work Experience
  if (data.workExperience) {
    profile.workExperience = data.workExperience.value.map((entry, index) => {
      // Parse location string into components (e.g., "San Francisco, CA" -> city, state)
      const locationParts = (entry.location || '').split(',').map((p) => p.trim())
      return {
        id: `parsed-${index}`,
        jobTitle: entry.jobTitle,
        company: entry.company,
        location: {
          city: locationParts[0] || '',
          state: locationParts[1] || '',
          zipCode: '',
          country: '',
        },
        startDate: entry.startDate || '',
        endDate: entry.endDate,
        isCurrent: entry.isCurrent,
        description: entry.description,
        responsibilities: entry.responsibilities,
      }
    })
  }

  // Education
  if (data.education) {
    profile.education = data.education.value.map((entry, index) => {
      // Parse location string into components
      const locationParts = (entry.location || '').split(',').map((p) => p.trim())
      return {
        id: `parsed-${index}`,
        institution: entry.institution,
        degree: entry.degree,
        fieldOfStudy: entry.fieldOfStudy,
        location: {
          city: locationParts[0] || '',
          state: locationParts[1] || '',
          zipCode: '',
          country: '',
        },
        startDate: entry.startDate || '',
        endDate: entry.endDate,
        gpa: entry.gpa,
        honors: entry.honors,
      }
    })
  }

  // Skills
  if (data.skills) {
    profile.skillsAndQualifications.skills = data.skills.value
  }

  // Certifications
  if (data.certifications) {
    profile.skillsAndQualifications.certifications = data.certifications.value.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer || '',
      dateObtained: cert.dateObtained,
    }))
  }

  // Languages
  if (data.languages) {
    profile.skillsAndQualifications.languages = data.languages.value
  }

  return profile
}

// Get a summary of what was extracted
export function getExtractionSummary(data: ExtractedResumeData): {
  extracted: string[]
  missing: string[]
} {
  const allFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'github', label: 'GitHub' },
    { key: 'workExperience', label: 'Work Experience' },
    { key: 'education', label: 'Education' },
    { key: 'skills', label: 'Skills' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'languages', label: 'Languages' },
  ]

  const extracted: string[] = []
  const missing: string[] = []

  for (const field of allFields) {
    if (data[field.key as keyof ExtractedResumeData]) {
      extracted.push(field.label)
    } else {
      missing.push(field.label)
    }
  }

  return { extracted, missing }
}
