// Schema versioning constants and utilities

export const CURRENT_SCHEMA_VERSION = '1.0'

// Storage keys
export const STORAGE_KEYS = {
  PROFILE: 'profile',
  ENCRYPTION_KEY: 'encryptionKey',
  SETTINGS: 'settings',
} as const

// Schema version history for migrations
export const SCHEMA_VERSIONS = ['1.0'] as const

export type SchemaVersion = (typeof SCHEMA_VERSIONS)[number]

// Settings schema
export interface Settings {
  confidenceThreshold: number // 70-95, default 80
  schemaVersion: string
}

export const DEFAULT_SETTINGS: Settings = {
  confidenceThreshold: 80,
  schemaVersion: CURRENT_SCHEMA_VERSION,
}

// Encrypted data wrapper
export interface EncryptedData {
  iv: string // Base64 encoded initialization vector
  data: string // Base64 encoded encrypted data
  version: string // Schema version at time of encryption
}

// Storage quota constants
export const STORAGE_QUOTA = {
  WARNING_THRESHOLD_BYTES: 4 * 1024 * 1024, // 4MB
  MAX_BYTES: 5 * 1024 * 1024, // 5MB Chrome sync storage limit
} as const

// Helper to check if schema needs migration
export function needsMigration(version: string): boolean {
  return version !== CURRENT_SCHEMA_VERSION
}

// Helper to compare versions (returns -1, 0, or 1)
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    if (numA < numB) return -1
    if (numA > numB) return 1
  }
  return 0
}
