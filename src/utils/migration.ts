// Schema migration system

import type { Profile } from '../types/profile'
import {
  CURRENT_SCHEMA_VERSION,
  SCHEMA_VERSIONS,
  compareVersions,
  needsMigration,
} from '../types/schema'

// Migration function type
type MigrationFn = (data: unknown) => unknown

// Registry of migrations: { targetVersion: migrationFunction }
// Each migration upgrades from the previous version to the target version
const migrations: Record<string, MigrationFn> = {
  // Example migration for future versions:
  // '1.1': (data) => {
  //   const profile = data as ProfileV1_0
  //   return {
  //     ...profile,
  //     schemaVersion: '1.1',
  //     newField: 'defaultValue',
  //   }
  // },
}

// Get the list of migrations needed to go from current to target version
export function getMigrationsToRun(fromVersion: string): string[] {
  const migrationsToRun: string[] = []

  for (const version of SCHEMA_VERSIONS) {
    // Skip versions up to and including the current data version
    if (compareVersions(version, fromVersion) <= 0) {
      continue
    }
    // Add versions that have migrations and are <= target
    if (migrations[version] && compareVersions(version, CURRENT_SCHEMA_VERSION) <= 0) {
      migrationsToRun.push(version)
    }
  }

  return migrationsToRun
}

// Run all necessary migrations on profile data
export function migrateProfile(data: unknown): Profile {
  // Handle null/undefined
  if (!data) {
    throw new Error('Cannot migrate null or undefined data')
  }

  // Get current version from data
  const profile = data as { schemaVersion?: string }
  const currentVersion = profile.schemaVersion ?? '1.0'

  // Check if migration is needed
  if (!needsMigration(currentVersion)) {
    return data as Profile
  }

  // Get migrations to run
  const migrationsToRun = getMigrationsToRun(currentVersion)

  // Run migrations in sequence
  let migratedData: unknown = data
  for (const targetVersion of migrationsToRun) {
    const migrationFn = migrations[targetVersion]
    if (migrationFn) {
      migratedData = migrationFn(migratedData)
    }
  }

  // Ensure final version is set
  const finalProfile = migratedData as Profile
  finalProfile.schemaVersion = CURRENT_SCHEMA_VERSION

  return finalProfile
}

// Check if data needs migration
export function profileNeedsMigration(data: unknown): boolean {
  if (!data) return false
  const profile = data as { schemaVersion?: string }
  return needsMigration(profile.schemaVersion ?? '1.0')
}

// Validate that a profile has required fields
export function validateProfileStructure(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'] }
  }

  const profile = data as Record<string, unknown>

  // Check required top-level fields
  const requiredFields = [
    'schemaVersion',
    'lastUpdated',
    'personalInfo',
    'professionalLinks',
    'workExperience',
    'education',
    'skillsAndQualifications',
    'workAuthorization',
  ]

  for (const field of requiredFields) {
    if (!(field in profile)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Check personalInfo structure
  if (profile.personalInfo && typeof profile.personalInfo === 'object') {
    const personalInfo = profile.personalInfo as Record<string, unknown>
    const requiredPersonalFields = ['firstName', 'lastName', 'email', 'phone', 'address']
    for (const field of requiredPersonalFields) {
      if (!(field in personalInfo)) {
        errors.push(`Missing required field: personalInfo.${field}`)
      }
    }
  }

  // Check arrays are arrays
  if (profile.workExperience && !Array.isArray(profile.workExperience)) {
    errors.push('workExperience must be an array')
  }
  if (profile.education && !Array.isArray(profile.education)) {
    errors.push('education must be an array')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Create a migration from v1.0 to a hypothetical v1.1 (for testing)
export function registerMigration(version: string, fn: MigrationFn): void {
  migrations[version] = fn
}

// Clear all migrations (for testing)
export function clearMigrations(): void {
  for (const key of Object.keys(migrations)) {
    delete migrations[key]
  }
}
