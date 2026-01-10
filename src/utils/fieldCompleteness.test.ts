import { describe, it, expect } from 'vitest'
import {
  isFieldEmpty,
  getFieldDisplayName,
  calculateSectionCompleteness,
  getMissingSectionsForTooltip,
  getPersonalInfoCompleteness,
  hasProfessionalLink,
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
      expect(getFieldDisplayName('phone')).toBe('phone number')
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

    it('marks Personal Information as complete when all required fields are filled', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'
      profile.personalInfo.phone = '555-1234'
      profile.personalInfo.address.city = 'San Francisco'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.country = 'USA'

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(true)
      expect(personalInfo?.missingCount).toBe(0)
    })

    it('counts missing personal info fields correctly', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      // Missing: lastName, email, phone, city, state, country

      const sections = calculateSectionCompleteness(profile)
      const personalInfo = sections.find(s => s.name === 'Personal Information')

      expect(personalInfo?.complete).toBe(false)
      expect(personalInfo?.missingCount).toBe(6)
    })

    it('marks Professional Links as complete with at least one link', () => {
      const profile = createEmptyProfile()
      profile.professionalLinks.linkedin = 'https://linkedin.com/in/johndoe'

      const sections = calculateSectionCompleteness(profile)
      const links = sections.find(s => s.name === 'Professional Links')

      expect(links?.complete).toBe(true)
    })

    it('marks Work Experience as complete with at least one entry', () => {
      const profile = createEmptyProfile()
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Developer',
        company: 'Acme',
        location: 'SF',
        startDate: '2020-01-01',
        isCurrent: true,
        description: '',
        responsibilities: [],
      }]

      const sections = calculateSectionCompleteness(profile)
      const workExp = sections.find(s => s.name === 'Work Experience')

      expect(workExp?.complete).toBe(true)
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
      profile.personalInfo.phone = '555-1234'
      profile.personalInfo.address.city = 'SF'
      profile.personalInfo.address.state = 'CA'
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
      profile.personalInfo.phone = '555-1234'
      profile.personalInfo.address.city = 'SF'
      profile.personalInfo.address.state = 'CA'
      profile.personalInfo.address.country = 'USA'
      profile.professionalLinks.linkedin = 'https://linkedin.com'
      profile.workExperience = [{
        id: 'exp-1',
        jobTitle: 'Dev',
        company: 'Co',
        location: 'SF',
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
        location: '',
        startDate: '2016-01-01',
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
      expect(completeness.phone).toBe(false)
      expect(completeness.city).toBe(false)
      expect(completeness.state).toBe(false)
      expect(completeness.country).toBe(false)
    })

    it('returns true for filled fields', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.email = 'john@example.com'

      const completeness = getPersonalInfoCompleteness(profile)

      expect(completeness.firstName).toBe(true)
      expect(completeness.email).toBe(true)
      expect(completeness.lastName).toBe(false)
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
})
