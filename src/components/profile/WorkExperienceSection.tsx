// Work Experience form section - Midday style

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
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
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>
            Add your professional work history, starting with your most recent position.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <div className="border border-[#e5e5e5] border-dashed rounded-lg py-12 text-center">
            <p className="text-base font-medium text-[#121212]">No work experience added</p>
            <p className="text-sm text-[#606060] mt-1">
              Click "+ Add" to add your work history.
            </p>
          </div>
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

  // Sync when experience changes (e.g., from AI import)
  useEffect(() => {
    setResponsibilitiesText(experience.responsibilities.join('\n'))
  }, [experience.responsibilities])

  const handleResponsibilitiesChange = (text: string) => {
    setResponsibilitiesText(text)
    const lines = text.split('\n').filter((line) => line.trim())
    onUpdate({ responsibilities: lines })
  }

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-4 -mx-6 px-6 -mt-6 pt-4 bg-[#fafafa]">
        <h4 className="font-medium text-[#121212]">Position {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-[#606060] hover:text-red-600">
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Job Title"
          htmlFor={`jobTitle-${experience.id}`}
          required
          helperText="Your official job title or role."
        >
          <Input
            id={`jobTitle-${experience.id}`}
            value={experience.jobTitle}
            onChange={(e) => onUpdate({ jobTitle: e.target.value })}
            placeholder="Software Engineer"
          />
        </FormField>
        <FormField
          label="Company"
          htmlFor={`company-${experience.id}`}
          required
          helperText="The name of the organization."
        >
          <Input
            id={`company-${experience.id}`}
            value={experience.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
            placeholder="Acme Inc."
          />
        </FormField>
      </div>

      <FormField
        label="Location"
        htmlFor={`location-${experience.id}`}
        helperText="City and state/country where you worked."
      >
        <Input
          id={`location-${experience.id}`}
          value={experience.location}
          onChange={(e) => onUpdate({ location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Start Date"
          htmlFor={`startDate-${experience.id}`}
          helperText="When you started this position."
        >
          <Input
            id={`startDate-${experience.id}`}
            type="date"
            value={experience.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </FormField>
        <FormField
          label="End Date"
          htmlFor={`endDate-${experience.id}`}
          helperText={experience.isCurrent ? "Not applicable for current role." : "When you left this position."}
        >
          <Input
            id={`endDate-${experience.id}`}
            type="date"
            value={experience.endDate || ''}
            onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
            disabled={experience.isCurrent}
          />
        </FormField>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`current-${experience.id}`}
          checked={experience.isCurrent}
          onCheckedChange={(checked) =>
            onUpdate({ isCurrent: checked === true, endDate: checked ? undefined : experience.endDate })
          }
        />
        <Label htmlFor={`current-${experience.id}`} className="font-normal text-sm text-[#121212]">
          I currently work here
        </Label>
      </div>

      <FormField
        label="Description"
        htmlFor={`description-${experience.id}`}
        helperText="A brief summary of your role and achievements."
      >
        <Textarea
          id={`description-${experience.id}`}
          value={experience.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Brief description of your role..."
          rows={2}
        />
      </FormField>

      <FormField
        label="Key Responsibilities"
        htmlFor={`responsibilities-${experience.id}`}
        helperText="One responsibility per line. These will be used for autofill."
      >
        <Textarea
          id={`responsibilities-${experience.id}`}
          value={responsibilitiesText}
          onChange={(e) => handleResponsibilitiesChange(e.target.value)}
          placeholder="Led development of...&#10;Managed a team of...&#10;Improved performance by..."
          rows={4}
        />
      </FormField>
    </div>
  )
}
