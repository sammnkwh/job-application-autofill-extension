// Personal Information form section

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={personalInfo.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={personalInfo.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={personalInfo.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={personalInfo.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="San Francisco"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={personalInfo.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="CA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={personalInfo.address.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              placeholder="94102"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={personalInfo.address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            placeholder="United States"
          />
        </div>
      </CardContent>
    </Card>
  )
}
