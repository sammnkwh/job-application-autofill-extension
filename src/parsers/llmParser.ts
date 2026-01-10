// LLM-based resume parsing using Google Gemini API
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { Profile } from '../types/profile'
import { createEmptyProfile } from '../types/profile'

// API key loaded from environment variable
// Create a .env file with VITE_GEMINI_API_KEY=your_key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

export interface LLMParseResult {
  success: boolean
  profile: Partial<Profile> | null
  error?: string
  isRateLimited?: boolean
}

const EXTRACTION_PROMPT = `Extract resume information as JSON.

DATE RULES (IMPORTANT):
- All dates must be YYYY-MM-DD format
- For START dates:
  - If only year given (e.g., "2020"): use first day of year → "2020-01-01"
  - If month and year given (e.g., "June 2020"): use first day of month → "2020-06-01"
- For END dates:
  - If only year given (e.g., "2023"): use last day of year → "2023-12-31"
  - If month and year given (e.g., "Nov 2024"): use last day of month → "2024-11-30"
- For "Present"/"Current"/ongoing roles: set endDate to "" (empty string) and isCurrent to true

OTHER RULES:
- Extract full street address if present
- Include job responsibilities as bullet points

Resume text:
`

// Attempt to repair common JSON issues from LLM output
function repairJSON(jsonStr: string): string {
  let repaired = jsonStr

  // Remove trailing commas before ] or }
  repaired = repaired.replace(/,\s*]/g, ']')
  repaired = repaired.replace(/,\s*}/g, '}')

  // Fix unescaped newlines in strings (common LLM issue)
  // This is tricky - we need to be careful not to break valid JSON
  repaired = repaired.replace(/([^\\])\\n/g, '$1\\\\n')

  // Remove any control characters that might break parsing
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') {
      return char // Keep these
    }
    return '' // Remove other control chars
  })

  return repaired
}

export async function parseResumeWithLLM(resumeText: string): Promise<LLMParseResult> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      profile: null,
      error: 'AI parsing is not configured. Please contact the developer.',
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            firstName: { type: SchemaType.STRING },
            lastName: { type: SchemaType.STRING },
            email: { type: SchemaType.STRING },
            phone: { type: SchemaType.STRING },
            address: {
              type: SchemaType.OBJECT,
              properties: {
                street: { type: SchemaType.STRING },
                city: { type: SchemaType.STRING },
                state: { type: SchemaType.STRING },
                zipCode: { type: SchemaType.STRING },
                country: { type: SchemaType.STRING },
              },
            },
            linkedin: { type: SchemaType.STRING },
            github: { type: SchemaType.STRING },
            portfolio: { type: SchemaType.STRING },
            workExperience: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  jobTitle: { type: SchemaType.STRING },
                  company: { type: SchemaType.STRING },
                  location: { type: SchemaType.STRING },
                  startDate: { type: SchemaType.STRING },
                  endDate: { type: SchemaType.STRING },
                  isCurrent: { type: SchemaType.BOOLEAN },
                  description: { type: SchemaType.STRING },
                  responsibilities: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                  },
                },
              },
            },
            education: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  institution: { type: SchemaType.STRING },
                  degree: { type: SchemaType.STRING },
                  fieldOfStudy: { type: SchemaType.STRING },
                  startDate: { type: SchemaType.STRING },
                  endDate: { type: SchemaType.STRING },
                  gpa: { type: SchemaType.STRING },
                },
              },
            },
            skills: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
        },
      }
    })

    const result = await model.generateContent(EXTRACTION_PROMPT + resumeText)
    const responseText = result.response.text()

    // Log for debugging
    console.log('Gemini response length:', responseText.length)

    // Extract and clean JSON from response
    let jsonStr = responseText.trim()

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    // Find the JSON object
    const startIdx = jsonStr.indexOf('{')
    const endIdx = jsonStr.lastIndexOf('}')
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1)
    }

    // Attempt to repair common JSON issues
    jsonStr = repairJSON(jsonStr)

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse failed. Raw response:', responseText)
      throw parseError
    }
    const profile = convertToProfile(parsed)

    return {
      success: true,
      profile,
    }
  } catch (error) {
    console.error('LLM parsing error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Always show actual error for now (debugging)
    return {
      success: false,
      profile: null,
      error: `Error: ${errorMessage}`,
    }
  }
}

function convertToProfile(parsed: Record<string, unknown>): Partial<Profile> {
  const profile = createEmptyProfile()

  // Personal Info
  if (parsed.firstName) profile.personalInfo.firstName = String(parsed.firstName)
  if (parsed.lastName) profile.personalInfo.lastName = String(parsed.lastName)
  if (parsed.email) profile.personalInfo.email = String(parsed.email)
  if (parsed.phone) profile.personalInfo.phone = String(parsed.phone)

  // Address
  if (parsed.address && typeof parsed.address === 'object') {
    const addr = parsed.address as Record<string, string>
    if (addr.street) profile.personalInfo.address.street = addr.street
    if (addr.city) profile.personalInfo.address.city = addr.city
    if (addr.state) profile.personalInfo.address.state = addr.state
    if (addr.zipCode) profile.personalInfo.address.zipCode = addr.zipCode
    if (addr.country) profile.personalInfo.address.country = addr.country
  }

  // Professional Links
  if (parsed.linkedin) profile.professionalLinks.linkedin = String(parsed.linkedin)
  if (parsed.github) profile.professionalLinks.github = String(parsed.github)
  if (parsed.portfolio) profile.professionalLinks.portfolio = String(parsed.portfolio)

  // Work Experience
  if (Array.isArray(parsed.workExperience)) {
    profile.workExperience = parsed.workExperience.map((exp: Record<string, unknown>, idx: number) => {
      const endDateStr = exp.endDate ? String(exp.endDate).trim() : ''
      // isCurrent is true if: explicitly set OR endDate is empty/missing
      const isCurrent = Boolean(exp.isCurrent) || !endDateStr

      return {
        id: `llm-exp-${idx}`,
        jobTitle: String(exp.jobTitle || ''),
        company: String(exp.company || ''),
        location: String(exp.location || ''),
        // Keep full YYYY-MM-DD format for date input fields
        startDate: String(exp.startDate || ''),
        // Don't set endDate if isCurrent is true
        endDate: isCurrent ? undefined : endDateStr,
        isCurrent,
        description: String(exp.description || ''),
        responsibilities: Array.isArray(exp.responsibilities)
          ? exp.responsibilities.map((r, i) => `${i + 1}. ${String(r).replace(/^\d+\.\s*/, '')}`)
          : [],
      }
    })
  }

  // Education
  if (Array.isArray(parsed.education)) {
    profile.education = parsed.education.map((edu: Record<string, unknown>, idx: number) => ({
      id: `llm-edu-${idx}`,
      institution: String(edu.institution || ''),
      degree: String(edu.degree || ''),
      fieldOfStudy: String(edu.fieldOfStudy || ''),
      location: String(edu.location || ''),
      // Keep full YYYY-MM-DD format for date input fields
      startDate: String(edu.startDate || ''),
      endDate: edu.endDate ? String(edu.endDate) : undefined,
      gpa: edu.gpa ? String(edu.gpa) : undefined,
    }))
  }

  // Skills
  if (Array.isArray(parsed.skills)) {
    profile.skillsAndQualifications.skills = parsed.skills.map(String)
  }

  return profile
}

// Check if LLM parsing is available
export function isLLMParsingAvailable(): boolean {
  return Boolean(GEMINI_API_KEY)
}
