// Professional Links form section

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            value={links.linkedin || ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            value={links.github || ''}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio / Website</Label>
          <Input
            id="portfolio"
            type="url"
            value={links.portfolio || ''}
            onChange={(e) => onChange({ portfolio: e.target.value })}
            placeholder="https://yourportfolio.com"
          />
        </div>
      </CardContent>
    </Card>
  )
}
