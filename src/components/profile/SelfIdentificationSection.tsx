// Voluntary Self-Identification form section (EEO)

import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import type { Profile } from '../../types/profile'

interface SelfIdentificationSectionProps {
  selfId: Profile['voluntarySelfIdentification']
  onChange: (updates: Partial<Profile['voluntarySelfIdentification']>) => void
}

export function SelfIdentificationSection({
  selfId,
  onChange,
}: SelfIdentificationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voluntary Self-Identification</CardTitle>
        <CardDescription>
          This information is used for Equal Employment Opportunity (EEO) reporting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Providing this information is <strong>voluntary</strong> and will not affect your
            application. This data is kept confidential and used only for compliance reporting.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={selfId?.gender || ''}
            onValueChange={(value) => onChange({ gender: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or decline to answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non_binary">Non-Binary</SelectItem>
              <SelectItem value="decline">Decline to Self-Identify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ethnicity">Race / Ethnicity</Label>
          <Select
            value={selfId?.ethnicity || ''}
            onValueChange={(value) => onChange({ ethnicity: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or decline to answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="american_indian">American Indian or Alaska Native</SelectItem>
              <SelectItem value="asian">Asian</SelectItem>
              <SelectItem value="black">Black or African American</SelectItem>
              <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
              <SelectItem value="native_hawaiian">Native Hawaiian or Other Pacific Islander</SelectItem>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="two_or_more">Two or More Races</SelectItem>
              <SelectItem value="decline">Decline to Self-Identify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="veteranStatus">Veteran Status</Label>
          <Select
            value={selfId?.veteranStatus || ''}
            onValueChange={(value) => onChange({ veteranStatus: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or decline to answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_veteran">I am not a protected veteran</SelectItem>
              <SelectItem value="veteran">I identify as one or more of the protected veteran classifications</SelectItem>
              <SelectItem value="decline">Decline to Self-Identify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="disabilityStatus">Disability Status</Label>
          <Select
            value={selfId?.disabilityStatus || ''}
            onValueChange={(value) => onChange({ disabilityStatus: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select or decline to answer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, I have a disability (or previously had a disability)</SelectItem>
              <SelectItem value="no">No, I do not have a disability</SelectItem>
              <SelectItem value="decline">Decline to Self-Identify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          This information is stored locally and encrypted. It will only be used to
          auto-fill voluntary EEO forms during job applications.
        </p>
      </CardContent>
    </Card>
  )
}
