// Data extraction utilities for resume parsing

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ExtractedValue<T> {
  value: T
  confidence: ConfidenceLevel
  source?: string // The text that was matched
}

// Email extraction
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

export function extractEmail(text: string): ExtractedValue<string> | null {
  const matches = text.match(EMAIL_REGEX)
  if (!matches || matches.length === 0) return null

  // First email is usually the primary contact
  return {
    value: matches[0].toLowerCase(),
    confidence: 'high',
    source: matches[0],
  }
}

export function extractAllEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX)
  return matches ? [...new Set(matches.map((e) => e.toLowerCase()))] : []
}

// Phone extraction - more comprehensive patterns
const PHONE_PATTERNS = [
  /\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})/g, // (555) 123-4567 or (555)123-4567
  /\+?1?[-.\s]?\((\d{3})\)[-.\s]?(\d{3})[-.\s]?(\d{4})/g, // +1 (555) 123-4567
  /(\d{3})[-.\s](\d{3})[-.\s](\d{4})/g, // 555-123-4567 or 555.123.4567
  /\+?1?(\d{3})(\d{3})(\d{4})/g, // 15551234567 or 5551234567
]

export function extractPhone(text: string): ExtractedValue<string> | null {
  // Normalize text - replace various separators and whitespace
  const normalizedText = text.replace(/\|/g, ' ').replace(/\s+/g, ' ')

  for (const pattern of PHONE_PATTERNS) {
    // Reset regex lastIndex
    pattern.lastIndex = 0
    const matches = normalizedText.match(pattern)
    if (matches && matches.length > 0) {
      const cleaned = cleanPhoneNumber(matches[0])
      // Validate it looks like a real phone (not a year or other number)
      const digits = cleaned.replace(/\D/g, '')
      if (digits.length >= 10) {
        return {
          value: cleaned,
          confidence: 'high',
          source: matches[0],
        }
      }
    }
  }
  return null
}

function cleanPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except +
  const digits = phone.replace(/[^\d+]/g, '')
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone.trim()
}

// Name extraction
export function extractName(text: string): ExtractedValue<{ firstName: string; lastName: string }> | null {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l)

  if (lines.length === 0) return null

  // Skip patterns for lines that are definitely not names
  const skipPatterns = ['resume', 'cv', 'curriculum', 'phone', 'email', 'address', 'objective', 'summary', 'experience', 'education', 'skills']
  const titles = ['mr', 'mrs', 'ms', 'dr', 'prof', 'jr', 'sr', 'ii', 'iii', 'iv']

  // Strategy 1: Look through first 10 lines for a name-like pattern
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i]

    // Skip if it looks like an email, URL, or phone
    if (line.includes('@') || line.includes('http') || line.includes('www')) {
      continue
    }
    if (/^\+?\d[\d\s\-().]{8,}$/.test(line)) {
      continue
    }

    // Skip if it's too long or too short
    if (line.length > 50 || line.length < 3) continue

    // Skip if it contains non-name patterns
    if (skipPatterns.some((p) => line.toLowerCase().includes(p))) {
      continue
    }

    // Skip lines that look like addresses (have numbers at start or ZIP codes)
    if (/^\d+\s/.test(line) || /\d{5}/.test(line)) {
      continue
    }

    // Try to parse as name
    const nameParts = line.split(/\s+/).filter((part) => part.length > 0)

    if (nameParts.length >= 2 && nameParts.length <= 4) {
      // Remove common titles and suffixes
      const cleanParts = nameParts.filter(
        (part) => !titles.includes(part.toLowerCase().replace(/[.,]/g, ''))
      )

      // Check if parts look like names (all letters, optionally with hyphen/apostrophe)
      const looksLikeName = cleanParts.every(part =>
        /^[A-Za-z][a-zA-Z'-]*$/.test(part.replace(/[,.]$/g, ''))
      )

      if (cleanParts.length >= 2 && looksLikeName) {
        return {
          value: {
            firstName: cleanParts[0].replace(/[,.]$/g, ''),
            lastName: cleanParts[cleanParts.length - 1].replace(/[,.]$/g, ''),
          },
          confidence: 'high',
          source: line,
        }
      }
    }
  }

  // Strategy 2: Look for "Name:" label pattern
  const nameLabel = text.match(/(?:name|full name|applicant)[:\s]+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i)
  if (nameLabel) {
    return {
      value: {
        firstName: nameLabel[1],
        lastName: nameLabel[2],
      },
      confidence: 'high',
      source: nameLabel[0],
    }
  }

  // Strategy 3: Try to find name from email (john.doe@email.com -> John Doe)
  const emailMatch = text.match(/([a-zA-Z]+)[._]([a-zA-Z]+)@/i)
  if (emailMatch) {
    const firstName = emailMatch[1].charAt(0).toUpperCase() + emailMatch[1].slice(1).toLowerCase()
    const lastName = emailMatch[2].charAt(0).toUpperCase() + emailMatch[2].slice(1).toLowerCase()
    if (firstName.length >= 2 && lastName.length >= 2) {
      return {
        value: { firstName, lastName },
        confidence: 'medium',
        source: emailMatch[0],
      }
    }
  }

  return null
}

