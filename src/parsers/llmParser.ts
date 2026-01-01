// LLM-based resume parsing using Google Gemini API
import { GoogleGenerativeAI, GoogleGenerativeAIError } from '@google/generative-ai'
import type { Profile } from '../types/profile'
import { createEmptyProfile } from '../types/profile'

// API key for shared usage - rate limited to free tier
// When limit is hit, users are asked to try again later
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE' // Replace with your actual key

export interface LLMParseResult {
  success: boolean
  profile: Partial<Profile> | null
  error?: string
  isRateLimited?: boolean
}

const EXTRACTION_PROMPT = `You are a resume parser. Extract information from the following resume and return ONLY valid JSON (no markdown, no explanation).

Return this exact JSON structure, filling in values from the resume. Use empty strings for missing fields:

{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "address": {
    "street": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "country": ""
  },
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "workExperience": [
    {
      "jobTitle": "",
      "company": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "description": "",
      "responsibilities": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "fieldOfStudy": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": []
}

Resume text:
`

export async function parseResumeWithLLM(resumeText: string): Promise<LLMParseResult> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return {
      success: false,
      profile: null,
      error: 'AI parsing is not configured. Please contact the developer.',
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent extraction
        maxOutputTokens: 4096,
      }
    })

    const result = await model.generateContent(EXTRACTION_PROMPT + resumeText)
    const responseText = result.response.text()

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = responseText
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    } else {
      // Try to find raw JSON object
      const rawJsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (rawJsonMatch) {
        jsonStr = rawJsonMatch[0]
      }
    }

    const parsed = JSON.parse(jsonStr)
    const profile = convertToProfile(parsed)

    return {
      success: true,
      profile,
    }
  } catch (error) {
    // Handle rate limiting
    if (error instanceof GoogleGenerativeAIError) {
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('rate') || errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return {
          success: false,
          profile: null,
          error: 'AI service is temporarily busy. Please try again in a few minutes.',
          isRateLimited: true,
        }
      }
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        profile: null,
        error: 'Failed to parse AI response. Please try again.',
      }
    }

    // Generic error
    console.error('LLM parsing error:', error)
    return {
      success: false,
      profile: null,
      error: 'AI parsing failed. Please try again or enter details manually.',
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
    profile.workExperience = parsed.workExperience.map((exp: Record<string, unknown>, idx: number) => ({
      id: `llm-exp-${idx}`,
      jobTitle: String(exp.jobTitle || ''),
      company: String(exp.company || ''),
      location: String(exp.location || ''),
      startDate: String(exp.startDate || ''),
      endDate: exp.endDate ? String(exp.endDate) : undefined,
      isCurrent: Boolean(exp.isCurrent),
      description: String(exp.description || ''),
      responsibilities: Array.isArray(exp.responsibilities) 
        ? exp.responsibilities.map(String) 
        : [],
    }))
  }

  // Education
  if (Array.isArray(parsed.education)) {
    profile.education = parsed.education.map((edu: Record<string, unknown>, idx: number) => ({
      id: `llm-edu-${idx}`,
      institution: String(edu.institution || ''),
      degree: String(edu.degree || ''),
      fieldOfStudy: String(edu.fieldOfStudy || ''),
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
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
}
