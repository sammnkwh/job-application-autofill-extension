// Profile data types for the job application autofill extension

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface ProfessionalLinks {
  linkedin?: string
  github?: string
  portfolio?: string
  other?: string[]
}

export interface WorkExperience {
  id: string
  jobTitle: string
  company: string
  location: {
    city: string
    state: string
    zipCode: string
    country: string
  }
  startDate: string // ISO 8601 format
  endDate?: string // ISO 8601 format, undefined if current
  isCurrent: boolean
  description: string
  responsibilities: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  location: {
    city: string
    state: string
    zipCode: string
    country: string
  }
  startDate: string
  endDate?: string
  isCurrent?: boolean
  gpa?: string
  honors?: string[]
}

export interface SkillsAndQualifications {
  skills: string[]
  certifications: {
    name: string
    issuer: string
    dateObtained?: string
    expirationDate?: string
  }[]
  languages: {
    language: string
    proficiency: 'basic' | 'conversational' | 'professional' | 'native'
  }[]
}

export interface WorkAuthorization {
  authorizedToWork: boolean
  requiresSponsorship: boolean
  visaStatus?: string
  citizenshipStatus?: string
}

export interface VoluntarySelfIdentification {
  gender?: string
  ethnicity?: string
  veteranStatus?: string
  disabilityStatus?: string
  // Note: These are optional and voluntary
}

export interface Profile {
  schemaVersion: string
  lastUpdated: string // ISO 8601 format
  personalInfo: PersonalInfo
  professionalLinks: ProfessionalLinks
  workExperience: WorkExperience[]
  education: Education[]
  skillsAndQualifications: SkillsAndQualifications
  workAuthorization: WorkAuthorization
  voluntarySelfIdentification?: VoluntarySelfIdentification
}

// Default empty profile
export const createEmptyProfile = (): Profile => ({
  schemaVersion: '1.0',
  lastUpdated: new Date().toISOString(),
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  },
  professionalLinks: {},
  workExperience: [],
  education: [],
  skillsAndQualifications: {
    skills: [],
    certifications: [],
    languages: [],
  },
  workAuthorization: {
    authorizedToWork: false,
    requiresSponsorship: false,
  },
})
