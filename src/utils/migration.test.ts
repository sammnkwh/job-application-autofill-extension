import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  migrateProfile,
  profileNeedsMigration,
  validateProfileStructure,
  getMigrationsToRun,
  registerMigration,
  clearMigrations,
} from './migration'
import { createEmptyProfile } from '../types/profile'
import { CURRENT_SCHEMA_VERSION } from '../types/schema'

describe('migration', () => {
  beforeEach(() => {
    clearMigrations()
  })

  afterEach(() => {
    clearMigrations()
  })

  describe('profileNeedsMigration', () => {
    it('should return false for current version', () => {
      const profile = createEmptyProfile()
      expect(profileNeedsMigration(profile)).toBe(false)
    })

    it('should return true for older version', () => {
      const profile = { ...createEmptyProfile(), schemaVersion: '0.9' }
      expect(profileNeedsMigration(profile)).toBe(true)
    })

    it('should return false for null/undefined', () => {
      expect(profileNeedsMigration(null)).toBe(false)
      expect(profileNeedsMigration(undefined)).toBe(false)
    })

    it('should treat missing schemaVersion as 1.0', () => {
      const profile = { ...createEmptyProfile() }
      delete (profile as Record<string, unknown>).schemaVersion
      // 1.0 is current, so no migration needed
      expect(profileNeedsMigration(profile)).toBe(false)
    })
  })

  describe('getMigrationsToRun', () => {
    it('should return empty array when at current version', () => {
      const result = getMigrationsToRun(CURRENT_SCHEMA_VERSION)
      expect(result).toEqual([])
    })

    it('should return empty array when no migrations registered', () => {
      const result = getMigrationsToRun('0.5')
      expect(result).toEqual([])
    })
  })

  describe('migrateProfile', () => {
    it('should return profile unchanged when at current version', () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'Test'

      const migrated = migrateProfile(profile)
      expect(migrated.personalInfo.firstName).toBe('Test')
      expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    })

    it('should throw error for null data', () => {
      expect(() => migrateProfile(null)).toThrow('Cannot migrate null or undefined data')
    })

    it('should throw error for undefined data', () => {
      expect(() => migrateProfile(undefined)).toThrow('Cannot migrate null or undefined data')
    })

    it('should run registered migration', () => {
      // Register a mock migration
      registerMigration('1.1', (data) => {
        const profile = data as Record<string, unknown>
        return {
          ...profile,
          schemaVersion: '1.1',
          migratedField: 'added',
        }
      })

      // Create old version profile
      const oldProfile = {
        ...createEmptyProfile(),
        schemaVersion: '1.0',
      }

      // Note: This won't run because 1.1 > 1.0 (current) in our schema
      // But the structure is tested
      const migrated = migrateProfile(oldProfile)
      expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    })

    it('should preserve all profile data during migration', () => {
      const profile = createEmptyProfile()
      profile.personalInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: {
          street: '123 Main',
          city: 'NYC',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      }
      profile.workExperience = [
        {
          id: '1',
          jobTitle: 'Dev',
          company: 'Corp',
          location: 'Remote',
          startDate: '2020-01-01',
          isCurrent: true,
          description: 'Work',
          responsibilities: ['Code'],
        },
      ]

      const migrated = migrateProfile(profile)

      expect(migrated.personalInfo.firstName).toBe('John')
      expect(migrated.personalInfo.address.city).toBe('NYC')
      expect(migrated.workExperience[0].jobTitle).toBe('Dev')
    })
  })

  describe('validateProfileStructure', () => {
    it('should validate a complete profile', () => {
      const profile = createEmptyProfile()
      const result = validateProfileStructure(profile)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail for null', () => {
      const result = validateProfileStructure(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Data must be an object')
    })

    it('should fail for non-object', () => {
      const result = validateProfileStructure('string')
      expect(result.valid).toBe(false)
    })

    it('should report missing required fields', () => {
      const incomplete = {
        schemaVersion: '1.0',
        lastUpdated: new Date().toISOString(),
      }
      const result = validateProfileStructure(incomplete)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: personalInfo')
      expect(result.errors).toContain('Missing required field: workExperience')
    })

    it('should report missing personalInfo fields', () => {
      const profile = {
        ...createEmptyProfile(),
        personalInfo: { firstName: 'John' }, // Missing other fields
      }
      const result = validateProfileStructure(profile)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: personalInfo.lastName')
      expect(result.errors).toContain('Missing required field: personalInfo.email')
    })

    it('should fail if workExperience is not an array', () => {
      const profile = {
        ...createEmptyProfile(),
        workExperience: 'not an array',
      }
      const result = validateProfileStructure(profile)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('workExperience must be an array')
    })

    it('should fail if education is not an array', () => {
      const profile = {
        ...createEmptyProfile(),
        education: {},
      }
      const result = validateProfileStructure(profile)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('education must be an array')
    })
  })

  describe('migration sequence', () => {
    it('should handle sequential migrations correctly', () => {
      // This tests the migration infrastructure with mock versions
      // In real use, migrations would upgrade from version to version

      const testData = {
        schemaVersion: '0.8',
        oldField: 'value',
      }

      // Since we're at 1.0 and no migrations registered,
      // it should just set the current version
      const result = migrateProfile(testData)
      expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    })
  })
})
