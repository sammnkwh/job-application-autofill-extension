// Work Experience form section with dynamic add/remove

import { useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { Profile, WorkExperience } from '../../types/profile'

interface WorkExperienceSectionProps {
  experiences: Profile['workExperience']
  onAdd: (experience: WorkExperience) => void
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void
  onRemove: (id: string) => void
}

export function WorkExperienceSection({
  experiences,
  onAdd,
  onUpdate,
  onRemove,
}: WorkExperienceSectionProps) {
  const handleAddNew = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: undefined,
      isCurrent: false,
      description: '',
      responsibilities: [],
    }
    onAdd(newExp)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Experience</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No work experience added yet. Click "Add Experience" to start.
          </p>
        ) : (
          experiences.map((exp, index) => (
            <ExperienceEntry
              key={exp.id}
              experience={exp}
              index={index}
              onUpdate={(updates) => onUpdate(exp.id, updates)}
              onRemove={() => onRemove(exp.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface ExperienceEntryProps {
  experience: WorkExperience
  index: number
  onUpdate: (updates: Partial<WorkExperience>) => void
  onRemove: () => void
}

function ExperienceEntry({ experience, index, onUpdate, onRemove }: ExperienceEntryProps) {
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    experience.responsibilities.join('\n')
  )

  const handleResponsibilitiesChange = (text: string) => {
    setResponsibilitiesText(text)
    const lines = text.split('\n').filter((line) => line.trim())
    onUpdate({ responsibilities: lines })
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Position {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Title *</Label>
          <Input
            value={experience.jobTitle}
            onChange={(e) => onUpdate({ jobTitle: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label>Company *</Label>
          <Input
            value={experience.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          value={experience.location}
          onChange={(e) => onUpdate({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="month"
            value={experience.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="month"
            value={experience.endDate || ''}
            onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
            disabled={experience.isCurrent}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`current-${experience.id}`}
          checked={experience.isCurrent}
          onCheckedChange={(checked) =>
            onUpdate({ isCurrent: checked === true, endDate: checked ? undefined : experience.endDate })
          }
        />
        <Label htmlFor={`current-${experience.id}`} className="font-normal">
          I currently work here
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={experience.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description of your role..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Key Responsibilities (one per line)</Label>
        <Textarea
          value={responsibilitiesText}
          onChange={(e) => handleResponsibilitiesChange(e.target.value)}
          placeholder="Led development of..."
          rows={4}
        />
      </div>
    </div>
  )
}
