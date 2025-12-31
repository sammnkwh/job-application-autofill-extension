// Tests for the field mapping engine
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  fillAllFields,
  getPlatformConfig,
  getSupportedFields,
  previewFill,
} from './engine'
import { workdayConfig } from './workday'
import { greenhouseConfig } from './greenhouse'
import type { Profile } from '../types/profile'
import { createEmptyProfile } from '../types/profile'

// Helper to create a DOM container for testing
function createTestContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'test-container'
  document.body.appendChild(container)
  return container
}

// Helper to cleanup
function cleanup(): void {
  const container = document.getElementById('test-container')
  if (container) {
    container.remove()
  }
}

// Create a test profile with sample data
function createTestProfile(): Profile {
  const profile = createEmptyProfile()
  profile.personalInfo = {
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
  }
  profile.professionalLinks = {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
  }
  profile.workAuthorization = {
    authorizedToWork: true,
    requiresSponsorship: false,
    visaStatus: 'US Citizen',
  }
  profile.voluntarySelfIdentification = {
    gender: 'Male',
    ethnicity: 'White',
    veteranStatus: 'Not a Veteran',
    disabilityStatus: 'No',
  }
  return profile
}

describe('Platform Configurations', () => {
  describe('workdayConfig', () => {
    it('should have the correct platform', () => {
      expect(workdayConfig.platform).toBe('workday')
    })

    it('should have a version', () => {
      expect(workdayConfig.version).toBeDefined()
    })

    it('should have field mappings', () => {
      expect(workdayConfig.mappings.length).toBeGreaterThan(0)
    })

    it('should have mappings for essential personal info fields', () => {
      const fieldPaths = workdayConfig.mappings.map((m) => m.profileField)
      expect(fieldPaths).toContain('personalInfo.firstName')
      expect(fieldPaths).toContain('personalInfo.lastName')
      expect(fieldPaths).toContain('personalInfo.email')
      expect(fieldPaths).toContain('personalInfo.phone')
    })

    it('should have global selectors', () => {
      expect(workdayConfig.globalSelectors).toBeDefined()
      expect(workdayConfig.globalSelectors?.submitButton).toBeDefined()
    })
  })

  describe('greenhouseConfig', () => {
    it('should have the correct platform', () => {
      expect(greenhouseConfig.platform).toBe('greenhouse')
    })

    it('should have a version', () => {
      expect(greenhouseConfig.version).toBeDefined()
    })

    it('should have field mappings', () => {
      expect(greenhouseConfig.mappings.length).toBeGreaterThan(0)
    })

    it('should have mappings for essential personal info fields', () => {
      const fieldPaths = greenhouseConfig.mappings.map((m) => m.profileField)
      expect(fieldPaths).toContain('personalInfo.firstName')
      expect(fieldPaths).toContain('personalInfo.lastName')
      expect(fieldPaths).toContain('personalInfo.email')
      expect(fieldPaths).toContain('personalInfo.phone')
    })

    it('should have global selectors', () => {
      expect(greenhouseConfig.globalSelectors).toBeDefined()
      expect(greenhouseConfig.globalSelectors?.formContainer).toBeDefined()
    })
  })
})

describe('getPlatformConfig', () => {
  it('should return workday config for workday platform', () => {
    const config = getPlatformConfig('workday')
    expect(config).toBe(workdayConfig)
  })

  it('should return greenhouse config for greenhouse platform', () => {
    const config = getPlatformConfig('greenhouse')
    expect(config).toBe(greenhouseConfig)
  })
})

describe('getSupportedFields', () => {
  it('should return supported fields for workday', () => {
    const fields = getSupportedFields('workday')
    expect(fields.length).toBeGreaterThan(0)
    expect(fields).toContain('personalInfo.firstName')
  })

  it('should return supported fields for greenhouse', () => {
    const fields = getSupportedFields('greenhouse')
    expect(fields.length).toBeGreaterThan(0)
    expect(fields).toContain('personalInfo.firstName')
  })
})