// LinkedIn URL extraction
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/gi

export function extractLinkedIn(text: string): ExtractedValue<string> | null {
  const match = text.match(LINKEDIN_REGEX)
  if (!match) return null

  let url = match[0]
  // Ensure it has https://
  if (!url.startsWith('http')) {
    url = 'https://' + url.replace(/^www\./, '')
  }

  return {
    value: url.toLowerCase(),
    confidence: 'high',
    source: match[0],
  }
}

// GitHub URL extraction
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/?/gi

export function extractGitHub(text: string): ExtractedValue<string> | null {
  const match = text.match(GITHUB_REGEX)
  if (!match) return null

  let url = match[0]
  if (!url.startsWith('http')) {
    url = 'https://' + url.replace(/^www\./, '')
  }

  return {
    value: url.toLowerCase(),
    confidence: 'high',
    source: match[0],
  }
}

// Portfolio/Website URL extraction
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi

export function extractWebsiteUrl(text: string): ExtractedValue<string> | null {
  const matches = text.match(URL_REGEX)
  if (!matches) return null

  // Filter out LinkedIn and GitHub (handled separately)
  const otherUrls = matches.filter(
    (url) => !url.includes('linkedin.com') && !url.includes('github.com')
  )

  if (otherUrls.length === 0) return null

  return {
    value: otherUrls[0],
    confidence: 'medium',
    source: otherUrls[0],
  }
}

