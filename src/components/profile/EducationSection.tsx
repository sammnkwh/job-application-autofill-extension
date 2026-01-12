// Education form section - Midday style

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
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { FormField } from '../ui/form-field'
import type { Profile, Education } from '../../types/profile'

interface EducationSectionProps {
  education: Profile['education']
  onAdd: (education: Education) => void
  onUpdate: (id: string, updates: Partial<Education>) => void
  onRemove: (id: string) => void
  showIncompleteHints?: boolean
}

export function EducationSection({
  education,
  onAdd,
  onUpdate,
  onRemove,
  showIncompleteHints = false,
}: EducationSectionProps) {
  // Sort education by endDate (most recent first)
  const sortedEducation = [...education].sort((a, b) => {
    if (!a.endDate && !b.endDate) return 0
    if (!a.endDate) return -1 // No end date = ongoing, put first
    if (!b.endDate) return 1
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  })

  const handleAddNew = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: {
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      startDate: '',
      endDate: undefined,
      gpa: undefined,
      honors: [],
    }
    onAdd(newEdu)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#606060]">
          Add your educational background, starting with your highest degree.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add
        </Button>
      </div>
      {education.length === 0 ? (
        <div
          className="border border-dashed rounded-none py-12 text-center"
          style={{
            borderColor: showIncompleteHints ? '#F59E0B' : '#e5e5e5',
            borderWidth: showIncompleteHints ? '2px' : '1px',
          }}
        >
          <p className="text-base font-medium text-[#121212]">No education added</p>
          <p className="text-sm text-[#606060] mt-1">
            Click "+ Add" to add your educational history.
          </p>
          {showIncompleteHints && (
            <p className="text-sm text-[#9CA3AF] mt-2">
              Add at least one education entry
            </p>
          )}
        </div>
      ) : (
        sortedEducation.map((edu, index) => (
          <EducationEntry
            key={edu.id}
            education={edu}
            index={index}
            onUpdate={(updates) => onUpdate(edu.id, updates)}
            onRemove={() => onRemove(edu.id)}
          />
        ))
      )}
    </div>
  )
}

interface EducationEntryProps {
  education: Education
  index: number
  onUpdate: (updates: Partial<Education>) => void
  onRemove: () => void
}

function EducationEntry({ education, index, onUpdate, onRemove }: EducationEntryProps) {
  return (
    <div className="border border-[#e5e5e5] rounded-none p-6 space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[#121212]">Education {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="border-none bg-transparent p-0 cursor-pointer"
          title="Remove education"
        >
          <TrashBagIcon />
        </button>
      </div>

      <FormField
        label="Institution"
        htmlFor={`institution-${education.id}`}
        required
      >
        <Input
          id={`institution-${education.id}`}
          value={education.institution}
          onChange={(e) => onUpdate({ institution: e.target.value })}
        />
      </FormField>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Degree"
          htmlFor={`degree-${education.id}`}
          required
        >
          <Input
            id={`degree-${education.id}`}
            value={education.degree}
            onChange={(e) => onUpdate({ degree: e.target.value })}
          />
        </FormField>
        <FormField
          label="Field of Study"
          htmlFor={`fieldOfStudy-${education.id}`}
        >
          <Input
            id={`fieldOfStudy-${education.id}`}
            value={education.fieldOfStudy}
            onChange={(e) => onUpdate({ fieldOfStudy: e.target.value })}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="City"
          htmlFor={`city-${education.id}`}
        >
          <Input
            id={`city-${education.id}`}
            value={education.location.city}
            onChange={(e) => onUpdate({ location: { ...education.location, city: e.target.value } })}
          />
        </FormField>
        <FormField
          label="State"
          htmlFor={`state-${education.id}`}
        >
          <Input
            id={`state-${education.id}`}
            value={education.location.state}
            onChange={(e) => onUpdate({ location: { ...education.location, state: e.target.value } })}
          />
        </FormField>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <FormField
          label="Zip Code"
          htmlFor={`zipCode-${education.id}`}
        >
          <Input
            id={`zipCode-${education.id}`}
            value={education.location.zipCode}
            onChange={(e) => onUpdate({ location: { ...education.location, zipCode: e.target.value } })}
          />
        </FormField>
        <FormField
          label="Country"
          htmlFor={`country-${education.id}`}
        >
          <Input
            id={`country-${education.id}`}
            value={education.location.country}
            onChange={(e) => onUpdate({ location: { ...education.location, country: e.target.value } })}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FormField
          label="Start Date"
          htmlFor={`startDate-${education.id}`}
          className="min-w-0"
        >
          <Input
            id={`startDate-${education.id}`}
            type="date"
            value={education.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
          />
        </FormField>
        <FormField
          label="End Date"
          htmlFor={`endDate-${education.id}`}
          helperText={education.isCurrent ? "Currently enrolled" : undefined}
          className="min-w-0"
        >
          {education.isCurrent ? (
            <div className="flex w-full items-center px-3 py-2 text-sm text-[#606060] bg-[#f5f5f5]" style={{ border: '1px solid #DCDAD2', boxSizing: 'border-box', height: 44 }}>
              Present
            </div>
          ) : (
            <Input
              id={`endDate-${education.id}`}
              type="date"
              value={education.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
            />
          )}
        </FormField>
        <FormField
          label="GPA"
          htmlFor={`gpa-${education.id}`}
          className="min-w-0"
        >
          <Input
            id={`gpa-${education.id}`}
            value={education.gpa || ''}
            onChange={(e) => onUpdate({ gpa: e.target.value || undefined })}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id={`current-${education.id}`}
          checked={education.isCurrent}
          onCheckedChange={(checked) =>
            onUpdate({ isCurrent: checked === true, endDate: checked ? undefined : education.endDate })
          }
        />
        <Label htmlFor={`current-${education.id}`} className="font-normal text-sm text-[#121212]">
          I currently attend here
        </Label>
      </div>
    </div>
  )
}
