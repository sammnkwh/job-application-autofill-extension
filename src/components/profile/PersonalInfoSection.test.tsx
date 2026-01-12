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
      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
      expect(phoneInput).toBeInTheDocument()

      // Should have country code dropdown
      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toBeInTheDocument()
    })

    it('shows globe icon when phone is empty (no default country)', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '' })}
          onChange={onChange}
        />
      )

      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('🌐')
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

      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
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

      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
      expect(phoneInput).toHaveValue('20 7946 0958')
    })

    it('calls onChange with just phone number when country code is empty', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '' })}
          onChange={onChange}
        />
      )

      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
      fireEvent.change(phoneInput, { target: { value: '555-123-4567' } })

      // With no country code selected, just the phone number is stored
      expect(onChange).toHaveBeenCalledWith({ phone: '555-123-4567' })
    })

    it('shows globe icon when phone has no country code prefix', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '555-123-4567' })}
          onChange={onChange}
        />
      )

      // Should show globe icon (no country code detected)
      const countryCodeDropdown = screen.getByRole('combobox', { name: /country code/i })
      expect(countryCodeDropdown).toHaveTextContent('🌐')

      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
      expect(phoneInput).toHaveValue('555-123-4567')
    })

    it('preserves country code when phone number is cleared', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo({ phone: '+1 555-123-4567' })}
          onChange={onChange}
        />
      )

      const phoneInput = screen.getByRole('textbox', { name: /phone/i })
      fireEvent.change(phoneInput, { target: { value: '' } })

      // Country code is preserved when phone number is cleared
      expect(onChange).toHaveBeenCalledWith({ phone: '+1' })
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

      // Check for label-based fields (no placeholders now)
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
      // Use textbox role to distinguish from Country Code combobox
      const countryInput = screen.getByRole('textbox', { name: /country/i })
      expect(countryInput).toBeInTheDocument()
    })

    it('calls onChange when first name changes', () => {
      const onChange = vi.fn()
      render(
        <PersonalInfoSection
          personalInfo={createMockPersonalInfo()}
          onChange={onChange}
        />
      )

      const firstNameInput = screen.getByLabelText(/first name/i)
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

      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })

      expect(onChange).toHaveBeenCalledWith({ email: 'jane@example.com' })
    })
  })
})