// Location/Address extraction
export function extractLocation(text: string): ExtractedValue<string> | null {
  // Look for city, state patterns
  const cityStatePattern = /([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\s*(\d{5})?/g
  const match = text.match(cityStatePattern)

  if (match) {
    return {
      value: match[0],
      confidence: 'medium',
      source: match[0],
    }
  }

  return null
}

// Work experience extraction
export interface WorkExperienceEntry {
  jobTitle: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  isCurrent: boolean
  description: string
  responsibilities: string[]
}

export function extractWorkExperience(_text: string): ExtractedValue<WorkExperienceEntry[]> | null {
  // Work experience extraction is disabled for now due to the high variability
  // in resume formats. Different resumes structure work history very differently:
  // - Company first vs job title first
  // - Dates inline vs on separate lines
  // - Project headers that look like job titles
  // - Multiple roles under one company
  //
  // This will be addressed in a future release using LLM-based parsing
  // which can semantically understand the resume structure.
  //
  // For now, users should manually enter their work experience.
  return null
}

// Education extraction
export interface EducationEntry {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate?: string
  endDate?: string
  gpa?: string
  honors?: string[]
}

export function extractEducation(_text: string): ExtractedValue<EducationEntry[]> | null {
  // Education extraction is disabled for now due to the high variability
  // in resume formats. This will be addressed using LLM-based parsing.
  // For now, users should manually enter their education.
  return null
}

// Skills extraction
export function extractSkills(text: string): ExtractedValue<string[]> | null {
  const skills: string[] = []
  const lines = text.split('\n')
  let inSkillsSection = false

  for (const line of lines) {
    const trimmedLine = line.trim()
    const lowerLine = trimmedLine.toLowerCase()

    // Detect skills section
    if (
      lowerLine === 'skills' ||
      lowerLine.includes('technical skills') ||
      lowerLine.includes('skills & qualifications')
    ) {
      inSkillsSection = true
      continue
    }

    // Detect end of skills section
    if (
      inSkillsSection &&
      (lowerLine.includes('certifications') ||
        lowerLine.includes('languages') ||
        lowerLine.includes('experience') ||
        lowerLine.includes('education'))
    ) {
      break
    }

    if (!inSkillsSection) continue
    if (!trimmedLine) continue

    // Parse skills from line
    // Handle formats like "Skills: JavaScript, Python, React"
    // Or "Programming Languages: JavaScript, Python"
    const colonSplit = trimmedLine.split(':')
    const skillsPart = colonSplit.length > 1 ? colonSplit.slice(1).join(':') : trimmedLine

    // Split by common delimiters
    const skillItems = skillsPart
      .split(/[,;|•]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 50)

    skills.push(...skillItems)
  }

  // Remove duplicates
  const uniqueSkills = [...new Set(skills)]

  if (uniqueSkills.length === 0) return null

  return {
    value: uniqueSkills,
    confidence: uniqueSkills.length > 5 ? 'high' : 'medium',
  }
}

// Certifications extraction
export interface Certification {
  name: string
  issuer?: string
  dateObtained?: string
}

export function extractCertifications(text: string): ExtractedValue<Certification[]> | null {
  const certs: Certification[] = []
  const lines = text.split('\n')
  let inCertsSection = false

  for (const line of lines) {
    const trimmedLine = line.trim()
    const lowerLine = trimmedLine.toLowerCase()

    // Detect certifications section
    if (lowerLine === 'certifications' || lowerLine === 'certificates') {
      inCertsSection = true
      continue
    }

    // Detect end of section
    if (
      inCertsSection &&
      (lowerLine.includes('languages') ||
        lowerLine.includes('experience') ||
        lowerLine.includes('education') ||
        lowerLine.includes('skills'))
    ) {
      break
    }

    if (!inCertsSection) continue
    if (!trimmedLine) continue

    // Parse certification
    const dateMatch = trimmedLine.match(/\((\d{4})\)/)
    const name = trimmedLine.replace(/\(\d{4}\)/, '').trim()

    if (name) {
      certs.push({
        name,
        dateObtained: dateMatch ? dateMatch[1] : undefined,
      })
    }
  }

  if (certs.length === 0) return null

  return {
    value: certs,
    confidence: 'medium',
  }
}

// Languages extraction
export interface LanguageSkill {
  language: string
  proficiency: 'basic' | 'conversational' | 'professional' | 'native'
}

export function extractLanguages(text: string): ExtractedValue<LanguageSkill[]> | null {
  const languages: LanguageSkill[] = []
  const lines = text.split('\n')
  let inLanguagesSection = false

  const proficiencyMap: Record<string, LanguageSkill['proficiency']> = {
    native: 'native',
    fluent: 'native',
    professional: 'professional',
    business: 'professional',
    conversational: 'conversational',
    intermediate: 'conversational',
    basic: 'basic',
    beginner: 'basic',
    elementary: 'basic',
  }

  for (const line of lines) {
    const trimmedLine = line.trim()
    const lowerLine = trimmedLine.toLowerCase()

    // Detect languages section
    if (lowerLine === 'languages') {
      inLanguagesSection = true
      continue
    }

    // Detect end of section
    if (
      inLanguagesSection &&
      (lowerLine.includes('certifications') ||
        lowerLine.includes('experience') ||
        lowerLine.includes('education') ||
        lowerLine.includes('skills') ||
        lowerLine.includes('references'))
    ) {
      break
    }

    if (!inLanguagesSection) continue
    if (!trimmedLine) continue

    // Parse language line like "English (Native)" or "Spanish - Professional"
    const match = trimmedLine.match(/^([A-Za-z]+)\s*[(\-–]\s*([^)\-–]+)/i)
    if (match) {
      const lang = match[1].trim()
      const profText = match[2].toLowerCase().trim()
      let proficiency: LanguageSkill['proficiency'] = 'conversational'

      for (const [key, value] of Object.entries(proficiencyMap)) {
        if (profText.includes(key)) {
          proficiency = value
          break
        }
      }

      languages.push({ language: lang, proficiency })
    }
  }

  if (languages.length === 0) return null

  return {
    value: languages,
    confidence: 'medium',
  }
}
