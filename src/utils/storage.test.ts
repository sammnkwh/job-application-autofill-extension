import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveProfile,
  loadProfile,
  hasProfile,
  deleteProfile,
  clearAllData,
  saveSettings,
  loadSettings,
  getStorageUsage,
  exportProfile,
  importProfile,
} from './storage'
import { createEmptyProfile } from '../types/profile'
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../types/schema'

// In-memory storage mock
let mockStorage: Record<string, unknown> = {}

// Setup mock Chrome storage
beforeEach(() => {
  mockStorage = {}

  vi.mocked(chrome.storage.local.get).mockImplementation(async (keys) => {
    if (keys === null) {
      return mockStorage
    }
    if (typeof keys === 'string') {
      return { [keys]: mockStorage[keys] }
    }
    if (Array.isArray(keys)) {
      const result: Record<string, unknown> = {}
      for (const key of keys) {
        if (key in mockStorage) {
          result[key] = mockStorage[key]
        }
      }
      return result
    }
    return {}
  })

  vi.mocked(chrome.storage.local.set).mockImplementation(async (items) => {
    Object.assign(mockStorage, items)
  })

  vi.mocked(chrome.storage.local.remove).mockImplementation(async (keys) => {
    const keysArray = Array.isArray(keys) ? keys : [keys]
    for (const key of keysArray) {
      delete mockStorage[key]
    }
  })

  vi.mocked(chrome.storage.local.clear).mockImplementation(async () => {
    mockStorage = {}
  })
})

