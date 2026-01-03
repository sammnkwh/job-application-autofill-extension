// Work Authorization form section - Midday style

import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { FormField } from '../ui/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import type { Profile } from '../../types/profile'

interface WorkAuthorizationSectionProps {
  authorization: Profile['workAuthorization']
  onChange: (updates: Partial<Profile['workAuthorization']>) => void
}

export function WorkAuthorizationSection({
  authorization,
  onChange,
}: WorkAuthorizationSectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#606060]">
        Information about your legal ability to work in the United States.
      </p>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="authorizedToWork"
          checked={authorization.authorizedToWork}
          onCheckedChange={(checked) =>
            onChange({ authorizedToWork: checked === true })
          }
        />
        <Label htmlFor="authorizedToWork" className="font-normal text-sm text-[#121212]">
          I am authorized to work in the United States
        </Label>
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="requiresSponsorship"
          checked={authorization.requiresSponsorship}
          onCheckedChange={(checked) =>
            onChange({ requiresSponsorship: checked === true })
          }
        />
        <Label htmlFor="requiresSponsorship" className="font-normal text-sm text-[#121212]">
          I will require visa sponsorship now or in the future
        </Label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Visa Status"
          htmlFor="visaStatus"
        >
          <Select
            value={authorization.visaStatus || ''}
            onValueChange={(value) => onChange({ visaStatus: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visa status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citizen">U.S. Citizen</SelectItem>
              <SelectItem value="permanent_resident">Permanent Resident (Green Card)</SelectItem>
              <SelectItem value="h1b">H-1B Visa</SelectItem>
              <SelectItem value="l1">L-1 Visa</SelectItem>
              <SelectItem value="opt">OPT</SelectItem>
              <SelectItem value="cpt">CPT</SelectItem>
              <SelectItem value="ead">EAD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Citizenship Status"
          htmlFor="citizenshipStatus"
        >
          <Input
            id="citizenshipStatus"
            value={authorization.citizenshipStatus || ''}
            onChange={(e) => onChange({ citizenshipStatus: e.target.value || undefined })}
            placeholder="e.g., U.S. Citizen, Canadian Citizen"
          />
        </FormField>
      </div>
    </div>
  )
}
