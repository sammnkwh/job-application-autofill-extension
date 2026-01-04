// Personal Information form section - Midday style

import { Input } from '../ui/input'
import { FormField } from '../ui/form-field'
import { expandCountryName } from '@/lib/utils'
import type { Profile } from '../../types/profile'

interface PersonalInfoSectionProps {
  personalInfo: Profile['personalInfo']
  onChange: (updates: Partial<Profile['personalInfo']>) => void
}

export function PersonalInfoSection({ personalInfo, onChange }: PersonalInfoSectionProps) {
  const handleAddressChange = (field: keyof Profile['personalInfo']['address'], value: string) => {
    onChange({
      address: { ...personalInfo.address, [field]: value },
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#606060]">
        Your basic contact information for job applications.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="First Name"
          htmlFor="firstName"
          required
        >
          <Input
            id="firstName"
            value={personalInfo.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="John"
          />
        </FormField>
        <FormField
          label="Last Name"
          htmlFor="lastName"
          required
        >
          <Input
            id="lastName"
            value={personalInfo.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Doe"
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Email"
          htmlFor="email"
          required
        >
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john.doe@example.com"
          />
        </FormField>
        <FormField
          label="Phone"
          htmlFor="phone"
          required
        >
          <Input
            id="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </FormField>
      </div>

      <FormField
        label="Street Address"
        htmlFor="street"
      >
        <Input
          id="street"
          value={personalInfo.address.street}
          onChange={(e) => handleAddressChange('street', e.target.value)}
          placeholder="123 Main St, Apt 4"
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <FormField label="City" htmlFor="city">
          <Input
            id="city"
            value={personalInfo.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="San Francisco"
          />
        </FormField>
        <FormField label="State" htmlFor="state">
          <Input
            id="state"
            value={personalInfo.address.state?.toUpperCase() || ''}
            onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
            placeholder="CA"
          />
        </FormField>
        <FormField label="ZIP Code" htmlFor="zipCode">
          <Input
            id="zipCode"
            value={personalInfo.address.zipCode}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            placeholder="94102"
          />
        </FormField>
      </div>

      <FormField
        label="Country"
        htmlFor="country"
      >
        <Input
          id="country"
          value={expandCountryName(personalInfo.address.country)}
          onChange={(e) => handleAddressChange('country', expandCountryName(e.target.value))}
          placeholder="United States of America"
        />
      </FormField>
    </div>
  )
}