describe('storage', () => {
  describe('saveProfile / loadProfile', () => {
    it('should save and load a profile', async () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'John'
      profile.personalInfo.lastName = 'Doe'
      profile.personalInfo.email = 'john@example.com'

      const saveResult = await saveProfile(profile)
      expect(saveResult.success).toBe(true)

      const loadResult = await loadProfile()
      expect(loadResult.success).toBe(true)
      expect(loadResult.data?.personalInfo.firstName).toBe('John')
      expect(loadResult.data?.personalInfo.lastName).toBe('Doe')
      expect(loadResult.data?.personalInfo.email).toBe('john@example.com')
    })

    it('should encrypt profile data in storage', async () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'SecretName'

      await saveProfile(profile)

      // Check that the raw storage does not contain plaintext
      const stored = mockStorage[STORAGE_KEYS.PROFILE] as Record<string, unknown>
      expect(stored).toBeDefined()
      expect(stored.iv).toBeDefined() // Has IV
      expect(stored.data).toBeDefined() // Has encrypted data
      expect(JSON.stringify(stored)).not.toContain('SecretName')
    })

    it('should update lastUpdated timestamp on save', async () => {
      const profile = createEmptyProfile()
      const beforeSave = new Date().toISOString()

      await saveProfile(profile)
      const loadResult = await loadProfile()

      expect(loadResult.data?.lastUpdated).toBeDefined()
      expect(loadResult.data!.lastUpdated >= beforeSave).toBe(true)
    })

    it('should return error when loading non-existent profile', async () => {
      const result = await loadProfile()
      expect(result.success).toBe(false)
      expect(result.error).toBe('No profile found')
    })

    it('should preserve complex profile data', async () => {
      const profile = createEmptyProfile()
      profile.personalInfo = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1-555-123-4567',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
      }
      profile.workExperience = [
        {
          id: '1',
          jobTitle: 'Software Engineer',
          company: 'Tech Corp',
          location: { city: 'Remote', state: '', zipCode: '', country: '' },
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          isCurrent: false,
          description: 'Built stuff',
          responsibilities: ['Coding', 'Reviews'],
        },
      ]

      await saveProfile(profile)
      const loadResult = await loadProfile()

      expect(loadResult.data?.personalInfo).toEqual(profile.personalInfo)
      expect(loadResult.data?.workExperience).toHaveLength(1)
      expect(loadResult.data?.workExperience[0].jobTitle).toBe('Software Engineer')
    })
  })

  describe('hasProfile', () => {
    it('should return false when no profile exists', async () => {
      const result = await hasProfile()
      expect(result).toBe(false)
    })

    it('should return true after saving a profile', async () => {
      await saveProfile(createEmptyProfile())
      const result = await hasProfile()
      expect(result).toBe(true)
    })
  })

  describe('deleteProfile', () => {
    it('should delete an existing profile', async () => {
      await saveProfile(createEmptyProfile())
      expect(await hasProfile()).toBe(true)

      const result = await deleteProfile()
      expect(result.success).toBe(true)
      expect(await hasProfile()).toBe(false)
    })

    it('should succeed even if no profile exists', async () => {
      const result = await deleteProfile()
      expect(result.success).toBe(true)
    })
  })

  describe('clearAllData', () => {
    it('should clear all storage data', async () => {
      await saveProfile(createEmptyProfile())
      await saveSettings({ confidenceThreshold: 90 })

      const result = await clearAllData()
      expect(result.success).toBe(true)

      expect(await hasProfile()).toBe(false)
      const settingsResult = await loadSettings()
      expect(settingsResult.data).toEqual(DEFAULT_SETTINGS)
    })
  })

  describe('settings', () => {
    it('should return default settings when none saved', async () => {
      const result = await loadSettings()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(DEFAULT_SETTINGS)
    })

    it('should save and load settings', async () => {
      await saveSettings({ confidenceThreshold: 85 })

      const result = await loadSettings()
      expect(result.data?.confidenceThreshold).toBe(85)
    })

    it('should merge partial settings with defaults', async () => {
      await saveSettings({ confidenceThreshold: 75 })

      const result = await loadSettings()
      expect(result.data?.confidenceThreshold).toBe(75)
      expect(result.data?.schemaVersion).toBe(DEFAULT_SETTINGS.schemaVersion)
    })
  })

  describe('getStorageUsage', () => {
    it('should return storage usage info', async () => {
      const usage = await getStorageUsage()
      expect(usage.bytesUsed).toBeGreaterThanOrEqual(0)
      expect(usage.percentUsed).toBeGreaterThanOrEqual(0)
      expect(typeof usage.isNearQuota).toBe('boolean')
    })

    it('should increase after saving data', async () => {
      const usageBefore = await getStorageUsage()
      await saveProfile(createEmptyProfile())
      const usageAfter = await getStorageUsage()

      expect(usageAfter.bytesUsed).toBeGreaterThan(usageBefore.bytesUsed)
    })
  })

  describe('exportProfile / importProfile', () => {
    it('should export profile as JSON string', async () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'Export'
      await saveProfile(profile)

      const result = await exportProfile()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      const parsed = JSON.parse(result.data!)
      expect(parsed.exportedAt).toBeDefined()
      expect(parsed.profile.personalInfo.firstName).toBe('Export')
    })

    it('should return error when exporting non-existent profile', async () => {
      const result = await exportProfile()
      expect(result.success).toBe(false)
    })

    it('should import profile from JSON string', async () => {
      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          ...createEmptyProfile(),
          personalInfo: {
            ...createEmptyProfile().personalInfo,
            firstName: 'Imported',
          },
        },
      }

      const result = await importProfile(JSON.stringify(exportData))
      expect(result.success).toBe(true)

      const loadResult = await loadProfile()
      expect(loadResult.data?.personalInfo.firstName).toBe('Imported')
    })

    it('should reject invalid JSON', async () => {
      const result = await importProfile('not valid json')
      expect(result.success).toBe(false)
    })

    it('should reject invalid profile format', async () => {
      const result = await importProfile('{"foo": "bar"}')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid profile format')
    })

    it('should round-trip export and import', async () => {
      const profile = createEmptyProfile()
      profile.personalInfo.firstName = 'RoundTrip'
      profile.personalInfo.email = 'roundtrip@test.com'
      profile.workExperience = [
        {
          id: '1',
          jobTitle: 'Tester',
          company: 'Test Inc',
          location: { city: 'Remote', state: '', zipCode: '', country: '' },
          startDate: '2020-01-01',
          isCurrent: true,
          description: 'Testing',
          responsibilities: [],
        },
      ]

      await saveProfile(profile)
      const exported = await exportProfile()

      await clearAllData()
      expect(await hasProfile()).toBe(false)

      await importProfile(exported.data!)
      const loadResult = await loadProfile()

      expect(loadResult.data?.personalInfo.firstName).toBe('RoundTrip')
      expect(loadResult.data?.personalInfo.email).toBe('roundtrip@test.com')
      expect(loadResult.data?.workExperience[0].jobTitle).toBe('Tester')
    })
  })
})
