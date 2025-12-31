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

// Phone extraction
const PHONE_PATTERNS = [
  /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, // US format
  /\([0-9]{3}\)\s?[0-9]{3}[-.\s]?[0-9]{4}/g, // (555) 123-4567
  /[0-9]{3}[-.\s][0-9]{3}[-.\s][0-9]{4}/g, // 555-123-4567
]

export function extractPhone(text: string): ExtractedValue<string> | null {
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      const cleaned = cleanPhoneNumber(matches[0])
      return {
        value: cleaned,
        confidence: 'high',
        source: matches[0],
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

  // First non-empty line is often the name
  if (lines.length === 0) return null

  const firstLine = lines[0]

  // Skip if it looks like an email or URL
  if (firstLine.includes('@') || firstLine.includes('http') || firstLine.includes('www')) {
    return null
  }

  // Skip if it's too long (probably not a name)
  if (firstLine.length > 50) return null

  // Skip if it contains common non-name patterns
  const skipPatterns = ['resume', 'cv', 'curriculum', 'phone', 'email', 'address']
  if (skipPatterns.some((p) => firstLine.toLowerCase().includes(p))) {
    return null
  }

  // Try to parse as name
  const nameParts = firstLine.split(/\s+/).filter((part) => part.length > 0)

  if (nameParts.length >= 2) {
    // Remove common titles and suffixes
    const titles = ['mr', 'mrs', 'ms', 'dr', 'prof', 'jr', 'sr', 'ii', 'iii', 'iv']
    const cleanParts = nameParts.filter(
      (part) => !titles.includes(part.toLowerCase().replace(/[.,]/g, ''))
    )

    if (cleanParts.length >= 2) {
      return {
        value: {
          firstName: cleanParts[0].replace(/[,.]$/g, ''),
          lastName: cleanParts[cleanParts.length - 1].replace(/[,.]$/g, ''),
        },
        confidence: 'medium',
        source: firstLine,
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

const DATE_PATTERNS = [
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/gi,
  /\d{1,2}\/\d{4}/g,
  /\d{4}/g,
]

const CURRENT_INDICATORS = ['present', 'current', 'now', 'ongoing']

export function extractWorkExperience(text: string): ExtractedValue<WorkExperienceEntry[]> | null {
  const entries: WorkExperienceEntry[] = []

  // Split into sections and find work experience section
  const lines = text.split('\n')
  let inExperienceSection = false
  let currentEntry: Partial<WorkExperienceEntry> | null = null
  const bulletPoints: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    const lowerLine = trimmedLine.toLowerCase()

    // Detect experience section
    if (
      lowerLine.includes('experience') ||
      lowerLine.includes('employment') ||
      lowerLine === 'work history'
    ) {
      inExperienceSection = true
      continue
    }

    // Detect end of experience section
    if (
      inExperienceSection &&
      (lowerLine.includes('education') ||
        lowerLine.includes('skills') ||
        lowerLine.includes('certifications'))
    ) {
      // Save last entry
      if (currentEntry && currentEntry.jobTitle) {
        currentEntry.responsibilities = [...bulletPoints]
        entries.push(currentEntry as WorkExperienceEntry)
      }
      break
    }

    if (!inExperienceSection) continue

    // Skip empty lines
    if (!trimmedLine) continue

    // Check for bullet points
    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
      bulletPoints.push(trimmedLine.replace(/^[-•*]\s*/, ''))
      continue
    }

    // Check for date range (indicates new job entry)
    const hasDate = DATE_PATTERNS.some((p) => p.test(trimmedLine))
    const hasDash = trimmedLine.includes(' - ') || trimmedLine.includes(' – ')

    if (hasDate && hasDash) {
      // Save previous entry
      if (currentEntry && currentEntry.jobTitle) {
        currentEntry.responsibilities = [...bulletPoints]
        entries.push(currentEntry as WorkExperienceEntry)
        bulletPoints.length = 0
      }

      // Parse date line
      const dates = extractDatesFromLine(trimmedLine)
      currentEntry = {
        jobTitle: '',
        company: '',
        isCurrent: CURRENT_INDICATORS.some((i) => lowerLine.includes(i)),
        description: '',
        responsibilities: [],
        ...dates,
      }
    } else if (currentEntry && !currentEntry.jobTitle && trimmedLine.length < 100) {
      // First line after date is usually job title
      currentEntry.jobTitle = trimmedLine
    } else if (currentEntry && currentEntry.jobTitle && !currentEntry.company && trimmedLine.length < 100) {
      // Second line is usually company
      currentEntry.company = trimmedLine.replace(/,\s*[A-Z]{2}.*$/, '').trim()
      const locationMatch = trimmedLine.match(/,\s*([^,]+,\s*[A-Z]{2})/i)
      if (locationMatch) {
        currentEntry.location = locationMatch[1].trim()
      }
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.jobTitle) {
    currentEntry.responsibilities = [...bulletPoints]
    entries.push(currentEntry as WorkExperienceEntry)
  }

  if (entries.length === 0) return null

  return {
    value: entries,
    confidence: entries.length > 0 ? 'medium' : 'low',
  }
}

function extractDatesFromLine(line: string): { startDate?: string; endDate?: string } {
  const dates: string[] = []

  for (const pattern of DATE_PATTERNS) {
    const matches = line.match(pattern)
    if (matches) {
      dates.push(...matches)
    }
  }

  // Get unique dates
  const uniqueDates = [...new Set(dates)]

  if (uniqueDates.length >= 2) {
    return { startDate: uniqueDates[0], endDate: uniqueDates[1] }
  } else if (uniqueDates.length === 1) {
    return { startDate: uniqueDates[0] }
  }

  return {}
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

const DEGREE_PATTERNS = [
  /Bachelor(?:'s)?(?:\s+of\s+(?:Science|Arts|Engineering|Business))?\s*(?:in\s+)?/i,
  /Master(?:'s)?(?:\s+of\s+(?:Science|Arts|Business|Engineering))?\s*(?:in\s+)?/i,
  /Ph\.?D\.?|Doctorate/i,
  /Associate(?:'s)?(?:\s+(?:of|in)\s+)?/i,
  /B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|MBA|M\.?B\.?A\.?/i,
]

export function extractEducation(text: string): ExtractedValue<EducationEntry[]> | null {
  const entries: EducationEntry[] = []
  const lines = text.split('\n')
  let inEducationSection = false
  let currentEntry: Partial<EducationEntry> | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()
    const lowerLine = trimmedLine.toLowerCase()

    // Detect education section
    if (lowerLine === 'education' || lowerLine.includes('academic background')) {
      inEducationSection = true
      continue
    }

    // Detect end of education section
    if (
      inEducationSection &&
      (lowerLine.includes('skills') ||
        lowerLine.includes('experience') ||
        lowerLine.includes('certifications'))
    ) {
      if (currentEntry && currentEntry.institution) {
        entries.push(currentEntry as EducationEntry)
      }
      break
    }

    if (!inEducationSection) continue
    if (!trimmedLine) continue

    // Check for degree pattern
    const hasDegree = DEGREE_PATTERNS.some((p) => p.test(trimmedLine))

    if (hasDegree) {
      // Save previous entry
      if (currentEntry && currentEntry.institution) {
        entries.push(currentEntry as EducationEntry)
      }

      currentEntry = {
        institution: '',
        degree: trimmedLine,
        fieldOfStudy: '',
      }

      // Try to extract field of study
      const inMatch = trimmedLine.match(/(?:in|of)\s+([^,]+)/i)
      if (inMatch) {
        currentEntry.fieldOfStudy = inMatch[1].trim()
      }
    } else if (currentEntry && !currentEntry.institution && trimmedLine.length < 100) {
      // Line after degree is usually institution
      currentEntry.institution = trimmedLine
    } else if (currentEntry && trimmedLine.toLowerCase().includes('gpa')) {
      const gpaMatch = trimmedLine.match(/(\d+\.?\d*)/i)
      if (gpaMatch) {
        currentEntry.gpa = gpaMatch[1]
      }
    } else if (currentEntry && (lowerLine.includes('graduate') || lowerLine.includes('class of'))) {
      const dateMatch = trimmedLine.match(/\d{4}/)
      if (dateMatch) {
        currentEntry.endDate = dateMatch[0]
      }
    } else if (currentEntry && (lowerLine.includes('honors') || lowerLine.includes('cum laude') || lowerLine.includes("dean's list"))) {
      currentEntry.honors = currentEntry.honors || []
      currentEntry.honors.push(trimmedLine)
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.institution) {
    entries.push(currentEntry as EducationEntry)
  }

  if (entries.length === 0) return null

  return {
    value: entries,
    confidence: entries.length > 0 ? 'medium' : 'low',
  }
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
