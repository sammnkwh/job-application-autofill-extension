import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountryCodeSelect, getDialCode } from './country-code-select'

describe('CountryCodeSelect', () => {
  describe('rendering', () => {
    it('renders with default US value', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="US" onChange={onChange} />)

      // Should show the US flag and dial code in the trigger
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('🇺🇸')
      expect(trigger).toHaveTextContent('+1')
    })

    it('renders with UK value', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="GB" onChange={onChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('🇬🇧')
      expect(trigger).toHaveTextContent('+44')
    })

    it('renders with India value', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="IN" onChange={onChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('🇮🇳')
      expect(trigger).toHaveTextContent('+91')
    })

    it('falls back to US for invalid country code', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="INVALID" onChange={onChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveTextContent('🇺🇸')
      expect(trigger).toHaveTextContent('+1')
    })

    it('has aria-label for accessibility', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="US" onChange={onChange} />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-label', 'Country code')
    })

    it('can be disabled', () => {
      const onChange = vi.fn()
      render(<CountryCodeSelect value="US" onChange={onChange} disabled />)

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })
  })

  describe('getDialCode helper', () => {
    it('returns +1 for US', () => {
      expect(getDialCode('US')).toBe('+1')
    })

    it('returns +44 for GB', () => {
      expect(getDialCode('GB')).toBe('+44')
    })

    it('returns +49 for DE', () => {
      expect(getDialCode('DE')).toBe('+49')
    })

    it('returns +91 for IN', () => {
      expect(getDialCode('IN')).toBe('+91')
    })

    it('returns +1 for invalid country code', () => {
      expect(getDialCode('INVALID')).toBe('+1')
    })

    it('returns +233 for GH (Ghana)', () => {
      expect(getDialCode('GH')).toBe('+233')
    })

    it('returns +234 for NG (Nigeria)', () => {
      expect(getDialCode('NG')).toBe('+234')
    })
  })
})
