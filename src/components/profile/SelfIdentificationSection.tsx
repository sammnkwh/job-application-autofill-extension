// Voluntary Self-Identification form section (EEO) - Midday style

import { FormField } from '../ui/form-field'
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
    <div className="space-y-6">
      <p className="text-sm text-[#606060]">
        This information is used for Equal Employment Opportunity (EEO) reporting. Providing this information is voluntary and will not affect your application.
      </p>

      <div className="p-4 border border-[#e5e5e5] rounded-lg bg-[#fafafa]">
        <p className="text-sm text-[#606060]">
          This data is kept confidential and used only for compliance reporting. It will be stored locally and encrypted.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Gender"
          htmlFor="gender"
          required
        >
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
        </FormField>

        <FormField
          label="Race / Ethnicity"
          htmlFor="ethnicity"
          required
        >
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
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Veteran Status"
          htmlFor="veteranStatus"
          required
        >
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
        </FormField>

        <FormField
          label="Disability Status"
          htmlFor="disabilityStatus"
          required
        >
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
        </FormField>
      </div>
    </div>
  )
}
