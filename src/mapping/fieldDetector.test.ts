// Tests for field detection utilities
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  detectField,
  detectAllFields,
  isFieldInteractable,
  findAllFillableFields,
} from './fieldDetector'
import type { FieldMapping } from './types'

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

describe('detectField', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer()
  })

  afterEach(() => {
    cleanup()
  })

  it('should detect a field by primary selector', () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [{ selector: '#first_name' }],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.element?.id).toBe('first_name')
    expect(result.confidence).toBe('high')
    expect(result.detectedType).toBe('text')
  })

  it('should detect a field by fallback selector', () => {
    container.innerHTML = `
      <input name="firstName" type="text" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [
        {
          selector: '#first_name',
          fallbacks: ['input[name="firstName"]'],
        },
      ],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.element?.getAttribute('name')).toBe('firstName')
  })

  it('should detect a field by data-automation-id', () => {
    container.innerHTML = `
      <input data-automation-id="legalNameSection_firstName" type="text" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [
        { selector: '[data-automation-id="legalNameSection_firstName"]' },
      ],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.confidence).toBe('high')
  })

  it('should return null element when field not found', () => {
    container.innerHTML = `<input id="other_field" />`

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [{ selector: '#first_name' }],
    }

    const result = detectField(mapping, container)

    expect(result.element).toBeNull()
    expect(result.confidence).toBe('low')
  })

  it('should detect email field type', () => {
    container.innerHTML = `
      <input id="email" type="email" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.email',
      fieldType: 'email',
      selectors: [{ selector: '#email' }],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.detectedType).toBe('email')
    expect(result.confidence).toBe('high')
  })

  it('should detect select field type', () => {
    container.innerHTML = `
      <select id="country">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
      </select>
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.address.country',
      fieldType: 'select',
      selectors: [{ selector: '#country' }],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.detectedType).toBe('select')
  })

  it('should detect checkbox field type', () => {
    container.innerHTML = `
      <input id="terms" type="checkbox" />
    `

    const mapping: FieldMapping = {
      profileField: 'workAuthorization.authorized',
      fieldType: 'checkbox',
      selectors: [{ selector: '#terms' }],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.detectedType).toBe('checkbox')
  })

  it('should get current value of text field', () => {
    container.innerHTML = `
      <input id="first_name" type="text" value="John" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [{ selector: '#first_name' }],
    }

    const result = detectField(mapping, container)

    expect(result.currentValue).toBe('John')
  })

  it('should try multiple selectors in order', () => {
    container.innerHTML = `
      <input name="fn" type="text" />
    `

    const mapping: FieldMapping = {
      profileField: 'personalInfo.firstName',
      fieldType: 'text',
      selectors: [
        { selector: '#first_name' },
        { selector: '[data-automation-id="firstName"]' },
        { selector: 'input[name="fn"]' },
      ],
    }

    const result = detectField(mapping, container)

    expect(result.element).not.toBeNull()
    expect(result.element?.getAttribute('name')).toBe('fn')
  })
})

describe('detectAllFields', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer()
  })

  afterEach(() => {
    cleanup()
  })

  it('should detect multiple fields', () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
      <input id="last_name" type="text" />
      <input id="email" type="email" />
    `

    const mappings: FieldMapping[] = [
      {
        profileField: 'personalInfo.firstName',
        fieldType: 'text',
        selectors: [{ selector: '#first_name' }],
      },
      {
        profileField: 'personalInfo.lastName',
        fieldType: 'text',
        selectors: [{ selector: '#last_name' }],
      },
      {
        profileField: 'personalInfo.email',
        fieldType: 'email',
        selectors: [{ selector: '#email' }],
      },
    ]

    const results = detectAllFields(mappings, container)

    expect(results.size).toBe(3)
    expect(results.get('personalInfo.firstName')?.element).not.toBeNull()
    expect(results.get('personalInfo.lastName')?.element).not.toBeNull()
    expect(results.get('personalInfo.email')?.element).not.toBeNull()
  })

  it('should handle missing fields gracefully', () => {
    container.innerHTML = `
      <input id="first_name" type="text" />
    `

    const mappings: FieldMapping[] = [
      {
        profileField: 'personalInfo.firstName',
        fieldType: 'text',
        selectors: [{ selector: '#first_name' }],
      },
      {
        profileField: 'personalInfo.lastName',
        fieldType: 'text',
        selectors: [{ selector: '#last_name' }],
      },
    ]

    const results = detectAllFields(mappings, container)

    expect(results.size).toBe(2)
    expect(results.get('personalInfo.firstName')?.element).not.toBeNull()
    expect(results.get('personalInfo.lastName')?.element).toBeNull()
  })
})

describe('isFieldInteractable', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer()
  })

  afterEach(() => {
    cleanup()
  })

  it('should return true for a normal visible input field', () => {
    container.innerHTML = `<input id="test" type="text" />`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(true)
  })

  it('should return true for a normal visible select field', () => {
    container.innerHTML = `<select id="test"><option>Option</option></select>`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(true)
  })

  it('should return true for a normal visible textarea field', () => {
    container.innerHTML = `<textarea id="test"></textarea>`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(true)
  })

  it('should return false for a disabled field', () => {
    container.innerHTML = `<input id="test" type="text" disabled />`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(false)
  })

  it('should return false for a readonly field', () => {
    container.innerHTML = `<input id="test" type="text" readonly />`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(false)
  })

  it('should return false for a hidden field', () => {
    container.innerHTML = `<input id="test" type="text" style="display: none;" />`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(false)
  })

  it('should return false for visibility: hidden', () => {
    container.innerHTML = `<input id="test" type="text" style="visibility: hidden;" />`
    const element = container.querySelector('#test') as HTMLElement

    expect(isFieldInteractable(element)).toBe(false)
  })
})

describe('findAllFillableFields', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createTestContainer()
  })

  afterEach(() => {
    cleanup()
  })

  it('should find all text inputs', () => {
    container.innerHTML = `
      <input type="text" />
      <input type="email" />
      <input type="tel" />
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(3)
  })

  it('should find select elements', () => {
    container.innerHTML = `
      <select>
        <option>Option 1</option>
      </select>
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(1)
    expect(fields[0].tagName.toLowerCase()).toBe('select')
  })

  it('should find textarea elements', () => {
    container.innerHTML = `
      <textarea></textarea>
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(1)
    expect(fields[0].tagName.toLowerCase()).toBe('textarea')
  })

  it('should exclude hidden inputs', () => {
    container.innerHTML = `
      <input type="hidden" value="secret" />
      <input type="text" />
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(1)
  })

  it('should exclude submit buttons', () => {
    container.innerHTML = `
      <input type="submit" value="Submit" />
      <input type="button" value="Click" />
      <input type="text" />
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(1)
    expect(fields[0].getAttribute('type')).toBe('text')
  })

  it('should exclude disabled fields', () => {
    container.innerHTML = `
      <input type="text" disabled />
      <input type="text" />
    `

    const fields = findAllFillableFields(container)

    expect(fields.length).toBe(1)
    expect((fields[0] as HTMLInputElement).disabled).toBe(false)
  })
})
