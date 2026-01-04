// Chrome storage wrapper with encryption

import type { Profile } from '../types/profile'
import { logError } from './errorLogger'
import type { EncryptedData, Settings } from '../types/schema'
import {
  STORAGE_KEYS,
  STORAGE_QUOTA,
  DEFAULT_SETTINGS,
  CURRENT_SCHEMA_VERSION,
} from '../types/schema'
import {
  generateKey,
  exportKey,
  importKey,
  encryptObject,
  decryptObject,
} from './encryption'

// Storage result types
export interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface StorageUsage {
  bytesUsed: number
  bytesAvailable: number
  percentUsed: number
  isNearQuota: boolean
}

// Get or create encryption key
async function getOrCreateKey(): Promise<CryptoKey> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTION_KEY)
  const storedKey = result[STORAGE_KEYS.ENCRYPTION_KEY] as string | undefined

  if (storedKey) {
    return importKey(storedKey)
  }

  // Generate new key and store it
  const newKey = await generateKey()
  const exportedKey = await exportKey(newKey)
  await chrome.storage.local.set({ [STORAGE_KEYS.ENCRYPTION_KEY]: exportedKey })
  return newKey
}

// Save profile (encrypted)
export async function saveProfile(profile: Profile): Promise<StorageResult<void>> {
  try {
    const key = await getOrCreateKey()

    // Update lastUpdated and ensure schema version
    const updatedProfile: Profile = {
      ...profile,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
    }

    const encrypted = await encryptObject(updatedProfile, key)
    await chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: encrypted })

    return { success: true }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to save profile'), 'Storage: saveProfile')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save profile',
    }
  }
}

// Load profile (decrypted)
export async function loadProfile(): Promise<StorageResult<Profile>> {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.ENCRYPTION_KEY,
    ])

    const encryptedProfile = result[STORAGE_KEYS.PROFILE] as EncryptedData | undefined
    const storedKey = result[STORAGE_KEYS.ENCRYPTION_KEY] as string | undefined

    if (!encryptedProfile || !storedKey) {
      return {
        success: false,
        error: 'No profile found',
      }
    }

    const key = await importKey(storedKey)
    const profile = await decryptObject<Profile>(encryptedProfile, key)

    return { success: true, data: profile }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to load profile'), 'Storage: loadProfile')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load profile',
    }
  }
}

// Check if profile exists
export async function hasProfile(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILE)
  return !!result[STORAGE_KEYS.PROFILE]
}

// Delete profile
export async function deleteProfile(): Promise<StorageResult<void>> {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.PROFILE)
    return { success: true }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to delete profile'), 'Storage: deleteProfile')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete profile',
    }
  }
}

// Clear all extension data
export async function clearAllData(): Promise<StorageResult<void>> {
  try {
    await chrome.storage.local.clear()
    return { success: true }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to clear data'), 'Storage: clearAllData')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear data',
    }
  }
}

// Save settings
export async function saveSettings(settings: Partial<Settings>): Promise<StorageResult<void>> {
  try {
    const current = await loadSettings()
    const updated: Settings = {
      ...DEFAULT_SETTINGS,
      ...current.data,
      ...settings,
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated })
    return { success: true }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to save settings'), 'Storage: saveSettings')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save settings',
    }
  }
}

// Load settings
export async function loadSettings(): Promise<StorageResult<Settings>> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const settings = result[STORAGE_KEYS.SETTINGS] as Settings | undefined

    return {
      success: true,
      data: settings ?? DEFAULT_SETTINGS,
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to load settings'), 'Storage: loadSettings')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load settings',
    }
  }
}

// Get storage usage
export async function getStorageUsage(): Promise<StorageUsage> {
  // Get all storage data to calculate size
  const allData = await chrome.storage.local.get(null)
  const jsonString = JSON.stringify(allData)
  const bytesUsed = new Blob([jsonString]).size

  return {
    bytesUsed,
    bytesAvailable: STORAGE_QUOTA.MAX_BYTES - bytesUsed,
    percentUsed: (bytesUsed / STORAGE_QUOTA.MAX_BYTES) * 100,
    isNearQuota: bytesUsed >= STORAGE_QUOTA.WARNING_THRESHOLD_BYTES,
  }
}

// Export profile (for user backup)
export async function exportProfile(): Promise<StorageResult<string>> {
  const result = await loadProfile()
  if (!result.success || !result.data) {
    return { success: false, error: result.error ?? 'No profile to export' }
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: result.data,
  }

  return {
    success: true,
    data: JSON.stringify(exportData, null, 2),
  }
}

// Import profile (from user backup)
export async function importProfile(jsonString: string): Promise<StorageResult<void>> {
  try {
    const parsed = JSON.parse(jsonString)

    // Validate structure
    if (!parsed.profile || !parsed.profile.schemaVersion) {
      return { success: false, error: 'Invalid profile format' }
    }

    const profile = parsed.profile as Profile
    return saveProfile(profile)
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to import profile'), 'Storage: importProfile')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import profile',
    }
  }
}
