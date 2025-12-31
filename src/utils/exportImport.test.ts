// Tests for export/import utilities

import { describe, it, expect } from 'vitest'
import {
  generateExportFilename,
  createExportData,
  validateImportData,
  extractProfile,
} from './exportImport'
import type { Profile } from '../types/profile'

// Mock profile for testing
const mockProfile: Profile = {
  schemaVersion: '1.0',
  lastUpdated: '2024-12-31T00:00:00.000Z',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
    },
  },
  professionalLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
  },
  workExperience: [],
  education: [],
  skillsAndQualifications: {
    skills: ['JavaScript', 'TypeScript'],
    certifications: [],
    languages: [],
  },
  workAuthorization: {
    authorizedToWork: true,
    requiresSponsorship: false,
  },
}

describe('Export/Import Utilities', () => {
  describe('generateExportFilename', () => {
    it('generates filename with current date', () => {
      const filename = generateExportFilename()
      expect(filename).toMatch(/^job-profile-\d{4}-\d{2}-\d{2}\.json$/)
    })

    it('uses ISO date format', () => {
      const filename = generateExportFilename()
      const dateMatch = filename.match(/job-profile-(\d{4}-\d{2}-\d{2})\.json/)
      expect(dateMatch).not.toBeNull()

      const date = new Date(dateMatch![1])
      expect(date.toString()).not.toBe('Invalid Date')
    })
  })

  describe('createExportData', () => {
    it('wraps profile with metadata', () => {
      const exportData = createExportData(mockProfile)

      expect(exportData.profile).toEqual(mockProfile)
      expect(exportData.version).toBe('1.0')
      expect(exportData.exportedAt).toBeDefined()
    })

    it('includes ISO timestamp', () => {
      const exportData = createExportData(mockProfile)

      expect(exportData.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('validateImportData', () => {
    it('validates correct import data', () => {
      const validData = JSON.stringify({
        exportedAt: '2024-12-31T00:00:00.000Z',
        version: '1.0',
        profile: mockProfile,
      })

      const result = validateImportData(validData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects invalid JSON', () => {
      const result = validateImportData('not valid json')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid JSON format. Please check the file contents.')
    })

    it('rejects non-object data', () => {
      const result = validateImportData('"just a string"')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Import data must be a JSON object.')
    })

    it('rejects missing profile field', () => {
      const result = validateImportData('{"version": "1.0"}')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing "profile" field in import data.')
    })

    it('rejects missing schemaVersion', () => {
      const data = JSON.stringify({
        profile: { personalInfo: { firstName: 'John' } },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing "schemaVersion" in profile.')
    })

    it('rejects invalid schemaVersion type', () => {
      const data = JSON.stringify({
        profile: { schemaVersion: 123, personalInfo: mockProfile.personalInfo },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('"schemaVersion" must be a string.')
    })

    it('rejects newer version than supported', () => {
      const data = JSON.stringify({
        profile: { ...mockProfile, schemaVersion: '99.0' },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('newer than supported')
    })

    it('warns about older version', () => {
      const data = JSON.stringify({
        profile: { ...mockProfile, schemaVersion: '0.5' },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
      expect(result.warnings.some(w => w.includes('older than current'))).toBe(true)
    })

    it('warns about missing personalInfo', () => {
      const data = JSON.stringify({
        profile: { schemaVersion: '1.0' },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing "personalInfo" section in profile.')
    })

    it('warns about missing required personal info fields', () => {
      const data = JSON.stringify({
        profile: {
          schemaVersion: '1.0',
          personalInfo: { phone: '555-1234' },
        },
      })
      const result = validateImportData(data)
      expect(result.warnings.some(w => w.includes('firstName'))).toBe(true)
      expect(result.warnings.some(w => w.includes('lastName'))).toBe(true)
      expect(result.warnings.some(w => w.includes('email'))).toBe(true)
    })

    it('rejects non-array workExperience', () => {
      const data = JSON.stringify({
        profile: {
          ...mockProfile,
          workExperience: 'not an array',
        },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('"workExperience" must be an array.')
    })

    it('rejects non-array education', () => {
      const data = JSON.stringify({
        profile: {
          ...mockProfile,
          education: { degree: 'BS' },
        },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('"education" must be an array.')
    })

    it('warns about invalid email format', () => {
      const data = JSON.stringify({
        profile: {
          ...mockProfile,
          personalInfo: {
            ...mockProfile.personalInfo,
            email: 'not-an-email',
          },
        },
      })
      const result = validateImportData(data)
      expect(result.warnings.some(w => w.includes('Email format'))).toBe(true)
    })

    it('accepts valid email format', () => {
      const data = JSON.stringify({
        profile: mockProfile,
      })
      const result = validateImportData(data)
      expect(result.warnings.filter(w => w.includes('Email'))).toHaveLength(0)
    })
  })

  describe('extractProfile', () => {
    it('extracts profile from export data', () => {
      const exportData = createExportData(mockProfile)
      const extracted = extractProfile(exportData)

      expect(extracted.personalInfo).toEqual(mockProfile.personalInfo)
      expect(extracted.professionalLinks).toEqual(mockProfile.professionalLinks)
      expect(extracted.schemaVersion).toBe(mockProfile.schemaVersion)
    })

    it('updates lastUpdated timestamp', () => {
      const exportData = createExportData(mockProfile)
      const before = new Date().toISOString()
      const extracted = extractProfile(exportData)
      const after = new Date().toISOString()

      expect(extracted.lastUpdated >= before).toBe(true)
      expect(extracted.lastUpdated <= after).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('handles empty profile arrays', () => {
      const data = JSON.stringify({
        profile: {
          ...mockProfile,
          workExperience: [],
          education: [],
        },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
    })

    it('handles null values gracefully', () => {
      const data = JSON.stringify({
        profile: {
          ...mockProfile,
          voluntarySelfIdentification: null,
        },
      })
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
    })

    it('handles undefined optional fields', () => {
      const minimalProfile = {
        schemaVersion: '1.0',
        lastUpdated: new Date().toISOString(),
        personalInfo: mockProfile.personalInfo,
        professionalLinks: {},
        workExperience: [],
        education: [],
        skillsAndQualifications: { skills: [], certifications: [], languages: [] },
        workAuthorization: { authorizedToWork: false, requiresSponsorship: false },
      }
      const data = JSON.stringify({ profile: minimalProfile })
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
    })
  })
})