describe('previewFill', () => {
  let container: HTMLElement
  let profile: Profile

  beforeEach(() => {
    container = createTestContainer()
    profile = createTestProfile()
  })

  afterEach(() => {
    cleanup()
  })

  it('should preview fill for workday form', () => {
    container.innerHTML = `
      <input data-automation-id="legalNameSection_firstName" type="text" />
      <input data-automation-id="legalNameSection_lastName" type="text" />
    `

    const preview = previewFill('workday', profile, container)

    const firstNamePreview = preview.find(
      (p) => p.profileField === 'personalInfo.firstName'
    )
    const lastNamePreview = preview.find(
      (p) => p.profileField === 'personalInfo.lastName'
    )

    expect(firstNamePreview?.found).toBe(true)
    expect(firstNamePreview?.value).toBe('John')
    expect(lastNamePreview?.found).toBe(true)
    expect(lastNamePreview?.value).toBe('Doe')
  })

  it('should preview fill for greenhouse form', () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
      <input id="last_name" type="text" />
      <input id="email" type="email" />
    `

    const preview = previewFill('greenhouse', profile, container)

    const firstNamePreview = preview.find(
      (p) => p.profileField === 'personalInfo.firstName'
    )
    const emailPreview = preview.find(
      (p) => p.profileField === 'personalInfo.email'
    )

    expect(firstNamePreview?.found).toBe(true)
    expect(emailPreview?.found).toBe(true)
    expect(emailPreview?.value).toBe('john.doe@example.com')
  })

  it('should indicate when fields are not found', () => {
    container.innerHTML = `
      <input id="unrelated" type="text" />
    `

    const preview = previewFill('greenhouse', profile, container)

    const firstNamePreview = preview.find(
      (p) => p.profileField === 'personalInfo.firstName'
    )

    expect(firstNamePreview?.found).toBe(false)
    expect(firstNamePreview?.value).toBe('John')
  })
})

describe('fillAllFields', () => {
  let container: HTMLElement
  let profile: Profile

  beforeEach(() => {
    container = createTestContainer()
    profile = createTestProfile()
  })

  afterEach(() => {
    cleanup()
  })

  it('should fill text fields in workday form', async () => {
    container.innerHTML = `
      <input data-automation-id="legalNameSection_firstName" type="text" />
      <input data-automation-id="legalNameSection_lastName" type="text" />
    `

    const result = await fillAllFields('workday', profile, { container })

    const firstNameInput = container.querySelector(
      '[data-automation-id="legalNameSection_firstName"]'
    ) as HTMLInputElement
    const lastNameInput = container.querySelector(
      '[data-automation-id="legalNameSection_lastName"]'
    ) as HTMLInputElement

    expect(firstNameInput.value).toBe('John')
    expect(lastNameInput.value).toBe('Doe')
    expect(result.filledFields).toBeGreaterThan(0)
  })

  it('should fill text fields in greenhouse form', async () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
      <input id="last_name" type="text" />
      <input id="email" type="email" />
    `

    const result = await fillAllFields('greenhouse', profile, { container })

    const firstNameInput = container.querySelector(
      '#first_name'
    ) as HTMLInputElement
    const lastNameInput = container.querySelector(
      '#last_name'
    ) as HTMLInputElement
    const emailInput = container.querySelector('#email') as HTMLInputElement

    expect(firstNameInput.value).toBe('John')
    expect(lastNameInput.value).toBe('Doe')
    expect(emailInput.value).toBe('john.doe@example.com')
    expect(result.filledFields).toBe(3)
  })

  it('should handle select fields in fill operation', async () => {
    // This test verifies the fill operation processes select fields without errors
    // Select field value matching is tested more thoroughly in real browser tests
    container.innerHTML = `
      <select id="gender" name="gender">
        <option value="">Select...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    `

    const result = await fillAllFields('greenhouse', profile, { container })

    // Verify the operation completes
    expect(result.platform).toBe('greenhouse')
    expect(result.results).toBeInstanceOf(Array)
    expect(result.totalFields).toBeGreaterThan(0)
  })

  it('should return operation result with statistics', async () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
    `

    const result = await fillAllFields('greenhouse', profile, { container })

    expect(result.platform).toBe('greenhouse')
    expect(result.totalFields).toBeGreaterThan(0)
    expect(result.duration).toBeGreaterThan(0)
    expect(result.results).toBeInstanceOf(Array)
  })

  it('should track failed fields when element not found', async () => {
    container.innerHTML = `
      <input id="unrelated" type="text" />
    `

    const result = await fillAllFields('greenhouse', profile, { container })

    expect(result.failedFields).toBeGreaterThan(0)
  })

  it('should skip fields with no profile value', async () => {
    const emptyProfile = createEmptyProfile()
    container.innerHTML = `
      <input id="first_name" type="text" />
    `

    const result = await fillAllFields('greenhouse', emptyProfile, { container })

    const firstNameInput = container.querySelector(
      '#first_name'
    ) as HTMLInputElement

    expect(firstNameInput.value).toBe('')
    expect(result.skippedFields).toBeGreaterThan(0)
  })

  it('should handle required fields only option', async () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
      <input name="linkedin" type="text" />
    `

    const result = await fillAllFields('greenhouse', profile, {
      container,
      requiredOnly: true,
    })

    // Only required fields should be processed
    expect(result.totalFields).toBeLessThan(
      greenhouseConfig.mappings.length
    )
  })
})

describe('Field Mapping Priorities', () => {
  it('should have higher priority for essential fields in workday', () => {
    const firstNameMapping = workdayConfig.mappings.find(
      (m) => m.profileField === 'personalInfo.firstName'
    )
    const linkedinMapping = workdayConfig.mappings.find(
      (m) => m.profileField === 'professionalLinks.linkedin'
    )
    const genderMapping = workdayConfig.mappings.find(
      (m) => m.profileField === 'selfIdentification.gender'
    )

    expect(firstNameMapping?.priority).toBeGreaterThan(linkedinMapping?.priority || 0)
    expect(linkedinMapping?.priority).toBeGreaterThan(genderMapping?.priority || 0)
  })

  it('should have higher priority for essential fields in greenhouse', () => {
    const emailMapping = greenhouseConfig.mappings.find(
      (m) => m.profileField === 'personalInfo.email'
    )
    const portfolioMapping = greenhouseConfig.mappings.find(
      (m) => m.profileField === 'professionalLinks.portfolio'
    )

    expect(emailMapping?.priority).toBeGreaterThan(portfolioMapping?.priority || 0)
  })
})

describe('Transform Functions', () => {
  it('should transform boolean to Yes/No for work authorization', () => {
    const authorizedMapping = workdayConfig.mappings.find(
      (m) => m.profileField === 'workAuthorization.authorized'
    )

    expect(authorizedMapping?.transform).toBeDefined()
    expect(authorizedMapping?.transform?.(true)).toBe('Yes')
    expect(authorizedMapping?.transform?.(false)).toBe('No')
  })

  it('should transform boolean to Yes/No for sponsorship', () => {
    const sponsorshipMapping = workdayConfig.mappings.find(
      (m) => m.profileField === 'workAuthorization.sponsorship'
    )

    expect(sponsorshipMapping?.transform).toBeDefined()
    expect(sponsorshipMapping?.transform?.(true)).toBe('Yes')
    expect(sponsorshipMapping?.transform?.(false)).toBe('No')
  })
})
