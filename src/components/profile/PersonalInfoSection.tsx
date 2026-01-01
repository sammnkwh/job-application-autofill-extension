// Personal Information form section - Midday style

import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
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
        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="First Name"
            htmlFor="firstName"
            required
            helperText="Your legal first name as it appears on documents."
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
            helperText="Your legal last name or surname."
          >
            <Input
              id="lastName"
              value={personalInfo.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Doe"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Email"
            htmlFor="email"
            required
            helperText="Your primary email for job communications."
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
            helperText="A phone number where recruiters can reach you."
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
          helperText="Your current street address including apartment number."
        >
          <Input
            id="street"
            value={personalInfo.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            placeholder="123 Main St, Apt 4"
          />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
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
          helperText="The country where you currently reside."
        >
          <Input
            id="country"
            value={personalInfo.address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            placeholder="United States"
          />
        </FormField>
      </CardContent>
    </Card>
  )
}
