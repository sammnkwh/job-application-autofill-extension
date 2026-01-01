// Education form section - Midday style

import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { FormField } from '../ui/form-field'
import type { Profile, Education } from '../../types/profile'

interface EducationSectionProps {
  education: Profile['education']
  onAdd: (education: Education) => void
  onUpdate: (id: string, updates: Partial<Education>) => void
  onRemove: (id: string) => void
}

export function EducationSection({
  education,
  onAdd,
  onUpdate,
  onRemove,
}: EducationSectionProps) {
  const handleAddNew = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: undefined,
      gpa: undefined,
      honors: [],
    }
    onAdd(newEdu)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Education</CardTitle>
          <CardDescription>
            Add your educational background, starting with your highest degree.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          + Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.length === 0 ? (
          <div className="border border-[#e5e5e5] border-dashed rounded-lg py-12 text-center">
            <p className="text-base font-medium text-[#121212]">No education added</p>
            <p className="text-sm text-[#606060] mt-1">
              Click "+ Add" to add your educational history.
            </p>
          </div>
        ) : (
          education.map((edu, index) => (
            <EducationEntry
              key={edu.id}
              education={edu}
              index={index}
              onUpdate={(updates) => onUpdate(edu.id, updates)}
              onRemove={() => onRemove(edu.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
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
    <div className="border border-[#e5e5e5] rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-[#e5e5e5] pb-4 -mx-6 px-6 -mt-6 pt-4 bg-[#fafafa]">
        <h4 className="font-medium text-[#121212]">Education {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-[#606060] hover:text-red-600">
          Remove
        </Button>
      </div>

      <FormField
        label="Institution"
        htmlFor={`institution-${education.id}`}
        required
        helperText="The name of the school, college, or university."
      >
        <Input
          id={`institution-${education.id}`}
          value={education.institution}
          onChange={(e) => onUpdate({ institution: e.target.value })}
          placeholder="University of California, Berkeley"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Degree"
          htmlFor={`degree-${education.id}`}
          required
          helperText="Type of degree (e.g., Bachelor's, Master's)."
        >
          <Input
            id={`degree-${education.id}`}
            value={education.degree}
            onChange={(e) => onUpdate({ degree: e.target.value })}
            placeholder="Bachelor of Science"
          />
        </FormField>
        <FormField
          label="Field of Study"
          htmlFor={`fieldOfStudy-${education.id}`}
          helperText="Your major or area of concentration."
        >
          <Input
            id={`fieldOfStudy-${education.id}`}
            value={education.fieldOfStudy}
            onChange={(e) => onUpdate({ fieldOfStudy: e.target.value })}
            placeholder="Computer Science"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Start Date"
          htmlFor={`startDate-${education.id}`}
          helperText="When you started."
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
          helperText="When you graduated."
        >
          <Input
            id={`endDate-${education.id}`}
            type="date"
            value={education.endDate || ''}
            onChange={(e) => onUpdate({ endDate: e.target.value || undefined })}
          />
        </FormField>
        <FormField
          label="GPA"
          htmlFor={`gpa-${education.id}`}
          helperText="Optional. Your grade point average."
        >
          <Input
            id={`gpa-${education.id}`}
            value={education.gpa || ''}
            onChange={(e) => onUpdate({ gpa: e.target.value || undefined })}
            placeholder="3.8"
          />
        </FormField>
      </div>
    </div>
  )
}
