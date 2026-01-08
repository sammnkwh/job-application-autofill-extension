import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonalInfoSection } from './PersonalInfoSection'
import type { Profile } from '../../types/profile'

describe('PersonalInfoSection', () => {
  const createMockPersonalInfo = (overrides: Partial<Profile['personalInfo']> = {}): Profile['personalInfo'] => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
    },
    ...overrides,
  })

  describe('Phone Field with Country Code', () => {
    it('renders phone field with country code dropdown', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo()}
          onChange={onChange}
        />
      )

      // Should have phone input
      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      expect(phoneInput).toBeInTheDocument()

      // Should have country code dropdown
      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toBeInTheDocument()
    })

    it('defaults to US country code when phone is empty', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '' })}
          onChange={onChange}
        />
      )

      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('🇺🇸')
      expect(countryCodeDropdown).toHaveTextContent('+1')
    })

    it('parses existing US phone number with country code', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '+1 555-123-4567' })}
          onChange={onChange}
        />
      )

      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('🇺🇸')
      expect(countryCodeDropdown).toHaveTextContent('+1')

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      expect(phoneInput).toHaveValue('555-123-4567')
    })

    it('parses existing UK phone number with country code', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '+44 20 7946 0958' })}
          onChange={onChange}
        />
      )

      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('🇬🇧')
      expect(countryCodeDropdown).toHaveTextContent('+44')

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      expect(phoneInput).toHaveValue('20 7946 0958')
    })

    it('calls onChange with combined phone when phone number changes', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '' })}
          onChange={onChange}
        />
      )

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      fireEvent.change(phoneInput, { target: { value: '555-123-4567' } })

      expect(onChange).toHaveBeenCalledWith({ phone: '+1 555-123-4567' })
    })

    it('preserves phone number when only phone is typed (no country code)', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '555-123-4567' })}
          onChange={onChange}
        />
      )

      // Should default to US and show the number
      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('+1')

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      expect(phoneInput).toHaveValue('555-123-4567')
    })

    it('returns empty string when phone number is cleared', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '+1 555-123-4567' })}
          onChange={onChange}
        />
      )

      const phoneInput = screen.getByPlaceholderText('(555) 123-4567')
      fireEvent.change(phoneInput, { target: { value: '' } })

      expect(onChange).toHaveBeenCalledWith({ phone: '' })
    })
  })

  describe('Other Fields', () => {
    it('renders all personal info fields', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo()}
          onChange={onChange}
        />
      )

      expect(screen.getByPlaceholderText('John')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('123 Main St, Apt 4')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('San Francisco')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('CA')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('94102')).toBeInTheDocument()
    })

    it('calls onChange when first name changes', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo()}
          onChange={onChange}
        />
      )

      const firstNameInput = screen.getByPlaceholderText('John')
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } })

      expect(onChange).toHaveBeenCalledWith({ firstName: 'Jane' })
    })

    it('calls onChange when email changes', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo()}
          onChange={onChange}
        />
      )

      const emailInput = screen.getByPlaceholderText('john.doe@example.com')
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })

      expect(onChange).toHaveBeenCalledWith({ email: 'jane@example.com' })
    })
  })
})
