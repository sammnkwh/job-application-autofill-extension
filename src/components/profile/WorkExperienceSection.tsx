// Work Experience form section - Midday style

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'

// Trash bag icon
const TrashBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6c0-2 1.5-3 4-3s4 1 4 3" />
    <path d="M6 6h12l-1 14c-.1 1.1-1 2-2.1 2H9.1c-1.1 0-2-.9-2.1-2L6 6z" />
    <path d="M10 6v-1" />
    <path d="M14 6v-1" />
  </svg>
)


import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { FormField } from '../ui/form-field'
import type { Profile, WorkExperience } from '../../types/profile'

interface WorkExperienceSectionProps {
  experiences: Profile['workExperience']
  onAdd: (experience: WorkExperience) => void
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void
  onRemove: (id: string) => void
  showIncompleteHints?: boolean
}

export function WorkExperienceSection({
  experiences,
  onAdd,
  onUpdate,
  onRemove,
  showIncompleteHints = false,
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
      location: {
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#606060]">
          Add your professional work history, starting with your most recent position.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add
        </Button>
      </div>
      {experiences.length === 0 ? (
        <div
          className="border border-dashed rounded-none py-12 text-center"
          style={{
            borderColor: showIncompleteHints ? '#F59E0B' : '#e5e5e5',
            borderWidth: showIncompleteHints ? '2px' : '1px',
          }}
        >
          <p className="text-base font-medium text-[#121212]">No work experience added</p>
          <p className="text-sm text-[#606060] mt-1">
            Click "+ Add" to add your work history.
          </p>
          {showIncompleteHints && (
            <p className="text-sm text-[#9CA3AF] mt-2">
              Add at least one work experience entry
            </p>
          )}
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
        <button
          type="button"
          onClick={onRemove}
          className="text-[#878787] hover:text-red-600 transition-colors border-none bg-transparent p-0 cursor-pointer"
          title="Remove position"
        >
          <TrashBagIcon />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Job Title"
          htmlFor={`jobTitle-${experience.id}`}
          required
        >
          <Input
            id={`jobTitle-${experience.id}`}
            value={experience.jobTitle}
            onChange={(e) => onUpdate({ jobTitle: e.target.value })}
          />
        </FormField>
        <FormField
          label="Company"
          htmlFor={`company-${experience.id}`}
          required
        >
          <Input
            id={`company-${experience.id}`}
            value={experience.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="City"
          htmlFor={`city-${experience.id}`}
        >
          <Input
            id={`city-${experience.id}`}
            value={experience.location.city}
            onChange={(e) => onUpdate({ location: { ...experience.location, city: e.target.value } })}
          />
        </FormField>
        <FormField
          label="State"
          htmlFor={`state-${experience.id}`}
        >
          <Input
            id={`state-${experience.id}`}
            value={experience.location.state}
            onChange={(e) => onUpdate({ location: { ...experience.location, state: e.target.value } })}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Zip Code"
          htmlFor={`zipCode-${experience.id}`}
        >
          <Input
            id={`zipCode-${experience.id}`}
            value={experience.location.zipCode}
            onChange={(e) => onUpdate({ location: { ...experience.location, zipCode: e.target.value } })}
          />
        </FormField>
        <FormField
          label="Country"
          htmlFor={`country-${experience.id}`}
        >
          <Input
            id={`country-${experience.id}`}
            value={experience.location.country}
            onChange={(e) => onUpdate({ location: { ...experience.location, country: e.target.value } })}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Start Date"
          htmlFor={`startDate-${experience.id}`}
          required
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
          required={!experience.isCurrent}
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
          rows={4}
        />
      </FormField>
    </div>
  )
}
