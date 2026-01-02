// Professional Links form section - Midday style

import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
import type { Profile } from '../../types/profile'

interface ProfessionalLinksSectionProps {
  links: Profile['professionalLinks']
  onChange: (updates: Partial<Profile['professionalLinks']>) => void
}

export function ProfessionalLinksSection({ links, onChange }: ProfessionalLinksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Links</CardTitle>
        <CardDescription>
          Add your online profiles to help employers learn more about you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              placeholder="https://linkedin.com/in/yourprofile"
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
              placeholder="https://github.com/yourusername"
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
            placeholder="https://yourportfolio.com"
          />
        </FormField>
      </CardContent>
    </Card>
  )
}
