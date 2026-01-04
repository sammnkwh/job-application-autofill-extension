// Work Experience form section - Midday style

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { FormField } from '../ui/form-field'
import { toTitleCase } from '@/lib/utils'
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
  // Sort experiences by startDate (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    // Current positions first
    if (a.isCurrent && !b.isCurrent) return -1
    if (!a.isCurrent && b.isCurrent) return 1
    // Then by start date (most recent first)
    if (!a.startDate && !b.startDate) return 0
    if (!a.startDate) return 1
    if (!b.startDate) return -1
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#606060]">
          Add your professional work history, starting with your most recent position.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add
        </Button>
      </div>
      {experiences.length === 0 ? (
        <div className="border border-[#e5e5e5] border-dashed rounded-none py-12 text-center">
          <p className="text-base font-medium text-[#121212]">No work experience added</p>
          <p className="text-sm text-[#606060] mt-1">
            Click "+ Add" to add your work history.
          </p>
        </div>
      ) : (
        sortedExperiences.map((exp, index) => (
          <ExperienceEntry
            key={exp.id}
            experience={exp}
            index={index}
            onUpdate={(updates) => onUpdate(exp.id, updates)}
            onRemove={() => onRemove(exp.id)}
          />
        ))
      )}
    </div>
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
    <div className="border border-[#e5e5e5] rounded-none p-6 space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#121212]">Position {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-[#878787] hover:text-red-600 hover:bg-red-50"
          title="Remove position"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Job Title"
          htmlFor={`jobTitle-${experience.id}`}
          required
        >
          <Input
            id={`jobTitle-${experience.id}`}
            value={toTitleCase(experience.jobTitle)}
            onChange={(e) => onUpdate({ jobTitle: toTitleCase(e.target.value) })}
            placeholder="Software Engineer"
          />
        </FormField>
        <FormField
          label="Company"
          htmlFor={`company-${experience.id}`}
          required
        >
          <Input
            id={`company-${experience.id}`}
            value={toTitleCase(experience.company)}
            onChange={(e) => onUpdate({ company: toTitleCase(e.target.value) })}
            placeholder="Acme Inc."
          />
        </FormField>
      </div>

      <FormField
        label="Location"
        htmlFor={`location-${experience.id}`}
      >
        <Input
          id={`location-${experience.id}`}
          value={toTitleCase(experience.location)}
          onChange={(e) => onUpdate({ location: toTitleCase(e.target.value) })}
          placeholder="San Francisco, CA"
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Start Date"
          htmlFor={`startDate-${experience.id}`}
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
          helperText={experience.isCurrent ? "Current position" : undefined}
        >
          {experience.isCurrent ? (
            <div className="flex h-11 w-full items-center px-3 py-2 text-sm text-[#606060] bg-[#f5f5f5]" style={{ border: '1px solid #DCDAD2' }}>
              Present
            </div>
          ) : (
            <Input
              id={`endDate-${experience.id}`}
              type="date"
              value={experience.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
            />
          )}
        </FormField>
      </div>

      <div className="flex items-center gap-3">
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
