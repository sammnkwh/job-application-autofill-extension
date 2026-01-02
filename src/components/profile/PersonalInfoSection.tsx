// Personal Information form section - Midday style

import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
import { toTitleCase } from '@/lib/utils'
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
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your basic contact information for job applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <FormField
            label="First Name"
            htmlFor="firstName"
            required
          >
            <Input
              id="firstName"
              value={personalInfo.firstName}
              onChange={(e) => onChange({ firstName: toTitleCase(e.target.value) })}
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
              onChange={(e) => onChange({ lastName: toTitleCase(e.target.value) })}
              placeholder="Doe"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-8">
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

        <div className="grid grid-cols-3 gap-6">
          <FormField label="City" htmlFor="city">
            <Input
              id="city"
              value={personalInfo.address.city}
              onChange={(e) => handleAddressChange('city', toTitleCase(e.target.value))}
              placeholder="San Francisco"
            />
          </FormField>
          <FormField label="State" htmlFor="state">
            <Input
              id="state"
              value={personalInfo.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
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
            value={personalInfo.address.country}
            onChange={(e) => handleAddressChange('country', toTitleCase(e.target.value))}
            placeholder="United States"
          />
        </FormField>
      </CardContent>
    </Card>
  )
}
