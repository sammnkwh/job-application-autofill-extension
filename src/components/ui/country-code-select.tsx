// Country code selector dropdown with emoji flags

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'
import {
  COMMON_COUNTRIES,
  ALL_COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  findCountryByCode,
  type CountryCode,
} from '@/data/countryCodes'

interface CountryCodeSelectProps {
  value: string // ISO country code (e.g., "US")
  onChange: (countryCode: string) => void
  disabled?: boolean
  className?: string
}

export function CountryCodeSelect({
  value,
  onChange,
  disabled,
  className,
}: CountryCodeSelectProps) {
  const selectedCountry = findCountryByCode(value) || findCountryByCode(DEFAULT_COUNTRY_CODE)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={className}
        style={{ width: 100, minWidth: 100, flexShrink: 0 }}
        aria-label="Country code"
      >
        <SelectValue>
          {selectedCountry ? (
            <span className="flex items-center gap-1">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </span>
          ) : (
            <span>Select</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectGroup>
          <SelectLabel className="text-xs text-[#878787] font-medium">Common</SelectLabel>
          {COMMON_COUNTRIES.map((country) => (
            <CountryItem key={`common-${country.code}`} country={country} />
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel className="text-xs text-[#878787] font-medium">All Countries</SelectLabel>
          {ALL_COUNTRIES.map((country) => (
            <CountryItem key={`all-${country.code}`} country={country} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function CountryItem({ country }: { country: CountryCode }) {
  return (
    <SelectItem value={country.code} className="cursor-pointer">
      <span className="flex items-center gap-2">
        <span>{country.flag}</span>
        <span className="truncate">{country.name}</span>
        <span className="text-[#878787] ml-auto">{country.dialCode}</span>
      </span>
    </SelectItem>
  )
}

// Get the dial code for a given country code
export function getDialCode(countryCode: string): string {
  const country = findCountryByCode(countryCode)
  return country?.dialCode || '+1'
}
