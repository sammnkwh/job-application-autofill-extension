import { describe, it, expect } from 'vitest'
import {
  COMMON_COUNTRIES,
  ALL_COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  findCountryByCode,
  findCountryByDialCode,
  parsePhoneWithCountryCode,
  combinePhoneWithCountryCode,
} from './countryCodes'

describe('countryCodes', () => {
  describe('COMMON_COUNTRIES', () => {
    it('should have US as the first entry', () => {
      expect(COMMON_COUNTRIES[0].code).toBe('US')
      expect(COMMON_COUNTRIES[0].dialCode).toBe('+1')
      expect(COMMON_COUNTRIES[0].flag).toBe('🇺🇸')
    })

    it('should include expected common countries', () => {
      const codes = COMMON_COUNTRIES.map(c => c.code)
      expect(codes).toContain('US')
      expect(codes).toContain('CA')
      expect(codes).toContain('GB')
      expect(codes).toContain('AU')
      expect(codes).toContain('DE')
      expect(codes).toContain('FR')
      expect(codes).toContain('IN')
    })

    it('should have valid structure for all entries', () => {
      COMMON_COUNTRIES.forEach(country => {
        expect(country.code).toMatch(/^[A-Z]{2}$/)
        expect(country.name).toBeTruthy()
        expect(country.dialCode).toMatch(/^\+\d+$/)
        expect(country.flag).toBeTruthy()
      })
    })
  })

  describe('ALL_COUNTRIES', () => {
    it('should have a reasonable number of countries', () => {
      // Should have at least 200 countries
      expect(ALL_COUNTRIES.length).toBeGreaterThanOrEqual(200)
    })

    it('should include all common countries', () => {
      const allCodes = ALL_COUNTRIES.map(c => c.code)
      COMMON_COUNTRIES.forEach(common => {
        expect(allCodes).toContain(common.code)
      })
    })

    it('should have valid structure for all entries', () => {
      ALL_COUNTRIES.forEach(country => {
        expect(country.code).toMatch(/^[A-Z]{2}$/)
        expect(country.name).toBeTruthy()
        expect(country.dialCode).toMatch(/^\+\d+$/)
        expect(country.flag).toBeTruthy()
      })
    })

    it('should have no duplicate country codes', () => {
      const codes = ALL_COUNTRIES.map(c => c.code)
      const uniqueCodes = [...new Set(codes)]
      expect(codes.length).toBe(uniqueCodes.length)
    })
  })

  describe('DEFAULT_COUNTRY_CODE', () => {
    it('should be US', () => {
      expect(DEFAULT_COUNTRY_CODE).toBe('US')
    })
  })

  describe('findCountryByCode', () => {
    it('should find US by code', () => {
      const country = findCountryByCode('US')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United States')
      expect(country?.dialCode).toBe('+1')
    })

    it('should find GB by code', () => {
      const country = findCountryByCode('GB')
      expect(country).toBeDefined()
      expect(country?.name).toBe('United Kingdom')
      expect(country?.dialCode).toBe('+44')
    })

    it('should return undefined for invalid code', () => {
      const country = findCountryByCode('XX')
      expect(country).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const country = findCountryByCode('us')
      expect(country).toBeUndefined()
    })
  })

  describe('findCountryByDialCode', () => {
    it('should return US for +1 (not Canada)', () => {
      const country = findCountryByDialCode('+1')
      expect(country).toBeDefined()
      expect(country?.code).toBe('US')
    })

    it('should find UK by +44', () => {
      const country = findCountryByDialCode('+44')
      expect(country).toBeDefined()
      expect(country?.code).toBe('GB')
    })

    it('should find Germany by +49', () => {
      const country = findCountryByDialCode('+49')
      expect(country).toBeDefined()
      expect(country?.code).toBe('DE')
    })

    it('should find India by +91', () => {
      const country = findCountryByDialCode('+91')
      expect(country).toBeDefined()
      expect(country?.code).toBe('IN')
    })

    it('should return undefined for invalid dial code', () => {
      const country = findCountryByDialCode('+99999')
      expect(country).toBeUndefined()
    })
  })

  describe('parsePhoneWithCountryCode', () => {
    it('should parse US phone number with country code', () => {
      const result = parsePhoneWithCountryCode('+1 555-123-4567')
      expect(result.countryCode).toBe('+1')
      expect(result.phoneNumber).toBe('555-123-4567')
    })

    it('should parse UK phone number with country code', () => {
      const result = parsePhoneWithCountryCode('+44 20 7946 0958')
      expect(result.countryCode).toBe('+44')
      expect(result.phoneNumber).toBe('20 7946 0958')
    })

    it('should parse phone without space after country code', () => {
      const result = parsePhoneWithCountryCode('+15551234567')
      expect(result.countryCode).toBe('+1')
      expect(result.phoneNumber).toBe('5551234567')
    })

    it('should return empty country code for phone without country code prefix', () => {
      const result = parsePhoneWithCountryCode('555-123-4567')
      expect(result.countryCode).toBe('')
      expect(result.phoneNumber).toBe('555-123-4567')
    })

    it('should handle empty string', () => {
      const result = parsePhoneWithCountryCode('')
      expect(result.countryCode).toBe('')
      expect(result.phoneNumber).toBe('')
    })

    it('should handle whitespace-only string', () => {
      const result = parsePhoneWithCountryCode('   ')
      expect(result.countryCode).toBe('')
      expect(result.phoneNumber).toBe('')
    })

    it('should handle longer country codes correctly', () => {
      // American Samoa has +1684, should not be confused with +1
      const result = parsePhoneWithCountryCode('+1684 555-1234')
      expect(result.countryCode).toBe('+1684')
      expect(result.phoneNumber).toBe('555-1234')
    })

    it('should parse India phone number', () => {
      const result = parsePhoneWithCountryCode('+91 98765 43210')
      expect(result.countryCode).toBe('+91')
      expect(result.phoneNumber).toBe('98765 43210')
    })
  })

  describe('combinePhoneWithCountryCode', () => {
    it('should combine country code and phone number', () => {
      const result = combinePhoneWithCountryCode('+1', '555-123-4567')
      expect(result).toBe('+1 555-123-4567')
    })

    it('should handle UK phone number', () => {
      const result = combinePhoneWithCountryCode('+44', '20 7946 0958')
      expect(result).toBe('+44 20 7946 0958')
    })

    it('should trim whitespace from phone number', () => {
      const result = combinePhoneWithCountryCode('+1', '  555-123-4567  ')
      expect(result).toBe('+1 555-123-4567')
    })

    it('should preserve country code when phone number is empty', () => {
      const result = combinePhoneWithCountryCode('+1', '')
      expect(result).toBe('+1')
    })

    it('should preserve country code when phone number is whitespace-only', () => {
      const result = combinePhoneWithCountryCode('+1', '   ')
      expect(result).toBe('+1')
    })
  })
})
