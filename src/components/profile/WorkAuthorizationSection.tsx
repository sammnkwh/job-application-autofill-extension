// Work Authorization form section

import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
    <Card>
      <CardHeader>
        <CardTitle>Work Authorization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="authorizedToWork"
            checked={authorization.authorizedToWork}
            onCheckedChange={(checked) =>
              onChange({ authorizedToWork: checked === true })
            }
          />
          <Label htmlFor="authorizedToWork" className="font-normal">
            I am authorized to work in the United States
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requiresSponsorship"
            checked={authorization.requiresSponsorship}
            onCheckedChange={(checked) =>
              onChange({ requiresSponsorship: checked === true })
            }
          />
          <Label htmlFor="requiresSponsorship" className="font-normal">
            I will require visa sponsorship now or in the future
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visaStatus">Visa Status (if applicable)</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizenshipStatus">Citizenship Status</Label>
          <Input
            id="citizenshipStatus"
            value={authorization.citizenshipStatus || ''}
            onChange={(e) => onChange({ citizenshipStatus: e.target.value || undefined })}
            placeholder="e.g., U.S. Citizen, Canadian Citizen"
          />
        </div>
      </CardContent>
    </Card>
  )
}
