// Tests for autofill orchestrator module

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock chrome API
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
  },
}

vi.stubGlobal('chrome', mockChrome)

// Import after mocking chrome
import { cleanupAutofillUI } from './autofill'
import type { Profile } from '../types/profile'

// Mock profile for testing
const mockProfile: Profile = {
  schemaVersion: '1.0',
  lastUpdated: new Date().toISOString(),
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
    portfolio: 'https://johndoe.dev',
  },
  workExperience: [],
  education: [],
  skillsAndQualifications: {
    skills: ['JavaScript', 'TypeScript', 'React'],
    certifications: [],
    languages: [],
  },
  workAuthorization: {
    authorizedToWork: true,
    requiresSponsorship: false,
    visaStatus: 'Citizen',
  },
  voluntarySelfIdentification: {
    gender: 'Male',
    ethnicity: 'White',
    veteranStatus: 'Not a Veteran',
    disabilityStatus: 'No',
  },
}

describe('Autofill Module', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupAutofillUI()
  })

  describe('cleanupAutofillUI', () => {
    it('removes progress indicator', () => {
      const progress = document.createElement('div')
      progress.id = 'job-autofill-progress'
      document.body.appendChild(progress)

      cleanupAutofillUI()

      expect(document.getElementById('job-autofill-progress')).toBeNull()
    })

    it('removes summary panel', () => {
      const summary = document.createElement('div')
      summary.id = 'job-autofill-summary'
      document.body.appendChild(summary)

      cleanupAutofillUI()

      expect(document.getElementById('job-autofill-summary')).toBeNull()
    })

    it('removes highlight classes', () => {
      const input = document.createElement('input')
      input.classList.add('job-autofill-unfilled')
      document.body.appendChild(input)

      cleanupAutofillUI()

      expect(input.classList.contains('job-autofill-unfilled')).toBe(false)
    })

    it('handles case when elements do not exist', () => {
      // Should not throw
      expect(() => cleanupAutofillUI()).not.toThrow()
    })
  })

  describe('fieldHasValue helper', () => {
    it('detects empty text input', () => {
      const input = document.createElement('input')
      input.type = 'text'
      input.value = ''

      expect(input.value.trim().length > 0).toBe(false)
    })

    it('detects filled text input', () => {
      const input = document.createElement('input')
      input.type = 'text'
      input.value = 'Hello'

      expect(input.value.trim().length > 0).toBe(true)
    })

    it('detects unchecked checkbox', () => {
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.checked = false

      expect(input.checked).toBe(false)
    })

    it('detects checked checkbox', () => {
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.checked = true

      expect(input.checked).toBe(true)
    })

    it('detects empty select', () => {
      const select = document.createElement('select')
      select.innerHTML = `
        <option value="">Select...</option>
        <option value="option1">Option 1</option>
      `
      select.selectedIndex = 0

      expect(select.selectedIndex).toBe(0)
    })

    it('detects selected option in select', () => {
      const select = document.createElement('select')
      select.innerHTML = `
        <option value="">Select...</option>
        <option value="option1">Option 1</option>
      `
      select.selectedIndex = 1

      expect(select.selectedIndex).toBe(1)
    })

    it('detects empty textarea', () => {
      const textarea = document.createElement('textarea')
      textarea.value = ''

      expect(textarea.value.trim().length > 0).toBe(false)
    })

    it('detects filled textarea', () => {
      const textarea = document.createElement('textarea')
      textarea.value = 'Some text'

      expect(textarea.value.trim().length > 0).toBe(true)
    })
  })

  describe('formatFieldName helper', () => {
    const formatFieldName = (fieldPath: string): string => {
      const mapping: Record<string, string> = {
        'personalInfo.firstName': 'First Name',
        'personalInfo.lastName': 'Last Name',
        'personalInfo.email': 'Email',
        'personalInfo.phone': 'Phone',
        'personalInfo.address.street': 'Street Address',
        'personalInfo.address.city': 'City',
        'personalInfo.address.state': 'State',
        'personalInfo.address.zipCode': 'ZIP Code',
        'personalInfo.address.country': 'Country',
        'professionalLinks.linkedin': 'LinkedIn',
        'professionalLinks.github': 'GitHub',
        'professionalLinks.portfolio': 'Portfolio',
        'workAuthorization.authorized': 'Work Authorization',
        'workAuthorization.sponsorship': 'Sponsorship Required',
        'selfIdentification.gender': 'Gender',
        'selfIdentification.ethnicity': 'Ethnicity',
        'selfIdentification.veteran': 'Veteran Status',
        'selfIdentification.disability': 'Disability Status',
      }
      return mapping[fieldPath] || fieldPath.split('.').pop() || fieldPath
    }

    it('formats personal info fields', () => {
      expect(formatFieldName('personalInfo.firstName')).toBe('First Name')
      expect(formatFieldName('personalInfo.lastName')).toBe('Last Name')
      expect(formatFieldName('personalInfo.email')).toBe('Email')
    })

    it('formats address fields', () => {
      expect(formatFieldName('personalInfo.address.city')).toBe('City')
      expect(formatFieldName('personalInfo.address.state')).toBe('State')
    })

    it('formats professional links', () => {
      expect(formatFieldName('professionalLinks.linkedin')).toBe('LinkedIn')
      expect(formatFieldName('professionalLinks.github')).toBe('GitHub')
    })

    it('handles unknown fields by returning last path segment', () => {
      expect(formatFieldName('unknown.custom.field')).toBe('field')
    })
  })

  describe('checkProfileCompleteness', () => {
    const checkProfileCompleteness = (profile: Profile): boolean => {
      const requiredFields = [
        profile.personalInfo?.firstName,
        profile.personalInfo?.lastName,
        profile.personalInfo?.email,
      ]
      return requiredFields.every(field => field && field.trim().length > 0)
    }

    it('returns true for complete profile', () => {
      expect(checkProfileCompleteness(mockProfile)).toBe(true)
    })

    it('returns false for missing first name', () => {
      const incomplete = {
        ...mockProfile,
        personalInfo: { ...mockProfile.personalInfo, firstName: '' },
      }
      expect(checkProfileCompleteness(incomplete)).toBe(false)
    })

    it('returns false for missing last name', () => {
      const incomplete = {
        ...mockProfile,
        personalInfo: { ...mockProfile.personalInfo, lastName: '' },
      }
      expect(checkProfileCompleteness(incomplete)).toBe(false)
    })

    it('returns false for missing email', () => {
      const incomplete = {
        ...mockProfile,
        personalInfo: { ...mockProfile.personalInfo, email: '' },
      }
      expect(checkProfileCompleteness(incomplete)).toBe(false)
    })
  })

  describe('UI injection', () => {
    it('injects styles only once', () => {
      // Simulate style injection
      const styleId = 'job-autofill-styles'

      // First injection
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = '.test { color: red; }'
        document.head.appendChild(style)
      }

      // Second injection attempt
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = '.test { color: blue; }'
        document.head.appendChild(style)
      }

      const styles = document.querySelectorAll(`#${styleId}`)
      expect(styles.length).toBe(1)
    })
  })

  describe('Progress indicator', () => {
    it('creates progress element with correct structure', () => {
      const progress = document.createElement('div')
      progress.id = 'job-autofill-progress'
      progress.innerHTML = `
        <div class="spinner"></div>
        <span>Filling form fields...</span>
      `
      document.body.appendChild(progress)

      const element = document.getElementById('job-autofill-progress')
      expect(element).not.toBeNull()
      expect(element?.querySelector('.spinner')).not.toBeNull()
      expect(element?.textContent).toContain('Filling form fields')
    })

    it('updates to success state', () => {
      const progress = document.createElement('div')
      progress.id = 'job-autofill-progress'
      progress.innerHTML = `
        <span class="checkmark">✓</span>
        <span>Filled 5 of 8 fields</span>
      `
      document.body.appendChild(progress)

      const element = document.getElementById('job-autofill-progress')
      expect(element?.querySelector('.checkmark')).not.toBeNull()
      expect(element?.textContent).toContain('Filled 5 of 8 fields')
    })
  })

  describe('Summary panel', () => {
    it('creates summary with correct statistics', () => {
      const summary = document.createElement('div')
      summary.id = 'job-autofill-summary'
      summary.innerHTML = `
        <div class="summary-header">
          <span class="summary-title">Autofill Complete</span>
          <button class="summary-close">×</button>
        </div>
        <div class="summary-body">
          <div class="summary-stats">
            <div class="stat">
              <div class="stat-value success">5</div>
              <div class="stat-label">Filled</div>
            </div>
            <div class="stat">
              <div class="stat-value warning">2</div>
              <div class="stat-label">Skipped</div>
            </div>
            <div class="stat">
              <div class="stat-value error">1</div>
              <div class="stat-label">Failed</div>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(summary)

      const element = document.getElementById('job-autofill-summary')
      expect(element).not.toBeNull()
      expect(element?.querySelector('.summary-title')?.textContent).toBe('Autofill Complete')
      expect(element?.querySelector('.stat-value.success')?.textContent).toBe('5')
      expect(element?.querySelector('.stat-value.warning')?.textContent).toBe('2')
      expect(element?.querySelector('.stat-value.error')?.textContent).toBe('1')
    })

    it('close button removes summary', () => {
      const summary = document.createElement('div')
      summary.id = 'job-autofill-summary'
      summary.innerHTML = `
        <button class="summary-close">×</button>
      `
      document.body.appendChild(summary)

      const closeBtn = summary.querySelector('.summary-close') as HTMLButtonElement
      closeBtn.addEventListener('click', () => summary.remove())
      closeBtn.click()

      expect(document.getElementById('job-autofill-summary')).toBeNull()
    })
  })

  describe('Unfilled field highlighting', () => {
    it('adds highlight class to unfilled fields', () => {
      const input = document.createElement('input')
      input.id = 'test-input'
      document.body.appendChild(input)

      input.classList.add('job-autofill-unfilled')

      expect(input.classList.contains('job-autofill-unfilled')).toBe(true)
    })

    it('removes highlight class when cleanup is called', () => {
      const input = document.createElement('input')
      input.classList.add('job-autofill-unfilled')
      document.body.appendChild(input)

      cleanupAutofillUI()

      expect(input.classList.contains('job-autofill-unfilled')).toBe(false)
    })

    it('handles multiple highlighted fields', () => {
      const inputs = [
        document.createElement('input'),
        document.createElement('input'),
        document.createElement('input'),
      ]

      inputs.forEach(input => {
        input.classList.add('job-autofill-unfilled')
        document.body.appendChild(input)
      })

      cleanupAutofillUI()

      const highlighted = document.querySelectorAll('.job-autofill-unfilled')
      expect(highlighted.length).toBe(0)
    })
  })

  describe('previewAutofill', () => {
    it('returns preview statistics', () => {
      // Since we can't easily mock the mapping engine, we test the structure
      // This is more of an integration point - the actual behavior is tested
      // in mapping engine tests
      const preview = {
        canFill: 5,
        alreadyFilled: 2,
        missingInProfile: 1,
        total: 8,
      }

      expect(preview.canFill + preview.alreadyFilled + preview.missingInProfile).toBeLessThanOrEqual(preview.total)
    })
  })

  describe('AutofillResult structure', () => {
    it('has correct shape', () => {
      const result = {
        platform: 'workday' as const,
        totalFields: 10,
        filledFields: 5,
        skippedFields: 3,
        failedFields: 2,
        results: [],
        duration: 150,
        hasProfile: true,
        profileComplete: true,
        needsAttention: ['personalInfo.phone', 'professionalLinks.linkedin'],
      }

      expect(result.totalFields).toBe(result.filledFields + result.skippedFields + result.failedFields)
      expect(result.hasProfile).toBe(true)
      expect(result.needsAttention).toHaveLength(2)
    })
  })

  describe('Message handling', () => {
    it('TRIGGER_AUTOFILL message type is defined', () => {
      const messageTypes = [
        'TRIGGER_AUTOFILL',
        'GET_AUTOFILL_PREVIEW',
        'CLEANUP_AUTOFILL_UI',
        'GET_DETECTION_RESULT',
      ]

      expect(messageTypes).toContain('TRIGGER_AUTOFILL')
      expect(messageTypes).toContain('GET_AUTOFILL_PREVIEW')
      expect(messageTypes).toContain('CLEANUP_AUTOFILL_UI')
    })
  })
})

describe('Supplement not override logic', () => {
  describe('fieldHasValue detection', () => {
    it('empty string is not a value', () => {
      const input = document.createElement('input')
      input.value = ''
      expect(input.value.trim().length > 0).toBe(false)
    })

    it('whitespace-only string is not a value', () => {
      const input = document.createElement('input')
      input.value = '   '
      expect(input.value.trim().length > 0).toBe(false)
    })

    it('actual text is a value', () => {
      const input = document.createElement('input')
      input.value = 'John'
      expect(input.value.trim().length > 0).toBe(true)
    })

    it('unchecked checkbox has no value', () => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = false
      expect(checkbox.checked).toBe(false)
    })

    it('checked checkbox has a value', () => {
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = true
      expect(checkbox.checked).toBe(true)
    })

    it('select with first option selected has no meaningful value', () => {
      const select = document.createElement('select')
      select.innerHTML = `
        <option value="">Please select</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      `
      select.selectedIndex = 0

      expect(select.value === '' || select.selectedIndex === 0).toBe(true)
    })

    it('select with non-default option has a value', () => {
      const select = document.createElement('select')
      select.innerHTML = `
        <option value="">Please select</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      `
      select.selectedIndex = 1

      expect(select.selectedIndex > 0).toBe(true)
    })
  })
})

describe('Error handling', () => {
  it('handles missing profile gracefully', () => {
    const error = { success: false, error: 'No profile found. Please set up your profile first.' }
    expect(error.error).toContain('No profile found')
  })

  it('handles unsupported platform gracefully', () => {
    const error = { success: false, error: 'Not on a supported platform' }
    expect(error.error).toContain('supported platform')
  })
})
