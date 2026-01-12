import { describe, it, expect } from 'vitest'
import {
  isFieldEmpty,
  getFieldDisplayName,
  calculateSectionCompleteness,
  getMissingSectionsForTooltip,
  getPersonalInfoCompleteness,
  hasProfessionalLink,
  getSelfIdentificationCompleteness,
} from './fieldCompleteness'
import { createEmptyProfile } from '../types/profile'

describe('fieldCompleteness', () => {
  describe('isFieldEmpty', () => {
    it('returns true for null', () => {
      expect(isFieldEmpty(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isFieldEmpty(undefined)).toBe(true)
    })

    it('returns true for empty string', () => {
      expect(isFieldEmpty('')).toBe(true)
    })

    it('returns true for whitespace-only string', () => {
      expect(isFieldEmpty('   ')).toBe(true)
    })

    it('returns false for non-empty string', () => {
      expect(isFieldEmpty('hello')).toBe(false)
    })

    it('returns true for empty array', () => {
      expect(isFieldEmpty([])).toBe(true)
    })

    it('returns false for non-empty array', () => {
      expect(isFieldEmpty(['item'])).toBe(false)
    })

    it('returns false for boolean values', () => {
      expect(isFieldEmpty(true)).toBe(false)
      expect(isFieldEmpty(false)).toBe(false)
    })
  })

  describe('getFieldDisplayName', () => {
    it('returns mapped display names for known fields', () => {
      expect(getFieldDisplayName('firstName')).toBe('first name')
      expect(getFieldDisplayName('lastName')).toBe('last name')
      expect(getFieldDisplayName('email')).toBe('email address')
      expect(getFieldDisplayName('countryCode')).toBe('country code')
      expect(getFieldDisplayName('phoneNumber')).toBe('phone number')
    })

    it('returns the field name for unknown fields', () => {
      expect(getFieldDisplayName('unknownField')).toBe('unknownField')
    })
  })

  describe('calculateSectionCompleteness', () => {
    it('returns all sections as incomplete for empty profile', () => {
      const profile = createEmptyProfile()
      const sections = calculateSectionCompleteness(profile)

      expect(sections.length).toBe(6)
      expect(sections.every(s => !s.complete)).toBe(true)
    })

    it('marks Personal Information as complete when all 10 required fields are filled', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '+1 555-1234' // Country code + phone number
      profile.personalInfo.address.street = '123 Main St'
      profile.personalInfo.address.city = 'San Francisco'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.zipCode = '94102'
      profile.personalInfo.address.country = 'USA'

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(true)
      expect(personalInfo?.missingCount).toBe(0)
    })

    it('counts missing personal info fields correctly (10 fields total)', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      // Missing: lastName, email, countryCode, phoneNumber, street, city, state, zipCode, country = 9 fields

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(false)
      expect(personalInfo?.missingCount).toBe(9)
    })

    it('requires country code for phone to be complete', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '555-1234' // No country code
      profile.personalInfo.address.street = '123 Main St'
      profile.personalInfo.address.city = 'San Francisco'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.zipCode = '94102'
      profile.personalInfo.address.country = 'USA'

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(false)
      expect(personalInfo?.missingCount).toBe(1) // Missing country code
    })

    it('requires phone number even with country code', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '+1' // Only country code, no phone number
      profile.personalInfo.address.street = '123 Main St'
      profile.personalInfo.address.city = 'San Francisco'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.zipCode = '94102'
      profile.personalInfo.address.country = 'USA'

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(false)
      expect(personalInfo?.missingCount).toBe(1) // Missing phone number
    })

    it('marks Professional Links as complete with at least one link', () => {
      const profile = createEmptyProfile()
      profile.professionalLinks.linkedin = 'https://linkedin.com/in/johndoe'

      const sections = calculateSectionCompleteness(profile)
      const links = sections.find(s => s.name === 'Professional Links')

      expect(links?.complete).toBe(true)
    })

    it('marks Work Experience as complete with at least one complete entry (current job)', () => {
      const profile = createEmptyProfile()
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Developer',
        company: 'Acme',
        location: { city: 'SF', state: 'CA', zipCode: '', country: '' },
        startDate: '2020-01-01',
        isCurrent: true,
        description: '',
        responsibilities: [],
      }]

      const sections = calculateSectionCompleteness(profile)
      const workExp = sections.find(s => s.name === 'Work Experience')

      expect(workExp?.complete).toBe(true)
    })

    it('marks Work Experience as complete with end date instead of isCurrent', () => {
      const profile = createEmptyProfile()
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Developer',
        company: 'Acme',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2020-01-01',
        endDate: '2023-06-01',
        isCurrent: false,
        description: '',
        responsibilities: [],
      }]

      const sections = calculateSectionCompleteness(profile)
      const workExp = sections.find(s => s.name === 'Work Experience')

      expect(workExp?.complete).toBe(true)
    })

    it('marks Work Experience as incomplete when entry has empty required fields', () => {
      const profile = createEmptyProfile()
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: '',
        company: '',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '',
        isCurrent: false,
        description: '',
        responsibilities: [],
      }]

      const sections = calculateSectionCompleteness(profile)
      const workExp = sections.find(s => s.name === 'Work Experience')

      expect(workExp?.complete).toBe(false)
      expect(workExp?.missingCount).toBe(4) // jobTitle, company, startDate, endDate
    })

    it('marks Work Experience as incomplete when missing end date and not current', () => {
      const profile = createEmptyProfile()
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Developer',
        company: 'Acme',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2020-01-01',
        isCurrent: false,
        description: '',
        responsibilities: [],
      }]

      const sections = calculateSectionCompleteness(profile)
      const workExp = sections.find(s => s.name === 'Work Experience')

      expect(workExp?.complete).toBe(false)
    })

    it('marks Education as complete with at least one complete entry (current)', () => {
      const profile = createEmptyProfile()
      profile.education = [{
        id: 'edu-1',
        institution: 'University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2016-01-01',
        isCurrent: true,
      }]

      const sections = calculateSectionCompleteness(profile)
      const education = sections.find(s => s.name === 'Education')

      expect(education?.complete).toBe(true)
    })

    it('marks Education as complete with end date instead of isCurrent', () => {
      const profile = createEmptyProfile()
      profile.education = [{
        id: 'edu-1',
        institution: 'University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2016-01-01',
        endDate: '2020-05-15',
        isCurrent: false,
      }]

      const sections = calculateSectionCompleteness(profile)
      const education = sections.find(s => s.name === 'Education')

      expect(education?.complete).toBe(true)
    })

    it('marks Education as incomplete when entry has empty required fields', () => {
      const profile = createEmptyProfile()
      profile.education = [{
        id: 'edu-1',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '',
      }]

      const sections = calculateSectionCompleteness(profile)
      const education = sections.find(s => s.name === 'Education')

      expect(education?.complete).toBe(false)
      expect(education?.missingCount).toBe(5) // institution, degree, fieldOfStudy, startDate, endDate
    })

    it('marks Education as incomplete when missing end date and not current', () => {
      const profile = createEmptyProfile()
      profile.education = [{
        id: 'edu-1',
        institution: 'University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2016-01-01',
        isCurrent: false,
      }]

      const sections = calculateSectionCompleteness(profile)
      const education = sections.find(s => s.name === 'Education')

      expect(education?.complete).toBe(false)
    })

    it('marks Skills as complete with 3 or more skills', () => {
      const profile = createEmptyProfile()
      profile.skillsAndQualifications.skills = ['JavaScript', 'Python', 'React']

      const sections = calculateSectionCompleteness(profile)
      const skills = sections.find(s => s.name === 'Skills')

      expect(skills?.complete).toBe(true)
    })

    it('counts missing skills correctly', () => {
      const profile = createEmptyProfile()
      profile.skillsAndQualifications.skills = ['JavaScript']

      const sections = calculateSectionCompleteness(profile)
      const skills = sections.find(s => s.name === 'Skills')

      expect(skills?.complete).toBe(false)
      expect(skills?.missingCount).toBe(2)
    })
  })

  describe('getMissingSectionsForTooltip', () => {
    it('returns only incomplete sections', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '+1 555-1234'
      profile.personalInfo.address.street = '123 Main St'
      profile.personalInfo.address.city = 'SF'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.zipCode = '94102'
      profile.personalInfo.address.country = 'USA'

      const missing = getMissingSectionsForTooltip(profile)

      // Personal Info is complete, so it shouldn't be in the list
      expect(missing.find(s => s.name === 'Personal Information')).toBeUndefined()
      // Other sections should be in the list
      expect(missing.length).toBeGreaterThan(0)
    })

    it('returns empty array for complete profile', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '+1 555-1234'
      profile.personalInfo.address.street = '123 Main St'
      profile.personalInfo.address.city = 'SF'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.zipCode = '94102'
      profile.personalInfo.address.country = 'USA'
      profile.professionalLinks.linkedin = 'https://linkedin.com'
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Dev',
        company: 'Co',
        location: { city: 'SF', state: 'CA', zipCode: '', country: '' },
        startDate: '2020-01-01',
        isCurrent: true,
        description: '',
        responsibilities: [],
      }]
      profile.education = [{
        id: 'edu-1',
        institution: 'Uni',
        degree: 'BS',
        fieldOfStudy: 'CS',
        location: { city: '', state: '', zipCode: '', country: '' },
        startDate: '2016-01-01',
        endDate: '2020-05-15',
      }]
      profile.skillsAndQualifications.skills = ['A', 'B', 'C']
      profile.workAuthorization.authorizedToWork = true

      const missing = getMissingSectionsForTooltip(profile)

      expect(missing.length).toBe(0)
    })
  })

  describe('getPersonalInfoCompleteness', () => {
    it('returns all false for empty profile', () => {
      const profile = createEmptyProfile()
      const completeness = getPersonalInfoCompleteness(profile)

      expect(completeness.firstName).toBe(false)
      expect(completeness.lastName).toBe(false)
      expect(completeness.email).toBe(false)
      expect(completeness.countryCode).toBe(false)
      expect(completeness.phoneNumber).toBe(false)
      expect(completeness.street).toBe(false)
      expect(completeness.city).toBe(false)
      expect(completeness.state).toBe(false)
      expect(completeness.zipCode).toBe(false)
      expect(completeness.country).toBe(false)
    })

    it('returns true for filled fields', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '+1 555-1234'

      const completeness = getPersonalInfoCompleteness(profile)

      expect(completeness.firstName).toBe(true)
      expect(completeness.email).toBe(true)
      expect(completeness.countryCode).toBe(true)
      expect(completeness.phoneNumber).toBe(true)
      expect(completeness.lastName).toBe(false)
    })

    it('returns countryCode false when phone has no country code', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.phone = '555-1234' // No country code

      const completeness = getPersonalInfoCompleteness(profile)

      expect(completeness.countryCode).toBe(false)
      expect(completeness.phoneNumber).toBe(true)
    })

    it('returns phoneNumber false when phone has only country code', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.phone = '+1' // Only country code

      const completeness = getPersonalInfoCompleteness(profile)

      expect(completeness.countryCode).toBe(true)
      expect(completeness.phoneNumber).toBe(false)
    })
  })

  describe('hasProfessionalLink', () => {
    it('returns false for empty profile', () => {
      const profile = createEmptyProfile()
      expect(hasProfessionalLink(profile)).toBe(false)
    })

    it('returns true when LinkedIn is filled', () => {
      const profile = createEmptyProfile()
      profile.professionalLinks.linkedin = 'https://linkedin.com/in/johndoe'
      expect(hasProfessionalLink(profile)).toBe(true)
    })

    it('returns true when GitHub is filled', () => {
      const profile = createEmptyProfile()
      profile.professionalLinks.github = 'https://github.com/johndoe'
      expect(hasProfessionalLink(profile)).toBe(true)
    })

    it('returns true when portfolio is filled', () => {
      const profile = createEmptyProfile()
      profile.professionalLinks.portfolio = 'https://johndoe.com'
      expect(hasProfessionalLink(profile)).toBe(true)
    })
  })

  describe('getSelfIdentificationCompleteness', () => {
    it('returns all false and 4 missing for empty profile', () => {
      const profile = createEmptyProfile()
      const completeness = getSelfIdentificationCompleteness(profile)

      expect(completeness.gender).toBe(false)
      expect(completeness.ethnicity).toBe(false)
      expect(completeness.veteranStatus).toBe(false)
      expect(completeness.disabilityStatus).toBe(false)
      expect(completeness.complete).toBe(false)
      expect(completeness.missingCount).toBe(4)
    })

    it('returns complete when all 4 fields are filled', () => {
      const profile = createEmptyProfile()
      profile.voluntarySelfIdentification = {
        gender: 'Male',
        ethnicity: 'White',
        veteranStatus: 'I am not a veteran',
        disabilityStatus: 'I do not have a disability',
      }
      const completeness = getSelfIdentificationCompleteness(profile)

      expect(completeness.gender).toBe(true)
      expect(completeness.ethnicity).toBe(true)
      expect(completeness.veteranStatus).toBe(true)
      expect(completeness.disabilityStatus).toBe(true)
      expect(completeness.complete).toBe(true)
      expect(completeness.missingCount).toBe(0)
    })

    it('counts missing fields correctly when partially filled', () => {
      const profile = createEmptyProfile()
      profile.voluntarySelfIdentification = {
        gender: 'Female',
        ethnicity: 'Hispanic or Latino',
      }
      const completeness = getSelfIdentificationCompleteness(profile)

      expect(completeness.gender).toBe(true)
      expect(completeness.ethnicity).toBe(true)
      expect(completeness.veteranStatus).toBe(false)
      expect(completeness.disabilityStatus).toBe(false)
      expect(completeness.complete).toBe(false)
      expect(completeness.missingCount).toBe(2)
    })

    it('handles "decline to answer" as a valid selection', () => {
      const profile = createEmptyProfile()
      profile.voluntarySelfIdentification = {
        gender: 'Decline to self-identify',
        ethnicity: 'Decline to self-identify',
        veteranStatus: 'Decline to self-identify',
        disabilityStatus: 'Decline to self-identify',
      }
      const completeness = getSelfIdentificationCompleteness(profile)

      expect(completeness.complete).toBe(true)
      expect(completeness.missingCount).toBe(0)
    })
  })
})
