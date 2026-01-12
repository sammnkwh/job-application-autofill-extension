// Professional Links form section - Midday style

import { Input } from '../ui/input'
import { FormField } from '../ui/form-field'
import type { Profile } from '../../types/profile'

interface ProfessionalLinksSectionProps {
  links: Profile['professionalLinks']
  onChange: (updates: Partial<Profile['professionalLinks']>) => void
  showIncompleteHints?: boolean
}

export function ProfessionalLinksSection({
  links,
  onChange,
  showIncompleteHints = false,
}: ProfessionalLinksSectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#606060]">
        Add your online profiles to help employers learn more about you.
      </p>
      {showIncompleteHints && (
        <p className="text-sm text-[#9CA3AF]">
          Add at least one professional link (LinkedIn, GitHub, or Portfolio)
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="LinkedIn"
          htmlFor="linkedin"
        >
          <Input
            id="linkedin"
            type="url"
            value={links.linkedin || ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
          />
        </FormField>

        <FormField
          label="GitHub"
          htmlFor="github"
        >
          <Input
            id="github"
            type="url"
            value={links.github || ''}
            onChange={(e) => onChange({ github: e.target.value })}
          />
        </FormField>
      </div>

      <FormField
        label="Portfolio / Website"
        htmlFor="portfolio"
      >
        <Input
          id="portfolio"
          type="url"
          value={links.portfolio || ''}
          onChange={(e) => onChange({ portfolio: e.target.value })}
        />
      </FormField>
    </div>
  )
}
